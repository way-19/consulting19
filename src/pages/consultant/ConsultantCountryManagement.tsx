import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CustomService {
  id: string;
  consultant_id: string;
  country_id?: string;
  title: string;
  description?: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'countries' | 'services'>('countries');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    country_id: '',
    is_active: true
  });

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select('*')
        .eq('consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...serviceForm,
        consultant_id: profile?.id,
        features: serviceForm.features.filter(f => f.trim() !== ''),
        country_id: serviceForm.country_id || null
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

      await fetchServices();
      resetForm();
      alert('Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service: ' + (error as Error).message);
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
      await fetchServices();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleEdit = (service: CustomService) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description || '',
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      country_id: service.country_id || '',
      is_active: service.is_active
    });
    setShowServiceModal(true);
  };

  const resetForm = () => {
    setServiceForm({
      title: '',
      description: '',
      features: [''],
      price: 0,
      currency: 'USD',
      delivery_time_days: 7,
      category: 'custom',
      country_id: '',
      is_active: true
    });
    setEditingService(null);
    setShowServiceModal(false);
  };

  const addFeature = () => {
    setServiceForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setServiceForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setServiceForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const filteredCountries = (countries || []).filter(country => {
    const matchesSearch = 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && country.is_active) ||
      (statusFilter === 'inactive' && !country.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const filteredServices = (services || []).filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.is_active) ||
      (statusFilter === 'inactive' && !service.is_active);
    
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
              to="/consultant-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Country & Service Management</h1>
              <p className="text-gray-600 mt-1">Manage your country specializations and custom services</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'services' && (
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Service</span>
                </button>
              )}
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
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'countries', label: 'Countries', icon: Globe, count: countries.length },
                { key: 'services', label: 'My Services', icon: Settings, count: services.length }
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
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
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
              Showing {activeTab === 'countries' ? filteredCountries.length : filteredServices.length} of {activeTab === 'countries' ? countries.length : services.length} {activeTab}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'countries' ? (
              <div className="space-y-4">
                {filteredCountries.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Found</h3>
                    <p className="text-gray-600">
                      {countries.length === 0 
                        ? 'No countries are available in the system.'
                        : 'No countries match your current filters.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCountries.map((country) => (
                      <div key={country.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-3xl">{country.flag_emoji || '🌍'}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{country.name}</h3>
                            <p className="text-sm text-gray-600">/{country.slug}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            country.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {country.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {country.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {country.description}
                          </p>
                        )}

                        {/* Languages */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {(country.supported_languages || []).map((lang, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                                {lang.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Highlights */}
                        {country.highlights && country.highlights.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {country.highlights.slice(0, 2).map((highlight, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                                  {highlight}
                                </span>
                              ))}
                              {country.highlights.length > 2 && (
                                <span className="text-xs text-gray-500">+{country.highlights.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setServiceForm(prev => ({ ...prev, country_id: country.id }));
                              setShowServiceModal(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Service</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
                    <p className="text-gray-600 mb-6">
                      {services.length === 0 
                        ? 'Create your first custom service to get started.'
                        : 'No services match your current filters.'
                      }
                    </p>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First Service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => {
                      const country = countries.find(c => c.id === service.country_id);
                      
                      return (
                        <div key={service.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Country */}
                          {country && (
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-lg">{country.flag_emoji || '🌍'}</span>
                              <span className="text-sm text-gray-600">{country.name}</span>
                            </div>
                          )}

                          {/* Features */}
                          <div className="mb-4">
                            <div className="space-y-1">
                              {service.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                  <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                              ))}
                              {service.features.length > 3 && (
                                <p className="text-xs text-gray-500 ml-3.5">+{service.features.length - 3} more</p>
                              )}
                            </div>
                          </div>

                          {/* Price and Delivery */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-bold text-gray-900">
                              ${service.price.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500 ml-1">{service.currency}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.delivery_time_days} days
                            </div>
                          </div>

                          {/* Category */}
                          <div className="mb-4">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              {service.category.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(service)}
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
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Form Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Georgia Company Certificate Translation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of your service..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Optional)
                  </label>
                  <select
                    value={serviceForm.country_id}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, country_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">No specific country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.flag_emoji} {country.name}
                      </option>
                    ))}
                  </select>
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
                    <option value="custom">Custom Service</option>
                    <option value="document">Document Processing</option>
                    <option value="certification">Certification</option>
                    <option value="consultation">Consultation</option>
                    <option value="legal">Legal Services</option>
                    <option value="accounting">Accounting</option>
                    <option value="banking">Banking</option>
                    <option value="tax">Tax Services</option>
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
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={serviceForm.currency}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GEL">GEL</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
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
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Feature description"
                      />
                      {serviceForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
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
                  Service is active and available to clients
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