import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Country, logAdminAction, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Globe, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Users,
  Settings,
  RefreshCw,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Flag,
  Image,
  Languages,
  Tag
} from 'lucide-react';

interface CountryWithStats extends Country {
  consultant_count?: number;
  client_count?: number;
  total_revenue?: number;
}

interface ConsultantAssignment {
  id: string;
  consultant_id: string;
  country_id: string;
  is_primary: boolean;
  status: string;
  consultant: {
    full_name: string;
    email: string;
  };
}

const CountryManagement = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<CountryWithStats[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<ConsultantAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState<CountryWithStats | null>(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryWithStats | null>(null);
  const [selectedCountryForAssignment, setSelectedCountryForAssignment] = useState<CountryWithStats | null>(null);
  const [availableConsultants, setAvailableConsultants] = useState<any[]>([]);

  const [countryForm, setCountryForm] = useState({
    name: '',
    slug: '',
    flag_emoji: '',
    description: '',
    image_url: '',
    primary_language: 'en',
    supported_languages: ['en'],
    highlights: [''],
    tags: [''],
    is_active: true
  });

  useEffect(() => {
    if (profile?.legacy_role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchConsultants(),
        fetchAssignments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Enrich with stats
    const enrichedCountries = await Promise.all(
      (data || []).map(async (country) => {
        // Get consultant count
        const { count: consultantCount } = await supabase
          .from('consultant_country_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('country_id', country.id)
          .eq('status', 'active');

        return {
          ...country,
          consultant_count: consultantCount || 0
        } as CountryWithStats;
      })
    );

    setCountries(enrichedCountries);
  };

  const fetchConsultants = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, country')
      .eq('legacy_role', 'consultant')
      .eq('is_active', true);

    if (error) throw error;
    setConsultants(data || []);
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('consultant_country_assignments')
      .select(`
        *,
        consultant:consultant_id (
          full_name,
          email
        )
      `);

    if (error) throw error;
    setAssignments(data || []);
  };

  const fetchAvailableConsultants = async (countryId: string) => {
    // Get all consultants
    const { data: allConsultants, error: consultantsError } = await supabase
      .from('profiles')
      .select('id, full_name, email, country')
      .eq('role', 'consultant')
      .eq('is_active', true);

    if (consultantsError) throw consultantsError;

    // Get already assigned consultants for this country
    const { data: assignedConsultants, error: assignedError } = await supabase
      .from('consultant_country_assignments')
      .select('consultant_id')
      .eq('country_id', countryId)
      .eq('status', 'active');

    if (assignedError) throw assignedError;

    const assignedIds = (assignedConsultants || []).map(a => a.consultant_id);
    const available = (allConsultants || []).filter(c => !assignedIds.includes(c.id));
    
    setAvailableConsultants(available);
  };

  const handleSubmitCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const countryData = {
        ...countryForm,
        supported_languages: countryForm.supported_languages.filter(lang => lang.trim() !== ''),
        highlights: countryForm.highlights.filter(h => h.trim() !== ''),
        tags: countryForm.tags.filter(t => t.trim() !== '')
      };

      if (editingCountry) {
        const { error } = await supabase
          .from('countries')
          .update(countryData)
          .eq('id', editingCountry.id);
        
        if (error) throw error;
        await logAdminAction('UPDATE_COUNTRY', 'countries', editingCountry.id, editingCountry, countryData);
      } else {
        const { error } = await supabase
          .from('countries')
          .insert([countryData]);
        
        if (error) throw error;
        await logAdminAction('CREATE_COUNTRY', 'countries', null, null, countryData);
      }

      await fetchCountries();
      resetForm();
      alert('Country saved successfully!');
    } catch (error) {
      console.error('Error saving country:', error);
      alert('Failed to save country: ' + (error as Error).message);
    }
  };

  const handleDeleteCountry = async (countryId: string) => {
    if (!confirm('Are you sure you want to delete this country? This will also remove all consultant assignments.')) {
      return;
    }

    try {
      const countryToDelete = countries.find(c => c.id === countryId);
      
      const { error } = await supabase
        .from('countries')
        .delete()
        .eq('id', countryId);

      if (error) throw error;
      
      await logAdminAction('DELETE_COUNTRY', 'countries', countryId, countryToDelete, null);
      await fetchCountries();
      alert('Country deleted successfully!');
    } catch (error) {
      console.error('Error deleting country:', error);
      alert('Failed to delete country');
    }
  };

  const handleAssignConsultant = async (consultantId: string, countryId: string, isPrimary: boolean = false) => {
    try {
      const { error } = await supabase
        .from('consultant_country_assignments')
        .insert([{
          consultant_id: consultantId,
          country_id: countryId,
          is_primary: isPrimary,
          status: 'active'
        }]);

      if (error) throw error;
      
      await logAdminAction('ASSIGN_CONSULTANT', 'consultant_country_assignments', null, null, { consultantId, countryId, isPrimary });
      await fetchAssignments();
      await fetchCountries(); // Refresh country stats
      alert('Consultant assigned successfully!');
    } catch (error) {
      console.error('Error assigning consultant:', error);
      alert('Failed to assign consultant');
    }
  };

  const handleRemoveConsultantAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this consultant assignment?')) return;

    try {
      const assignmentToRemove = assignments.find(a => a.id === assignmentId);
      
      const { error } = await supabase
        .from('consultant_country_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      await logAdminAction('REMOVE_CONSULTANT_ASSIGNMENT', 'consultant_country_assignments', assignmentId, assignmentToRemove, null);
      await fetchAssignments();
      await fetchCountries(); // Refresh country stats
      alert('Consultant assignment removed successfully!');
    } catch (error) {
      console.error('Error removing consultant assignment:', error);
      alert('Failed to remove consultant assignment');
    }
  };

  const handleOpenAssignmentModal = async (country: CountryWithStats) => {
    setSelectedCountryForAssignment(country);
    await fetchAvailableConsultants(country.id);
    setShowAssignmentModal(true);
  };

  const handleEdit = (country: CountryWithStats) => {
    setEditingCountry(country);
    setCountryForm({
      name: country.name,
      slug: country.slug,
      flag_emoji: country.flag_emoji || '',
      description: country.description || '',
      image_url: country.image_url || '',
      primary_language: country.primary_language,
      supported_languages: country.supported_languages,
      highlights: country.highlights.length > 0 ? country.highlights : [''],
      tags: country.tags.length > 0 ? country.tags : [''],
      is_active: country.is_active
    });
    setShowCountryModal(true);
  };

  const resetForm = () => {
    setCountryForm({
      name: '',
      slug: '',
      flag_emoji: '',
      description: '',
      image_url: '',
      primary_language: 'en',
      supported_languages: ['en'],
      highlights: [''],
      tags: [''],
      is_active: true
    });
    setEditingCountry(null);
    setShowCountryModal(false);
  };

  const addArrayField = (field: 'supported_languages' | 'highlights' | 'tags') => {
    setCountryForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'supported_languages' | 'highlights' | 'tags', index: number, value: string) => {
    setCountryForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'supported_languages' | 'highlights' | 'tags', index: number) => {
    setCountryForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && country.is_active) ||
      (statusFilter === 'inactive' && !country.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link 
              to="/admin-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Country Management</h1>
              <p className="text-gray-600 mt-1">Manage supported countries and consultant assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCountryModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Country</span>
              </button>
              <button
                onClick={fetchData}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Countries</p>
                <p className="text-3xl font-bold text-gray-900">{countries.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Countries</p>
                <p className="text-3xl font-bold text-green-600">{countries.filter(c => c.is_active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Consultants</p>
                <p className="text-3xl font-bold text-purple-600">{assignments.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Consultants</p>
                <p className="text-3xl font-bold text-orange-600">{consultants.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCountries.length} of {countries.length} countries
          </div>
        </div>

        {/* Countries Grid */}
        {filteredCountries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Found</h3>
            <p className="text-gray-600 mb-6">No countries match your current filters.</p>
            <button
              onClick={() => setShowCountryModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Add First Country
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country) => (
              <div key={country.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Country Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={country.image_url || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={country.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Flag and Status */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="text-3xl drop-shadow-lg">{country.flag_emoji}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      country.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {country.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                    {country.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-white/90 text-gray-800 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                    <span className="text-sm text-gray-500">/{country.slug}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {country.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">{country.consultant_count || 0}</div>
                      <div className="text-xs text-gray-600">Consultants</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">{country.supported_languages.length}</div>
                      <div className="text-xs text-gray-600">Languages</div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {country.supported_languages.map((lang, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleOpenAssignmentModal(country);
                      }}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Manage</span>
                    </button>
                    <button
                      onClick={() => handleEdit(country)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCountry(country.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Country Form Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCountry ? 'Edit Country' : 'Add New Country'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCountry} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryForm.name}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Georgia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryForm.slug}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., georgia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={countryForm.flag_emoji}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, flag_emoji: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="🇬🇪"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Language
                  </label>
                  <select
                    value={countryForm.primary_language}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, primary_language: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="ka">Georgian</option>
                    <option value="tr">Turkish</option>
                    <option value="ru">Russian</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={countryForm.description}
                  onChange={(e) => setCountryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the country's business advantages..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      // Check file size (50MB limit)
                      if (file.size > 50 * 1024 * 1024) {
                        alert('Image size must be less than 50MB. Please compress your image and try again.');
                        e.target.value = '';
                        return;
                      }
                      setSelectedFile(file);
                    } else {
                      setSelectedFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
                )}
                {countryForm.image_url && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <img 
                      src={getPublicImageUrl(countryForm.image_url)} 
                      alt="Current Country" 
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* Supported Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Languages
                </label>
                <div className="space-y-2">
                  {countryForm.supported_languages.map((lang, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => updateArrayField('supported_languages', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Language code (e.g., en, ka)"
                      />
                      {countryForm.supported_languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('supported_languages', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('supported_languages')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Language</span>
                  </button>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Highlights
                </label>
                <div className="space-y-2">
                  {countryForm.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateArrayField('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Key business advantage"
                      />
                      {countryForm.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('highlights', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('highlights')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Highlight</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {countryForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag (e.g., Tax Friendly)"
                      />
                      {countryForm.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('tags', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('tags')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={countryForm.is_active}
                  onChange={(e) => setCountryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Country is active and visible to users
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingCountry ? 'Update' : 'Create'} Country</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultant Assignment Modal */}
      {showAssignmentModal && selectedCountryForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Consultants - {selectedCountryForAssignment.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedCountryForAssignment(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Assignments</h3>
                {assignments.filter(a => a.country_id === selectedCountryForAssignment.id).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Consultants Assigned</h4>
                    <p className="text-gray-600">No consultants are currently assigned to this country.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments
                      .filter(a => a.country_id === selectedCountryForAssignment.id)
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="font-medium text-gray-900">{assignment.consultant.full_name}</p>
                              {assignment.is_primary && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Primary
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{assignment.consultant.email}</p>
                            <p className="text-xs text-gray-500">
                              Assigned: {new Date(assignment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveConsultantAssignment(assignment.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Available Consultants */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Consultants</h3>
                {availableConsultants.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">All Consultants Assigned</h4>
                    <p className="text-gray-600">All available consultants are already assigned to this country.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableConsultants.map((consultant) => (
                      <div key={consultant.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{consultant.full_name}</p>
                              <p className="text-sm text-gray-600">{consultant.email}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Specialization: {consultant.country || 'Not specified'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAssignConsultant(consultant.id, selectedCountryForAssignment.id, false)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Assign</span>
                          </button>
                          <button
                            onClick={() => handleAssignConsultant(consultant.id, selectedCountryForAssignment.id, true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Award className="h-4 w-4" />
                            <span>Primary</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Assignment Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Total Assigned:</span>
                    <span className="font-bold text-purple-900 ml-2">
                      {assignments.filter(a => a.country_id === selectedCountryForAssignment.id).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-700">Available:</span>
                    <span className="font-bold text-purple-900 ml-2">{availableConsultants.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManagement;