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
  RefreshCw,
  Save,
  X,
  DollarSign,
  Clock,
  Star,
  Building,
  FileText,
  Calculator,
  Scale,
  CreditCard,
  MessageSquare,
  Award,
  Settings
} from 'lucide-react';

interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji: string;
  description: string;
  is_active: boolean;
}

interface CustomService {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  is_active: boolean;
  country_id: string;
}

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'countries' | 'services'>('countries');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    country_id: ''
  });

  // Predefined Georgia services
  const georgiaServices = [
    {
      id: 'company-registration',
      title: 'Company Registration In Georgia',
      description: 'Complete company formation service with all required documentation and legal support.',
      price: 2500,
      currency: 'USD',
      delivery_time_days: 7,
      category: 'company_formation',
      features: ['LLC registration', 'Tax number', 'Document preparation', 'Legal support'],
      tags: ['Low Taxes', 'Easy Company Formation']
    },
    {
      id: 'bank-account',
      title: 'Open A Bank Account In Georgia',
      description: 'Professional bank account opening service for residents and non-residents.',
      price: 800,
      currency: 'USD',
      delivery_time_days: 10,
      category: 'banking',
      features: ['Account opening', 'Document preparation', 'Bank selection', 'Online banking'],
      tags: ['Multiple free zones', '0% corporate tax']
    },
    {
      id: 'visa-residence',
      title: 'Visa And Residence Permit In Georgia',
      description: 'Complete visa and residence permit service with full documentation support.',
      price: 1200,
      currency: 'USD',
      delivery_time_days: 15,
      category: 'visa',
      features: ['Visa application', 'Document preparation', 'Status tracking', 'Legal support'],
      tags: ['Political stability', 'Strong banking sector']
    },
    {
      id: 'tax-residency',
      title: 'Tax Residency In Georgia',
      description: 'Establish Georgian tax residency and benefit from territorial taxation system.',
      price: 1500,
      currency: 'USD',
      delivery_time_days: 21,
      category: 'tax',
      features: ['Tax residency application', 'Compliance setup', 'Tax optimization', 'Ongoing support'],
      tags: ['Golden Visa program', 'NHR tax regime']
    },
    {
      id: 'accounting-services',
      title: 'Accounting Services In Georgia',
      description: 'Professional accounting and bookkeeping services for Georgian businesses.',
      price: 500,
      currency: 'USD',
      delivery_time_days: 30,
      category: 'accounting',
      features: ['Monthly bookkeeping', 'Tax filing', 'Financial reports', 'Compliance monitoring'],
      tags: ['Excellent infrastructure', 'Central EU location']
    },
    {
      id: 'legal-consulting',
      title: 'Legal Consulting In Georgia',
      description: 'Expert legal consulting for all aspects of Georgian business law.',
      price: 300,
      currency: 'USD',
      delivery_time_days: 5,
      category: 'legal',
      features: ['Legal consultation', 'Contract review', 'Compliance advice', 'Document drafting'],
      tags: ['Largest EU economy', 'Strong industrial base']
    }
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAssignedCountries(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            is_active
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (error) throw error;
      
      const countryData = (data || [])
        .map(assignment => assignment.country)
        .filter(Boolean) as Country[];
      
      setCountries(countryData);
    } catch (error) {
      console.error('Error fetching assigned countries:', error);
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
        is_active: true
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
      description: service.description,
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      country_id: service.country_id
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
      country_id: ''
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

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'company_formation': return Building;
      case 'banking': return CreditCard;
      case 'visa': return FileText;
      case 'tax': return Calculator;
      case 'accounting': return Calculator;
      case 'legal': return Scale;
      default: return Settings;
    }
  };

  const getServiceImage = (category: string) => {
    const images = {
      'company_formation': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      'banking': 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
      'visa': 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      'tax': 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800',
      'accounting': 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800',
      'legal': 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    return images[category] || images['company_formation'];
  };

  const filteredCountries = (countries || []).filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && country.is_active) ||
      (statusFilter === 'inactive' && !country.is_active);
    return matchesSearch && matchesStatus;
  });

  const filteredCustomServices = (services || []).filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.is_active) ||
      (statusFilter === 'inactive' && !service.is_active);
    return matchesSearch && matchesStatus;
  });

  // Combine predefined and custom services for display
  const allServicesForDisplay = [...georgiaServices, ...filteredCustomServices];

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
                { key: 'services', label: 'My Services', icon: Settings, count: allServicesForDisplay.length }
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
                    {tab.key === 'countries' ? countries.length : allServicesForDisplay.length}
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

                {activeTab === 'services' && (
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Service</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {activeTab === 'countries' ? filteredCountries.length : allServicesForDisplay.length} of {activeTab === 'countries' ? countries.length : allServicesForDisplay.length} {activeTab}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'countries' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCountries.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Assigned</h3>
                    <p className="text-gray-600">You haven't been assigned to any countries yet.</p>
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <div key={country.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-3xl">{country.flag_emoji}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                            <p className="text-sm text-gray-600">/{country.slug}</p>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {country.description}
                        </p>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/countries/${country.slug}`}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Live Page</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allServicesForDisplay.map((service, index) => {
                  const IconComponent = getServiceIcon(service.category);
                  const isCustomService = !georgiaServices.find(gs => gs.id === service.id);
                  
                  return (
                    <div key={service.id || index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={getServiceImage(service.category)}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                        
                        {/* Content overlay */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                          {/* Price and delivery time */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-bold">${service.price?.toLocaleString() || '2,500'} {service.currency || 'USD'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{service.delivery_time_days || 7} days</span>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-3 leading-tight">
                            {service.title}
                          </h3>
                          <p className="text-white/90 text-sm mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          
                          {/* Features as small badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(service.features || []).slice(0, 2).map((feature, featureIndex) => (
                              <span 
                                key={featureIndex}
                                className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 border border-white/30 flex-1 text-center">
                              Learn More
                            </div>
                            {isCustomService && (
                              <button
                                onClick={() => handleEdit(service)}
                                className="bg-blue-500/80 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  {editingService ? 'Edit Service' : 'Add New Service'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="company_formation">Company Formation</option>
                    <option value="banking">Banking</option>
                    <option value="visa">Visa & Residence</option>
                    <option value="tax">Tax Services</option>
                    <option value="accounting">Accounting</option>
                    <option value="legal">Legal Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={serviceForm.country_id}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, country_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select country...</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag_emoji} {country.name}
                    </option>
                  ))}
                </select>
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