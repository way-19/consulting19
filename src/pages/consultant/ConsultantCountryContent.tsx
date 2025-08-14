import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Image,
  Tag,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Flag
} from 'lucide-react';

interface AssignedCountry {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  highlights: string[];
  tags: string[];
  is_active: boolean;
  assignment?: {
    is_primary: boolean;
    status: string;
  };
}

const ConsultantCountryContent = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<AssignedCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<AssignedCountry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    description: '',
    image_url: '',
    highlights: [''],
    tags: ['']
  });

  useEffect(() => {
    if (profile?.id) {
      fetchAssignedCountries();
    }
  }, [profile]);

  const fetchAssignedCountries = async () => {
    try {
      setLoading(true);
      
      // Get countries assigned to this consultant
      const { data: assignments, error: assignmentError } = await supabase
        .from('consultant_country_assignments')
        .select(`
          is_primary,
          status,
          country:country_id (
            id,
            name,
            slug,
            flag_emoji,
            description,
            image_url,
            highlights,
            tags,
            is_active
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (assignmentError) throw assignmentError;

      // Transform data
      const assignedCountries = (assignments || []).map(assignment => ({
        ...assignment.country,
        assignment: {
          is_primary: assignment.is_primary,
          status: assignment.status
        }
      })) as AssignedCountry[];

      setCountries(assignedCountries);
    } catch (error) {
      console.error('Error fetching assigned countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (country: AssignedCountry) => {
    setEditingCountry(country);
    setEditForm({
      description: country.description || '',
      image_url: country.image_url || '',
      highlights: country.highlights.length > 0 ? country.highlights : [''],
      tags: country.tags.length > 0 ? country.tags : ['']
    });
    setShowEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCountry) return;

    try {
      setSaving(true);

      const updateData = {
        description: editForm.description,
        image_url: editForm.image_url,
        highlights: editForm.highlights.filter(h => h.trim() !== ''),
        tags: editForm.tags.filter(t => t.trim() !== '')
      };

      const { error } = await supabase
        .from('countries')
        .update(updateData)
        .eq('id', editingCountry.id);

      if (error) throw error;

      await fetchAssignedCountries();
      resetForm();
      alert('Country content updated successfully!');
    } catch (error) {
      console.error('Error updating country:', error);
      alert('Failed to update country content');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditForm({
      description: '',
      image_url: '',
      highlights: [''],
      tags: ['']
    });
    setEditingCountry(null);
    setShowEditModal(false);
  };

  const addArrayField = (field: 'highlights' | 'tags') => {
    setEditForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'highlights' | 'tags', index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'highlights' | 'tags', index: number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

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
              to="/consultant-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Country Content</h1>
              <p className="text-gray-600 mt-1">Manage content for countries assigned to you</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAssignedCountries}
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
        {/* Countries Grid */}
        {countries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any countries yet. Contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((country) => (
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
                    {country.assignment?.is_primary && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Primary
                      </span>
                    )}
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

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {country.description || 'No description available'}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Highlights</h4>
                    <div className="space-y-1">
                      {country.highlights.slice(0, 3).map((highlight, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{highlight}</span>
                        </div>
                      ))}
                      {country.highlights.length > 3 && (
                        <p className="text-xs text-gray-500 ml-5">+{country.highlights.length - 3} more</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(country)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Content</span>
                    </button>
                    <Link
                      to={`/countries/${country.slug}`}
                      target="_blank"
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Country Modal */}
      {showEditModal && editingCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit {editingCountry.name} Content
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the country's business advantages..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://images.pexels.com/..."
                />
                {editForm.image_url && (
                  <div className="mt-2">
                    <img
                      src={editForm.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Highlights
                </label>
                <div className="space-y-2">
                  {editForm.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateArrayField('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Key business advantage"
                      />
                      {editForm.highlights.length > 1 && (
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
                  {editForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag (e.g., Tax Friendly)"
                      />
                      {editForm.tags.length > 1 && (
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

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{editingCountry.flag_emoji}</span>
                    <h3 className="text-lg font-bold text-gray-900">{editingCountry.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {editForm.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {editForm.tags.filter(t => t.trim()).map((tag, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
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
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantCountryContent;