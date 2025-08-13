import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Package, 
  Eye, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  Star,
  Globe,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Send,
  X,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  consultant?: {
    full_name: string;
    email: string;
    country?: string;
  };
  country?: {
    name: string;
    flag_emoji: string;
  };
}

interface ServiceOrder {
  id: string;
  service_id: string;
  client_id: string;
  consultant_id: string;
  status: 'pending' | 'paid' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
}

const ClientServices = () => {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<CustomService[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<CustomService | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomRequestModal, setShowCustomRequestModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  // Custom request form state
  const [customRequest, setCustomRequest] = useState({
    type: 'document',
    subject: '',
    message: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchOrders();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email,
            country
          ),
          country:country_id (
            name,
            flag_emoji
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('client_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderService = async () => {
    if (!selectedService || !profile?.id) return;

    setOrderLoading(true);
    try {
      const { error } = await supabase
        .from('service_orders')
        .insert([{
          service_id: selectedService.id,
          client_id: profile.id,
          consultant_id: selectedService.consultant_id,
          total_amount: selectedService.price,
          currency: selectedService.currency,
          notes: orderNotes,
          status: 'pending'
        }]);

      if (error) throw error;

      await fetchOrders();
      setShowOrderModal(false);
      setSelectedService(null);
      setOrderNotes('');
      alert('Service order placed successfully! Your consultant will contact you soon.');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCustomRequest = async () => {
    if (!customRequest.subject || !customRequest.message || !profile?.id) {
      alert('Please fill in all required fields');
      return;
    }

    setRequestLoading(true);
    try {
      // Get client's assigned consultant
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('assigned_consultant_id')
        .eq('profile_id', profile.id)
        .single();

      if (clientError || !clientData?.assigned_consultant_id) {
        alert('Could not find your assigned consultant. Please contact support.');
        return;
      }

      // Send message to consultant
      const { error: messageError } = await supabase
        .from('accounting_messages')
        .insert([{
          client_id: profile.id,
          consultant_id: clientData.assigned_consultant_id,
          sender_id: profile.id,
          recipient_id: clientData.assigned_consultant_id,
          subject: `Custom Service Request: ${customRequest.subject}`,
          message: `Service Type: ${customRequest.type}\n\nRequest: ${customRequest.subject}\n\nDetails:\n${customRequest.message}`,
          category: customRequest.type === 'document' ? 'document_request' : 'general',
          original_language: 'en'
        }]);

      if (messageError) throw messageError;

      setShowCustomRequestModal(false);
      setCustomRequest({ type: 'document', subject: '', message: '' });
      alert('Custom request sent successfully! Your consultant will respond soon.');
    } catch (error) {
      console.error('Error sending custom request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesCountry = countryFilter === 'all' || 
                          service.country?.name === countryFilter ||
                          service.consultant?.country === countryFilter;
    
    let matchesPrice = true;
    if (priceFilter === 'under-500') matchesPrice = service.price < 500;
    else if (priceFilter === '500-1000') matchesPrice = service.price >= 500 && service.price <= 1000;
    else if (priceFilter === 'over-1000') matchesPrice = service.price > 1000;
    
    return matchesSearch && matchesCategory && matchesCountry && matchesPrice;
  });

  const categories = Array.from(new Set(services.map(s => s.category)));
  const countries = Array.from(new Set(services.map(s => s.country?.name || s.consultant?.country).filter(Boolean)));

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
              to="/client-accounting"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Additional Services</h1>
              <p className="text-gray-600 mt-1">Browse and order additional services from consultants</p>
            </div>
            <button
              onClick={() => setShowCustomRequestModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Custom Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Need something specific?</p>
              <p className="text-blue-700 text-sm">Can't find what you're looking for? Use the "Custom Request" button to ask your consultant for certificates, documents, or any other services.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
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
                {categories.map(category => (
                  <option key={category} value={category}>{category.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="under-500">Under $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="over-1000">Over $1,000</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredServices.length} of {services.length} services
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600 mb-6">No additional services match your current filters or no services have been added by consultants yet.</p>
            <button
              onClick={() => setShowCustomRequestModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Request Custom Service</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {service.country?.flag_emoji && (
                          <span className="text-lg">{service.country.flag_emoji}</span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{service.description}</p>
                    </div>
                  </div>

                  {/* Consultant Info */}
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {service.consultant?.full_name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{service.consultant?.full_name}</p>
                      <p className="text-gray-600 text-xs">{service.country?.name || service.consultant?.country}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="space-y-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {service.features.length > 3 && (
                        <p className="text-xs text-gray-500 ml-5">+{service.features.length - 3} more features</p>
                      )}
                    </div>
                  </div>

                  {/* Price and Delivery */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${service.price.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ml-1">{service.currency}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{service.delivery_time_days} days</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowOrderModal(true);
                      }}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Order Now</span>
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Orders Section */}
        {orders.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Service Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => {
                const service = services.find(s => s.id === order.service_id);
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {service?.title || 'Service'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> ${order.total_amount} {order.currency}
                          </div>
                          <div>
                            <span className="font-medium">Consultant:</span> {service?.consultant?.full_name}
                          </div>
                          <div>
                            <span className="font-medium">Country:</span> {service?.country?.name || service?.consultant?.country}
                          </div>
                          <div>
                            <span className="font-medium">Ordered:</span> {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Service</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {selectedService.country?.flag_emoji && (
                    <span className="text-2xl">{selectedService.country.flag_emoji}</span>
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{selectedService.title}</h4>
                    <p className="text-gray-600">{selectedService.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Consultant:</span>
                    <p className="font-medium text-gray-900">{selectedService.consultant?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Delivery Time:</span>
                    <p className="font-medium text-gray-900">{selectedService.delivery_time_days} days</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-600">Features:</span>
                  <ul className="mt-2 space-y-1">
                    {selectedService.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-2xl font-bold text-purple-600">
                  ${selectedService.price.toLocaleString()} {selectedService.currency}
                </div>
              </div>

              {/* Order Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any specific requirements or notes for the consultant..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderService}
                  disabled={orderLoading}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {orderLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Request Modal */}
      {showCustomRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Custom Service Request</h3>
                <button
                  onClick={() => setShowCustomRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Request Any Service</p>
                    <p className="text-blue-700 text-sm">Need a certificate, document, or any other service? Your consultant will provide a custom quote.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type *
                  </label>
                  <select
                    value={customRequest.type}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="document">Document/Certificate Request</option>
                    <option value="consultation">Consultation Service</option>
                    <option value="legal">Legal Service</option>
                    <option value="accounting">Accounting Service</option>
                    <option value="other">Other Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={customRequest.subject}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Tax Residency Certificate, Apostille Service, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={5}
                    value={customRequest.message}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Please describe exactly what you need, including any specific requirements, deadlines, or preferences..."
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">How it works:</p>
                  </div>
                  <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                    <li>• Your request will be sent directly to your assigned consultant</li>
                    <li>• They will review your needs and provide a custom quote</li>
                    <li>• You'll receive a response within 24 hours</li>
                    <li>• Once agreed, the service will be added to your account</li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomRequestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomRequest}
                  disabled={requestLoading || !customRequest.subject || !customRequest.message}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {requestLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientServices;