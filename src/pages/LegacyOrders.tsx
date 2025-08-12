import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Package, 
  Eye, 
  DollarSign, 
  Calendar,
  User,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface LegacyOrder {
  id: string;
  order_number: string;
  client_id: string;
  consultant_id: string;
  country: string;
  service_type: string;
  company_name?: string;
  total_amount: number;
  consultant_commission: number;
  platform_fee: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  additional_services: any[];
  client_details: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    email: string;
  };
}

const LegacyOrders = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<LegacyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<LegacyOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalCommission = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.consultant_commission, 0);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_orders')
        .select(`
          *,
          client:client_id (
            full_name,
            email
          )
        `)
        .eq('consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('legacy_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'on_hold': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
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
              <h1 className="text-2xl font-bold text-gray-900">Legacy Order Management</h1>
              <p className="text-gray-600 mt-1">Manage and track orders from legacy systems and commission tracking</p>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-3xl font-bold text-blue-600">${totalCommission.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredOrders.length} of {totalOrders} orders
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No legacy orders match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Left Side - 35% */}
                  <div className="flex-1 max-w-[35%]">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-orange-100 rounded-lg p-2">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{order.client?.full_name || 'Unknown Client'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{order.country}</span>
                      </div>
                      {order.company_name && (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{order.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - 65% */}
                  <div className="flex-1 max-w-[65%] ml-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Status and Payment */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPaymentStatusColor(order.payment_status)}`}>
                          Payment: {order.payment_status.toUpperCase()}
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                        <div className="text-xl font-bold text-gray-900">${order.total_amount.toLocaleString()}</div>
                        <div className="text-sm text-green-600 font-medium">
                          Your Commission: ${order.consultant_commission.toLocaleString()} (65%)
                        </div>
                        <div className="text-xs text-gray-500">
                          Platform Fee: ${order.platform_fee.toLocaleString()} (35%)
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetail(true);
                          }}
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>

                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Additional Services */}
                    {order.additional_services && order.additional_services.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Additional Services:</div>
                        <div className="flex flex-wrap gap-2">
                          {order.additional_services.map((service: any, index: number) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                              {service.name || service.title || `Service ${index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.order_number}</h2>
                <button
                  onClick={() => setShowOrderDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Order Number:</span>
                      <p className="font-medium">{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Service Type:</span>
                      <p className="font-medium">{selectedOrder.service_type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Country:</span>
                      <p className="font-medium">{selectedOrder.country}</p>
                    </div>
                    {selectedOrder.company_name && (
                      <div>
                        <span className="text-sm text-gray-600">Company Name:</span>
                        <p className="font-medium">{selectedOrder.company_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Client Name:</span>
                      <p className="font-medium">{selectedOrder.client?.full_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedOrder.client?.email || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">${selectedOrder.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${selectedOrder.consultant_commission.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Your Commission (65%)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">${selectedOrder.platform_fee.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Platform Fee (35%)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {selectedOrder.additional_services && selectedOrder.additional_services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
                  <div className="space-y-2">
                    {selectedOrder.additional_services.map((service: any, index: number) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3">
                        <p className="font-medium text-purple-900">
                          {service.name || service.title || `Service ${index + 1}`}
                        </p>
                        {service.description && (
                          <p className="text-sm text-purple-700 mt-1">{service.description}</p>
                        )}
                        {service.price && (
                          <p className="text-sm text-purple-600 mt-1">Price: ${service.price}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegacyOrders;