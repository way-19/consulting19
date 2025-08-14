import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, logAdminAction, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Settings, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Users,
  Star,
  RefreshCw,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Globe,
  Tag,
  TrendingUp,
  BarChart3,
  Package
} from 'lucide-react';

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
  consultant?: {
    full_name: string;
    email: string;
  };
  country?: {
    name: string;
    flag_emoji: string;
  };
  orders_count?: number;
  total_revenue?: number;
  avg_rating?: number;
}

interface ServiceStats {
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  totalOrders: number;
  avgRating: number;
  topCategory: string;
}

const ServiceManagement = () => {
  const { profile } = useAuth();
  const [services, setServices] = useState<CustomService[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [consultantFilter, setConsultantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [selectedService, setSelectedService] = useState<CustomService | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [selectedServiceImageFile, setSelectedServiceImageFile] = useState<File | null>(null);

  const [serviceForm, setServiceForm] = useState({
    consultant_id: '',
    country_id: '',
    title: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    is_active: true
  });

  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    activeServices: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgRating: 0,
    topCategory: ''
  });

  const categories = [
    { value: 'custom', label: 'Custom Service' },
    { value: 'document', label: 'Document Processing' },
    { value: 'certification', label: 'Certification' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'banking', label: 'Banking' },
    { value: 'tax', label: 'Tax Services' }
  ];

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchServices(),
        fetchConsultants(),
        fetchCountries()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('custom_services')
      .select(`
        *,
        consultant:consultant_id (
          full_name,
          email
        ),
        country:country_id (
          name,
          flag_emoji
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with order statistics
    const enrichedServices = await Promise.all(
      (data || []).map(async (service) => {
        const { data: orders } = await supabase
          .from('service_orders')
          .select('total_amount, status')
          .eq('service_id', service.id);

        const ordersCount = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

        return {
          ...service,
          orders_count: ordersCount,
          total_revenue: totalRevenue,
          avg_rating: 4.8 // Mock data - would come from reviews
        };
      })
    );

    setServices(enrichedServices);
    calculateStats(enrichedServices);
  };

  const fetchConsultants = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, country')
      .eq('role', 'consultant')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    setConsultants(data || []);
  };

  const fetchCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, flag_emoji')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    setCountries(data || []);
  };

  const calculateStats = (servicesData: CustomService[]) => {
    const totalServices = servicesData.length;
    const activeServices = servicesData.filter(s => s.is_active).length;
    const totalRevenue = servicesData.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
    const totalOrders = servicesData.reduce((sum, s) => sum + (s.orders_count || 0), 0);
    const avgRating = servicesData.length > 0 
      ? servicesData.reduce((sum, s) => sum + (s.avg_rating || 0), 0) / servicesData.length 
      : 0;

    // Find top category
    const categoryStats = servicesData.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + (service.total_revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'custom';

    setStats({
      totalServices,
      activeServices,
      totalRevenue,
      totalOrders,
      avgRating,
      topCategory
    });
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...serviceForm,
        features: serviceForm.features.filter(f => f.trim() !== ''),
        country_id: serviceForm.country_id || null
      };

      if (editingService) {
        const { error } = await supabase
          .from('custom_services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
        await logAdminAction('UPDATE_SERVICE', 'custom_services', editingService.id, editingService, serviceData);
      } else {
        const { error } = await supabase
          .from('custom_services')
          .insert([serviceData]);
        
        if (error) throw error;
        await logAdminAction('CREATE_SERVICE', 'custom_services', null, null, serviceData);
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
    if (!confirm('Are you sure you want to delete this service? This will also affect any existing orders.')) {
      return;
    }

    try {
      const serviceToDelete = services.find(s => s.id === serviceId);
      
      const { error } = await supabase
        .from('custom_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      await logAdminAction('DELETE_SERVICE', 'custom_services', serviceId, serviceToDelete, null);
      await fetchServices();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleToggleServiceStatus = async (serviceId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_services')
        .update({ is_active: newStatus })
        .eq('id', serviceId);

      if (error) throw error;
      
      await logAdminAction('TOGGLE_SERVICE_STATUS', 'custom_services', serviceId, null, { is_active: newStatus });
      await fetchServices();
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const handleEdit = (service: CustomService) => {
    setEditingService(service);
    setServiceForm({
      consultant_id: service.consultant_id,
      country_id: service.country_id || '',
      title: service.title,
      description: service.description || '',
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      is_active: service.is_active
    });
    setShowServiceModal(true);
  };

  const resetForm = () => {
    setServiceForm({
      consultant_id: '',
      country_id: '',
      title: '',
      description: '',
      features: [''],
      price: 0,
      currency: 'USD',
      delivery_time_days: 7,
      category: 'custom',
      is_active: true
    });
    setEditingService(null);
    setSelectedServiceImageFile(null);
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

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.consultant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesConsultant = consultantFilter === 'all' || service.consultant_id === consultantFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.is_active) ||
      (statusFilter === 'inactive' && !service.is_active);
    
    return matchesSearch && matchesCategory && matchesConsultant && matchesStatus;
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
              <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
              <p className="text-gray-600 mt-1">Manage all custom services across the platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowServiceModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Service</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <Package className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeServices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Title, description, consultant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultant</label>
              <select
                value={consultantFilter}
                onChange={(e) => setConsultantFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Consultants</option>
                {consultants.map(consultant => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredServices.length} of {services.length} services
            </div>
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-6">
              {services.length === 0 
                ? 'No services have been created yet.'
                : 'No services match your current filters.'
              }
            </p>
            <button
              onClick={() => setShowServiceModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              {services.length === 0 ? 'Create First Service' : 'Add New Service'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        {categories.find(c => c.value === service.category)?.label || service.category}
                      </span>
                    </div>

                    {service.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{service.consultant?.full_name || 'Unknown'}</span>
                      </div>
                      {service.country && (
                        <div className="flex items-center space-x-1">
                          <span>{service.country.flag_emoji}</span>
                          <span>{service.country.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${service.price.toLocaleString()} {service.currency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.delivery_time_days} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{service.orders_count || 0} orders</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="text-xs text-gray-500">+{service.features.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-lg font-bold text-green-600">${(service.total_revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">{service.orders_count || 0}</p>
                        <p className="text-xs text-gray-600">Orders</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <p className="text-lg font-bold text-yellow-600">{service.avg_rating?.toFixed(1) || 'N/A'}</p>
                        </div>
                        <p className="text-xs text-gray-600">Rating</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowServiceDetail(true);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleEdit(service)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleToggleServiceStatus(service.id, !service.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        service.is_active 
                          ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {service.is_active ? (
                        <>
                          <AlertTriangle className="h-4 w-4" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Enable</span>
                        </>
                      )}
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

      {/* Service Form Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Consultant *
                  </label>
                  <select
                    required
                    value={serviceForm.consultant_id}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, consultant_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select consultant...</option>
                    {consultants.map(consultant => (
                      <option key={consultant.id} value={consultant.id}>
                        {consultant.full_name} ({consultant.email})
                      </option>
                    ))}
                  </select>
                </div>

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
                    {categories.map(cat => (
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
                  Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of the service..."
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
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
                      setSelectedServiceImageFile(file);
                    } else {
                      setSelectedServiceImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
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

      {/* Service Detail Modal */}
      {showServiceDetail && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Service Details - {selectedService.title}</h2>
                <button
                  onClick={() => setShowServiceDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Service Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Title:</span>
                      <p className="font-medium">{selectedService.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category:</span>
                      <p className="font-medium">{categories.find(c => c.value === selectedService.category)?.label}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Price:</span>
                      <p className="font-medium">${selectedService.price.toLocaleString()} {selectedService.currency}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Delivery Time:</span>
                      <p className="font-medium">{selectedService.delivery_time_days} days</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        selectedService.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedService.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Consultant:</span>
                      <p className="font-medium">{selectedService.consultant?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedService.consultant?.email}</p>
                    </div>
                    {selectedService.country && (
                      <div>
                        <span className="text-sm text-gray-600">Country:</span>
                        <p className="font-medium">{selectedService.country.flag_emoji} {selectedService.country.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedService.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedService.description}</p>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">${(selectedService.total_revenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-green-700">Total Revenue</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedService.orders_count || 0}</p>
                    <p className="text-sm text-blue-700">Total Orders</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <p className="text-2xl font-bold text-yellow-600">{selectedService.avg_rating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <p className="text-sm text-yellow-700">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowServiceDetail(false);
                    handleEdit(selectedService);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Service</span>
                </button>
                
                <button
                  onClick={() => handleToggleServiceStatus(selectedService.id, !selectedService.is_active)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedService.is_active 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedService.is_active ? (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <span>Disable Service</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Enable Service</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowServiceDetail(false);
                    handleDeleteService(selectedService.id);
                  }}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;