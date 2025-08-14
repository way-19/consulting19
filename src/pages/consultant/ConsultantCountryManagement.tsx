import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  RefreshCw,
  Upload,
  Image,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Package,
  FileText,
  Tag,
  Languages,
  Building
} from 'lucide-react';

interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language: string;
  supported_languages: string[];
  highlights: string[];
  tags: string[];
  is_active: boolean;
}

interface CustomService {
  id: string;
  consultant_id: string;
  country_id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  is_active: boolean;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const [assignedCountries, setAssignedCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryServices, setCountryServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'country' | 'services'>('country');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [selectedCountryImageFile, setSelectedCountryImageFile] = useState<File | null>(null);
  const [selectedServiceImageFile, setSelectedServiceImageFile] = useState<File | null>(null);

  const [countryForm, setCountryForm] = useState({
    name: '',
    slug: '',
    flag_emoji: '',
    description: '',
    image_url: '',
    primary_language: 'en',
    supported_languages: ['en'],
    highlights: [''],
    tags: ['']
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    is_active: true,
    slug: '',
    seo_title: '',
    seo_description: '',
    image_url: ''
  });

  const serviceCategories = [
    { value: 'company_formation', label: 'Company Formation' },
    { value: 'banking', label: 'Banking Services' },
    { value: 'visa_residence', label: 'Visa & Residence' },
    { value: 'tax_services', label: 'Tax Services' },
    { value: 'accounting', label: 'Accounting Services' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'custom', label: 'Custom Service' }
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchAssignedCountries();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedCountry) {
      fetchCountryServices();
    }
  }, [selectedCountry]);

  const fetchAssignedCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('consultant_country_assignments')
        .select(`
          country:country_id (
            id,
            name,
            slug,
            flag_emoji,
            description,
            image_url,
            primary_language,
            supported_languages,
            highlights,
            tags,
            is_active
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (error) throw error;

      const countries = (data || [])
        .map(item => item.country)
        .filter(country => country !== null) as Country[];

      setAssignedCountries(countries);
      
      if (countries.length > 0 && !selectedCountry) {
        setSelectedCountry(countries[0]);
        setCountryForm({
          name: countries[0].name,
          slug: countries[0].slug,
          flag_emoji: countries[0].flag_emoji || '',
          description: countries[0].description || '',
          image_url: countries[0].image_url || '',
          primary_language: countries[0].primary_language,
          supported_languages: countries[0].supported_languages,
          highlights: countries[0].highlights.length > 0 ? countries[0].highlights : [''],
          tags: countries[0].tags.length > 0 ? countries[0].tags : ['']
        });
      }
    } catch (error) {
      console.error('Error fetching assigned countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryServices = async () => {
    if (!selectedCountry) return;

    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select('*')
        .eq('consultant_id', profile?.id)
        .eq('country_id', selectedCountry.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCountryServices(data || []);
    } catch (error) {
      console.error('Error fetching country services:', error);
    }
  };

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;
    
    try {
      let imageUrlToSave = countryForm.image_url;

      if (selectedCountryImageFile) {
        const uploadedPath = await uploadFileToStorage(selectedCountryImageFile, 'country_images');
        imageUrlToSave = uploadedPath;
      }

      const countryData = {
        ...countryForm,
        image_url: imageUrlToSave,
        supported_languages: countryForm.supported_languages.filter(lang => lang.trim() !== ''),
        highlights: countryForm.highlights.filter(h => h.trim() !== ''),
        tags: countryForm.tags.filter(t => t.trim() !== '')
      };

      const { error } = await supabase
        .from('countries')
        .update(countryData)
        .eq('id', selectedCountry.id);

      if (error) throw error;

      await fetchAssignedCountries();
      setShowCountryModal(false);
      setSelectedCountryImageFile(null);
      alert('Country updated successfully!');
    } catch (error) {
      console.error('Error updating country:', error);
      alert('Failed to update country');
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrlToSave = serviceForm.image_url;

      if (selectedServiceImageFile) {
        const uploadedPath = await uploadFileToStorage(selectedServiceImageFile, 'service_images');
        imageUrlToSave = uploadedPath;
      }

      const serviceData = {
        ...serviceForm,
        consultant_id: profile?.id,
        country_id: selectedCountry?.id,
        features: serviceForm.features.filter(f => f.trim() !== ''),
        image_url: imageUrlToSave,
        slug: serviceForm.slug || generateSlug(serviceForm.title)
      };

      if (editingService) {
        const { error } = await supabase
          .from('custom_services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_services')
          .insert([serviceData]);
        
        if (error) throw error;
      }

      await fetchCountryServices();
      resetServiceForm();
      alert('Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('custom_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      await fetchCountryServices();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleEditService = (service: CustomService) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      subtitle: service.subtitle || '',
      description: service.description || '',
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      is_active: service.is_active,
      slug: service.slug || '',
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || '',
      image_url: service.image_url || ''
    });
    setSelectedServiceImageFile(null);
    setShowServiceModal(true);
  };

  const resetServiceForm = () => {
    setServiceForm({
      title: '',
      subtitle: '',
      description: '',
      features: [''],
      price: 0,
      currency: 'USD',
      delivery_time_days: 7,
      category: 'custom',
      is_active: true,
      slug: '',
      seo_title: '',
      seo_description: '',
      image_url: ''
    });
    setEditingService(null);
    setSelectedServiceImageFile(null);
    setShowServiceModal(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addArrayField = (field: 'supported_languages' | 'highlights' | 'tags' | 'features') => {
    if (field === 'features') {
      setServiceForm(prev => ({
        ...prev,
        features: [...prev.features, '']
      }));
    } else {
      setCountryForm(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    }
  };

  const updateArrayField = (field: 'supported_languages' | 'highlights' | 'tags' | 'features', index: number, value: string) => {
    if (field === 'features') {
      setServiceForm(prev => ({
        ...prev,
        features: prev.features.map((item, i) => i === index ? value : item)
      }));
    } else {
      setCountryForm(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    }
  };

  const removeArrayField = (field: 'supported_languages' | 'highlights' | 'tags' | 'features', index: number) => {
    if (field === 'features') {
      setServiceForm(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    } else {
      setCountryForm(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (assignedCountries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            
            <div className="text-center py-16">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Countries Assigned</h1>
              <p className="text-gray-600 mb-6">You haven't been assigned to any countries yet. Please contact your administrator.</p>
              <button
                onClick={fetchAssignedCountries}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Refresh Assignments
              </button>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Country & Services Management</h1>
              <p className="text-gray-600 mt-1">Manage your country pages and services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  fetchAssignedCountries();
                  if (selectedCountry) fetchCountryServices();
                }}
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
        {/* Country Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Country to Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => {
                  setSelectedCountry(country);
                  setCountryForm({
                    name: country.name,
                    slug: country.slug,
                    flag_emoji: country.flag_emoji || '',
                    description: country.description || '',
                    image_url: country.image_url || '',
                    primary_language: country.primary_language,
                    supported_languages: country.supported_languages,
                    highlights: country.highlights.length > 0 ? country.highlights : [''],
                    tags: country.tags.length > 0 ? country.tags : ['']
                  });
                }}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedCountry?.id === country.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{country.name}</h3>
                    <p className="text-sm text-gray-600">{country.primary_language.toUpperCase()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCountry && (
          <>
            {/* Country Info Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={getPublicImageUrl(selectedCountry.image_url) || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={selectedCountry.name}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <span className="absolute -top-2 -right-2 text-2xl">{selectedCountry.flag_emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCountry.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedCountry.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-sm text-gray-500">Primary: {selectedCountry.primary_language.toUpperCase()}</span>
                      <span className="text-sm text-gray-500">
                        Languages: {selectedCountry.supported_languages.join(', ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCountryModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Country</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'country', label: 'Country Details', icon: Globe },
                    { key: 'services', label: 'Services', icon: Package, count: countryServices.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.key
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'country' && (
                  <div className="space-y-6">
                    {/* Country Highlights */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Country Highlights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCountry.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Country Tags */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Country Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCountry.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supported Languages */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCountry.supported_languages.map((lang, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Country Management</h4>
                      <p className="text-sm text-blue-800 mb-4">
                        You can edit your country's description, highlights, tags, and other details to better showcase business opportunities.
                      </p>
                      <button
                        onClick={() => setShowCountryModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Country Details</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Services for {selectedCountry.name}</h3>
                      <button
                        onClick={() => setShowServiceModal(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Service</span>
                      </button>
                    </div>

                    {countryServices.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Yet</h3>
                        <p className="text-gray-600 mb-6">Create your first service for {selectedCountry.name}.</p>
                        <button
                          onClick={() => setShowServiceModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Create First Service
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countryServices.map((service) => (
                          <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Service Image */}
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={getPublicImageUrl(service.image_url) || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              
                              {/* Status Badge */}
                              <div className="absolute top-4 right-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {service.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              {/* Price */}
                              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4 text-gray-600" />
                                  <span className="font-bold text-gray-900">${service.price.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <div className="mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h3>
                                {service.subtitle && (
                                  <p className="text-sm text-gray-600">{service.subtitle}</p>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {service.description}
                              </p>

                              {/* Features */}
                              <div className="mb-4">
                                <div className="space-y-1">
                                  {service.features.slice(0, 3).map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                      <span className="text-xs text-gray-700">{feature}</span>
                                    </div>
                                  ))}
                                  {service.features.length > 3 && (
                                    <p className="text-xs text-gray-500 ml-5">+{service.features.length - 3} more</p>
                                  )}
                                </div>
                              </div>

                              {/* Service Info */}
                              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{service.delivery_time_days} days</span>
                                </div>
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {serviceCategories.find(c => c.value === service.category)?.label || service.category}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditService(service)}
                                  className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service.id)}
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
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Country Edit Modal */}
      {showCountryModal && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Country Details - {selectedCountry.name}</h2>
                <button
                  onClick={() => {
                    setShowCountryModal(false);
                    setSelectedCountryImageFile(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateCountry} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

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

              {/* Country Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedCountryImageFile(e.target.files[0]);
                    } else {
                      setSelectedCountryImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedCountryImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedCountryImageFile.name}</p>
                )}
                {countryForm.image_url && !selectedCountryImageFile && (
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

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCountryModal(false);
                    setSelectedCountryImageFile(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Update Country</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Form Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Add New Service'} - {selectedCountry?.name}
                </h2>
                <button
                  onClick={resetServiceForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => {
                      setServiceForm(prev => ({ 
                        ...prev, 
                        title: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Company Registration In Georgia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={serviceForm.subtitle}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Open your business fast, easy and reliable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="company-registration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {serviceCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={serviceForm.delivery_time_days}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) || 7 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of your service..."
                />
              </div>

              {/* Service Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedServiceImageFile(e.target.files[0]);
                    } else {
                      setSelectedServiceImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedServiceImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedServiceImageFile.name}</p>
                )}
                {serviceForm.image_url && !selectedServiceImageFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <img 
                      src={getPublicImageUrl(serviceForm.image_url)} 
                      alt="Current Service" 
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Features
                </label>
                <div className="space-y-2">
                  {serviceForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateArrayField('features', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Feature description"
                      />
                      {serviceForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('features', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('features')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">SEO Settings</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={serviceForm.seo_title}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, seo_title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SEO optimized title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      rows={2}
                      value={serviceForm.seo_description}
                      onChange={(e) => setServiceForm(prev => ({ ...prev, seo_description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SEO meta description for search engines (150-160 characters)"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="service_is_active"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="service_is_active" className="text-sm font-medium text-gray-700">
                  Service is active and visible to clients
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingService ? 'Update' : 'Create'} Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantCountryManagement;