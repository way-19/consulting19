import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import StripeCheckout from '../components/StripeCheckout';
import { ShoppingCart, Star, Clock, DollarSign, User, CheckCircle, CreditCard, FileText, Eye } from 'lucide-react';

interface CustomService {
  id: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  consultant: {
    id: string;
    full_name: string;
    email: string;
  };
  country: {
    name: string;
    flag_emoji: string;
  };
}

interface ServiceOrder {
  id: string;
  status: string;
  total_amount: number;
  currency: string;
  invoice_number: string;
  created_at: string;
  service: {
    title: string;
    consultant: {
      full_name: string;
      email: string;
    };
  };
}

const ClientServices = () => {
  const { profile } = useAuth();
  const [services, setServices] = useState<CustomService[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedService, setSelectedService] = useState<CustomService | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchServices();
      fetchOrders();
    }
  }, [profile]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select(`
          *,
          consultant:consultant_id (
            id,
            full_name,
            email
          ),
          country:country_id (
            name,
            flag_emoji
          )
        `)
        .eq('is_active', true);

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
        .select(`
          *,
          service:service_id (
            title,
            consultant:consultant_id (
              full_name,
              email
            )
          )
        `)
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

  const handleOrderService = async (service: CustomService) => {
    try {
      const orderData = {
        service_id: service.id,
        client_id: profile?.id,
        consultant_id: service.consultant.id,
        total_amount: service.price,
        currency: service.currency,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('service_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Open Stripe checkout
      setSelectedService(service);
      setPendingOrderId(data.id);
      setShowCheckout(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while creating the order.');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setShowCheckout(false);
    setSelectedService(null);
    setPendingOrderId(null);
    
    await fetchOrders();
    setActiveTab('orders');
    
    alert('Payment successful! Your order has been confirmed.');
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedService(null);
    setPendingOrderId(null);
  };

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'custom', label: 'Custom Service' },
    { value: 'document', label: 'Document Processing' },
    { value: 'certification', label: 'Certification' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'legal', label: 'Legal Services' }
  ];

  const filteredServices = services.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'paid': return 'Paid';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Additional Services</h1>
              <p className="text-gray-600 mt-1">Get custom services from our consultants</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Services ({filteredServices.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Orders ({orders.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'services' ? (
          <>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
                <p className="text-gray-600">No services found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                        </div>
                        {service.country && (
                          <div className="ml-4 text-2xl">{service.country.flag_emoji}</div>
                        )}
                      </div>

                      {/* Consultant Info */}
                      <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.consultant.full_name}</p>
                          <p className="text-xs text-gray-500">{service.consultant.email}</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <div className="space-y-1">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <p className="text-xs text-gray-500 ml-6">+{service.features.length - 3} daha fazla</p>
                          )}
                        </div>
                      </div>

                      {/* Price and Delivery */}
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

                      {/* Category */}
                      <div className="mb-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {categories.find(c => c.value === service.category)?.label || service.category}
                        </span>
                      </div>

                      {/* Order Button */}
                      <button
                        onClick={() => handleOrderService(service)}
                        className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any service orders yet.</p>
                <button
                  onClick={() => setActiveTab('services')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{order.service.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{order.service.consultant.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Invoice: {order.invoice_number}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ${order.total_amount.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 ml-1">{order.currency}</span>
                        </div>
                        
                        {order.status === 'pending' && (
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && selectedService && pendingOrderId && (
        <StripeCheckout
          isOpen={showCheckout}
          onClose={handlePaymentCancel}
          amount={selectedService.price}
          currency={selectedService.currency}
          orderId={pendingOrderId}
          orderDetails={{
            serviceName: selectedService.title,
            consultantName: selectedService.consultant.full_name,
            deliveryTime: selectedService.delivery_time_days
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default ClientServices;