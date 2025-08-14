import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  BarChart3,
  Users,
  Target,
  Award
} from 'lucide-react';

interface PaymentStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  clientCount: number;
}

interface CommissionBreakdown {
  source: string;
  amount: number;
  commission_rate: number;
  net_earnings: number;
  order_count: number;
}

interface PaymentRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

const ConsultantPayments = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    totalOrders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    clientCount: 0
  });
  const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'requests' | 'analytics'>('overview');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      fetchPaymentData();
    }
  }, [profile]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEarningsStats(),
        fetchCommissionBreakdown(),
        fetchPaymentRequests()
      ]);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsStats = async () => {
    // Get legacy orders
    const { data: legacyOrders } = await supabase
      .from('legacy_orders')
      .select('total_amount, consultant_commission, payment_status, created_at')
      .eq('consultant_id', profile?.id);

    // Get service orders
    const { data: serviceOrders } = await supabase
      .from('service_orders')
      .select('total_amount, status, created_at')
      .eq('consultant_id', profile?.id);

    // Get accounting payments
    const { data: accountingPayments } = await supabase
      .from('accounting_payments')
      .select('amount, consultant_commission, status, processed_at')
      .eq('consultant_id', profile?.id);

    // Get client count
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_consultant_id', profile?.id);

    // Calculate stats
    const allOrders = [...(legacyOrders || []), ...(serviceOrders || [])];
    const totalEarnings = (legacyOrders || []).reduce((sum, order) => sum + parseFloat(order.consultant_commission), 0) +
                         (accountingPayments || []).reduce((sum, payment) => sum + parseFloat(payment.consultant_commission), 0);
    
    const paidCommissions = (legacyOrders || [])
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + parseFloat(order.consultant_commission), 0);
    
    const pendingCommissions = totalEarnings - paidCommissions;

    // Current month earnings
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyOrders = allOrders.filter(order => new Date(order.created_at) >= currentMonth);
    const monthlyEarnings = monthlyOrders.reduce((sum, order) => {
      if ('consultant_commission' in order) {
        return sum + parseFloat(order.consultant_commission);
      }
      return sum + (parseFloat(order.total_amount) * 0.65); // Assume 65% commission for service orders
    }, 0);

    const totalOrderValue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const avgOrderValue = allOrders.length > 0 ? totalOrderValue / allOrders.length : 0;

    setStats({
      totalEarnings,
      monthlyEarnings,
      pendingCommissions,
      paidCommissions,
      totalOrders: allOrders.length,
      conversionRate: 85.5, // Mock data
      avgOrderValue,
      clientCount: clientCount || 0
    });
  };

  const fetchCommissionBreakdown = async () => {
    // This would fetch detailed commission breakdown by source
    const mockBreakdown: CommissionBreakdown[] = [
      {
        source: 'Company Formation',
        amount: 45000,
        commission_rate: 0.65,
        net_earnings: 29250,
        order_count: 18
      },
      {
        source: 'Accounting Services',
        amount: 24000,
        commission_rate: 0.65,
        net_earnings: 15600,
        order_count: 48
      },
      {
        source: 'Legal Consulting',
        amount: 18000,
        commission_rate: 0.65,
        net_earnings: 11700,
        order_count: 60
      },
      {
        source: 'Custom Services',
        amount: 12000,
        commission_rate: 0.65,
        net_earnings: 7800,
        order_count: 24
      }
    ];

    setCommissionBreakdown(mockBreakdown);
  };

  const fetchPaymentRequests = async () => {
    // Mock payment requests data
    const mockRequests: PaymentRequest[] = [
      {
        id: '1',
        amount: 5000,
        status: 'pending',
        requested_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: 'Monthly commission request'
      },
      {
        id: '2',
        amount: 3500,
        status: 'paid',
        requested_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        processed_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        notes: 'Previous month earnings'
      }
    ];

    setPaymentRequests(mockRequests);
  };

  const handleRequestPayment = async () => {
    if (requestAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (requestAmount > stats.pendingCommissions) {
      alert('Request amount cannot exceed pending commissions');
      return;
    }

    try {
      // In a real implementation, this would create a payment request
      alert(`Payment request for $${requestAmount.toLocaleString()} submitted successfully!`);
      setShowRequestModal(false);
      setRequestAmount(0);
      await fetchPaymentRequests();
    } catch (error) {
      console.error('Error requesting payment:', error);
      alert('Failed to submit payment request');
    }
  };

  const exportReport = (type: string) => {
    alert(`Exporting ${type} report...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>
              <p className="text-gray-600 mt-1">Track your earnings, commissions, and payment requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Request Payment</span>
              </button>
              <button
                onClick={fetchPaymentData}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-blue-600">${stats.monthlyEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Current month</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">${stats.pendingCommissions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Out</p>
                <p className="text-3xl font-bold text-purple-600">${stats.paidCommissions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Received</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Target className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-blue-600">{stats.clientCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">${stats.avgOrderValue.toLocaleString()}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'breakdown', label: 'Commission Breakdown', icon: DollarSign },
                { key: 'requests', label: 'Payment Requests', icon: CreditCard },
                { key: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings Summary */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Total Earned</span>
                        <span className="font-bold text-green-700">${stats.totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Paid Out</span>
                        <span className="font-bold text-purple-700">${stats.paidCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Pending</span>
                        <span className="font-bold text-yellow-700">${stats.pendingCommissions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Success Rate</span>
                        <span className="font-bold text-blue-700">98.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Client Satisfaction</span>
                        <span className="font-bold text-green-700">4.9/5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Avg Response Time</span>
                        <span className="font-bold text-purple-700">2.3h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-green-600 text-white p-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Request Payment</span>
                  </button>
                  <button
                    onClick={() => exportReport('earnings')}
                    className="bg-blue-600 text-white p-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Export Report</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="bg-purple-600 text-white p-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Commission Breakdown by Service</h3>
                  <button
                    onClick={() => exportReport('breakdown')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {commissionBreakdown.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{item.source}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Total Revenue:</span> ${item.amount.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Commission Rate:</span> {(item.commission_rate * 100).toFixed(0)}%
                            </div>
                            <div>
                              <span className="font-medium">Your Earnings:</span> ${item.net_earnings.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Orders:</span> {item.order_count}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">${item.net_earnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Net Earnings</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Requests</h3>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Request</span>
                  </button>
                </div>

                {paymentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
                    <p className="text-gray-600 mb-6">Submit your first payment request to get started.</p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Request Payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">${request.amount.toLocaleString()}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(request.requested_at).toLocaleDateString()}
                              </div>
                              {request.processed_at && (
                                <div>
                                  <span className="font-medium">Processed:</span> {new Date(request.processed_at).toLocaleDateString()}
                                </div>
                              )}
                              {request.notes && (
                                <div>
                                  <span className="font-medium">Notes:</span> {request.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Revenue Trends</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">This Month</span>
                          <span className="font-bold text-green-600">${stats.monthlyEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Last Month</span>
                          <span className="font-bold text-gray-600">$8,500</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Growth</span>
                          <span className="font-bold text-green-600">+15.2%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Client Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Active Clients</span>
                          <span className="font-bold text-blue-600">{stats.clientCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Retention Rate</span>
                          <span className="font-bold text-green-600">92%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Referrals</span>
                          <span className="font-bold text-purple-600">12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Request Payment</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Available for Withdrawal</h4>
                <p className="text-2xl font-bold text-blue-700">${stats.pendingCommissions.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Pending commission balance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Amount
                </label>
                <input
                  type="number"
                  min="0"
                  max={stats.pendingCommissions}
                  step="0.01"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ${stats.pendingCommissions.toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Payment requests are typically processed within 3-5 business days. 
                  You'll receive an email confirmation once your request is approved.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayment}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantPayments;