import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash2, Eye, DollarSign, Clock, Users, Star, Settings, Save, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  created_at: string;
  orders_count?: number;
  total_revenue?: number;
}

interface ServiceFormData {
  title: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  is_active: boolean;
}

const ConsultantServices = () => {
  const { profile } = useAuth();
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    is_active: true
  });

  useEffect(() => {
    if (profile?.id) {
      fetchServices();
    }
  }, [profile]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select(`
          *,
          service_orders!inner(
            id,
            total_amount,
            status
          )
        `)
        .eq('consultant_id', profile?.id);

      if (error) throw error;

      // Process services with order statistics
      const processedServices = data?.map(service => {
        const orders = service.service_orders || [];
        const completedOrders = orders.filter((order: any) => order.status === 'completed');
        
        return {
          ...service,
          orders_count: orders.length,
          total_revenue: completedOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0)
        };
      }) || [];

      setServices(processedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...formData,
        consultant_id: profile?.id,
        features: formData.features.filter(f => f.trim() !== '')
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
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('custom_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEdit = (service: CustomService) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      is_active: service.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
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
    setShowForm(false);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
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
          {/* Back Button */}
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
              <h1 className="text-2xl font-bold text-gray-900">My Custom Services</h1>
              <p className="text-gray-600 mt-1">Create and offer custom services to your clients</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Service</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{services.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-3xl font-bold text-green-600">{services.filter(s => s.is_active).length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">
                  {services.reduce((sum, s) => sum + (s.orders_count || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${services.reduce((sum, s) => sum + (s.total_revenue || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Services Yet</h3>
            <p className="text-gray-600 mb-6">Add new services to offer custom solutions to your clients.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>

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

                  {/* Price and Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${service.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500 ml-1">{service.currency}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{service.delivery_time_days} gün</span>
                    </div>
                  </div>

                  {/* Order Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{service.orders_count || 0}</p>
                      <p className="text-xs text-gray-600">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">${(service.total_revenue || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
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
                      onClick={() => handleDelete(service.id)}
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
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g: Georgia Company Certificate"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of your service..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Feature description"
                      />
                      {formData.features.length > 1 && (
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

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GEL">GEL</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              {/* Delivery Time and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.delivery_time_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) || 7 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="custom">Custom Service</option>
                    <option value="document">Document Processing</option>
                    <option value="certification">Certification</option>
                    <option value="consultation">Consultation</option>
                    <option value="legal">Legal Services</option>
                  </select>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Publish service as active
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
                  <span>{editingService ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantServices;