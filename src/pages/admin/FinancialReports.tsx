import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Filter,
  Eye,
  FileText,
  CreditCard,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Save,
  Edit,
  Trash2,
  Search,
  Award,
  Target,
  Activity
} from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommissions: number;
  platformFees: number;
  pendingPayments: number;
  completedOrders: number;
  activeConsultants: number;
  topPerformingCountry: string;
  pendingPaymentRequests: number;
  approvedPaymentRequests: number;
  totalPayoutAmount: number;
}

interface RevenueByConsultant {
  consultant_id: string;
  consultant_name: string;
  total_revenue: number;
  commission_earned: number;
  orders_count: number;
  avg_order_value: number;
  pending_commission: number;
  paid_commission: number;
}

interface RevenueByCountry {
  country: string;
  total_revenue: number;
  orders_count: number;
  consultants_count: number;
  avg_order_value: number;
  growth_rate: number;
}

interface PaymentRequest {
  id: string;
  consultant_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requested_at: string;
  processed_at?: string;
  notes?: string;
  consultant: {
    full_name: string;
    email: string;
  };
}

interface CommissionSummary {
  consultant_id: string;
  consultant_name: string;
  total_earned: number;
  total_paid: number;
  pending_amount: number;
  last_payment_date?: string;
  payment_requests_count: number;
}

const FinancialReports = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCommissions: 0,
    platformFees: 0,
    pendingPayments: 0,
    completedOrders: 0,
    activeConsultants: 0,
    topPerformingCountry: '',
    pendingPaymentRequests: 0,
    approvedPaymentRequests: 0,
    totalPayoutAmount: 0
  });
  const [revenueByConsultant, setRevenueByConsultant] = useState<RevenueByConsultant[]>([]);
  const [revenueByCountry, setRevenueByCountry] = useState<RevenueByCountry[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [activeTab, setActiveTab] = useState<'overview' | 'consultants' | 'countries' | 'payments' | 'requests' | 'commissions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (profile?.legacy_role === 'admin') {
      fetchFinancialData();
    }
  }, [profile, dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOverviewStats(),
        fetchConsultantRevenue(),
        fetchCountryRevenue(),
        fetchPaymentRequests(),
        fetchCommissionSummary()
      ]);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewStats = async () => {
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get legacy orders
    const { data: legacyOrders } = await supabase
      .from('legacy_orders')
      .select('total_amount, consultant_commission, platform_fee, payment_status, created_at, country')
      .gte('created_at', startDate.toISOString());

    // Get service orders
    const { data: serviceOrders } = await supabase
      .from('service_orders')
      .select('total_amount, status, created_at')
      .gte('created_at', startDate.toISOString());

    // Get accounting payments
    const { data: accountingPayments } = await supabase
      .from('accounting_payments')
      .select('amount, consultant_commission, platform_fee, status, processed_at')
      .gte('processed_at', startDate.toISOString());

    // Get payment requests stats
    const { data: paymentRequestsStats } = await supabase
      .from('payment_requests')
      .select('amount, status')
      .gte('created_at', startDate.toISOString());

    // Calculate stats
    const allOrders = [...(legacyOrders || []), ...(serviceOrders || [])];
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const totalCommissions = (legacyOrders || []).reduce((sum, order) => sum + parseFloat(order.consultant_commission), 0) +
                            (accountingPayments || []).reduce((sum, payment) => sum + parseFloat(payment.consultant_commission), 0);
    const platformFees = (legacyOrders || []).reduce((sum, order) => sum + parseFloat(order.platform_fee), 0) +
                        (accountingPayments || []).reduce((sum, payment) => sum + parseFloat(payment.platform_fee), 0);

    // Get current month revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyOrders = allOrders.filter(order => new Date(order.created_at) >= currentMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Get consultant count
    const { count: consultantCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('legacy_role', 'consultant')
      .eq('is_active', true);

    // Get top performing country
    const countryRevenue = (legacyOrders || []).reduce((acc, order) => {
      acc[order.country] = (acc[order.country] || 0) + parseFloat(order.total_amount);
      return acc;
    }, {} as Record<string, number>);

    const topCountry = Object.entries(countryRevenue).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate payment request stats
    const pendingPaymentRequests = (paymentRequestsStats || []).filter(r => r.status === 'pending').length;
    const approvedPaymentRequests = (paymentRequestsStats || []).filter(r => r.status === 'approved').length;
    const totalPayoutAmount = (paymentRequestsStats || [])
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    setStats({
      totalRevenue,
      monthlyRevenue,
      totalCommissions,
      platformFees,
      pendingPayments: (legacyOrders || []).filter(o => o.payment_status === 'pending').length,
      completedOrders: allOrders.filter(o => o.status === 'completed' || o.payment_status === 'paid').length,
      activeConsultants: consultantCount || 0,
      topPerformingCountry: topCountry,
      pendingPaymentRequests,
      approvedPaymentRequests,
      totalPayoutAmount
    });
  };

  const fetchConsultantRevenue = async () => {
    const { data, error } = await supabase
      .from('legacy_orders')
      .select(`
        consultant_id,
        total_amount,
        consultant_commission,
        payment_status,
        profiles!legacy_orders_consultant_id_fkey (
          full_name,
          email
        )
      `)
      .not('consultant_id', 'is', null);

    if (error) throw error;

    // Group by consultant
    const consultantStats = (data || []).reduce((acc, order) => {
      const consultantId = order.consultant_id;
      if (!acc[consultantId]) {
        acc[consultantId] = {
          consultant_id: consultantId,
          consultant_name: (order.profiles as any)?.full_name || 'Unknown',
          total_revenue: 0,
          commission_earned: 0,
          orders_count: 0,
          avg_order_value: 0,
          pending_commission: 0,
          paid_commission: 0
        };
      }
      
      acc[consultantId].total_revenue += parseFloat(order.total_amount);
      acc[consultantId].commission_earned += parseFloat(order.consultant_commission);
      acc[consultantId].orders_count += 1;
      
      if (order.payment_status === 'paid') {
        acc[consultantId].paid_commission += parseFloat(order.consultant_commission);
      } else {
        acc[consultantId].pending_commission += parseFloat(order.consultant_commission);
      }
      
      return acc;
    }, {} as Record<string, RevenueByConsultant>);

    // Calculate average order value
    Object.values(consultantStats).forEach(consultant => {
      consultant.avg_order_value = consultant.total_revenue / consultant.orders_count;
    });

    setRevenueByConsultant(Object.values(consultantStats).sort((a, b) => b.total_revenue - a.total_revenue));
  };

  const fetchCountryRevenue = async () => {
    const { data, error } = await supabase
      .from('legacy_orders')
      .select('country, total_amount, consultant_id')
      .not('country', 'is', null);

    if (error) throw error;

    // Group by country
    const countryStats = (data || []).reduce((acc, order) => {
      const country = order.country;
      if (!acc[country]) {
        acc[country] = {
          country,
          total_revenue: 0,
          orders_count: 0,
          consultants_count: 0,
          consultants: new Set(),
          total_amount: 0
        };
      }
      
      acc[country].total_revenue += parseFloat(order.total_amount);
      acc[country].orders_count += 1;
      acc[country].consultants.add(order.consultant_id);
      acc[country].total_amount += parseFloat(order.total_amount);
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate consultant count
    const countryArray = Object.values(countryStats).map(country => ({
      country: country.country,
      total_revenue: country.total_revenue,
      orders_count: country.orders_count,
      consultants_count: country.consultants.size,
      avg_order_value: country.orders_count > 0 ? country.total_revenue / country.orders_count : 0,
      growth_rate: Math.random() * 20 + 5 // Mock growth rate data
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    setRevenueByCountry(countryArray);
  };

  const fetchPaymentRequests = async () => {
    // Mock payment requests data - in real implementation this would come from a payment_requests table
    const mockRequests: PaymentRequest[] = [
      {
        id: '1',
        consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        amount: 5000,
        status: 'pending',
        requested_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: 'Monthly commission request for December',
        consultant: {
          full_name: 'Nino Kvaratskhelia',
          email: 'georgia@consulting19.com'
        }
      },
      {
        id: '2',
        consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        amount: 3500,
        status: 'approved',
        requested_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        processed_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        notes: 'November commission payout',
        consultant: {
          full_name: 'Nino Kvaratskhelia',
          email: 'georgia@consulting19.com'
        }
      },
      {
        id: '3',
        consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        amount: 2800,
        status: 'paid',
        requested_at: new Date(Date.now() - 86400000 * 45).toISOString(),
        processed_at: new Date(Date.now() - 86400000 * 40).toISOString(),
        notes: 'October commission payout',
        consultant: {
          full_name: 'Nino Kvaratskhelia',
          email: 'georgia@consulting19.com'
        }
      }
    ];

    setPaymentRequests(mockRequests);
  };

  const fetchCommissionSummary = async () => {
    // Mock commission summary data
    const mockSummary: CommissionSummary[] = [
      {
        consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
        consultant_name: 'Nino Kvaratskhelia',
        total_earned: 45000,
        total_paid: 35000,
        pending_amount: 10000,
        last_payment_date: new Date(Date.now() - 86400000 * 10).toISOString(),
        payment_requests_count: 3
      }
    ];

    setCommissionSummary(mockSummary);
  };

  const handleApprovePayment = async (requestId: string) => {
    try {
      setProcessingPayment(true);
      
      // In real implementation, this would update the payment_requests table
      const updatedRequests = paymentRequests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const, processed_at: new Date().toISOString() }
          : req
      );
      
      setPaymentRequests(updatedRequests);
      await fetchFinancialData();
      alert('Payment request approved successfully!');
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment request');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRejectPayment = async (requestId: string, reason: string) => {
    try {
      setProcessingPayment(true);
      
      // In real implementation, this would update the payment_requests table
      const updatedRequests = paymentRequests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const, processed_at: new Date().toISOString(), notes: reason }
          : req
      );
      
      setPaymentRequests(updatedRequests);
      await fetchFinancialData();
      alert('Payment request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment request');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleMarkAsPaid = async (requestId: string) => {
    try {
      setProcessingPayment(true);
      
      // In real implementation, this would update the payment_requests table and create payment record
      const updatedRequests = paymentRequests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'paid' as const, processed_at: new Date().toISOString() }
          : req
      );
      
      setPaymentRequests(updatedRequests);
      await fetchFinancialData();
      alert('Payment marked as paid successfully!');
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Failed to mark payment as paid');
    } finally {
      setProcessingPayment(false);
    }
  };

  const exportReport = (type: string) => {
    // This would generate and download a report
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

  const filteredPaymentRequests = paymentRequests.filter(request => {
    const matchesSearch = 
      request.consultant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
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
              to="/admin-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-gray-600 mt-1">Revenue analytics and commission tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={() => exportReport('financial')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
              <button
                onClick={fetchFinancialData}
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Last {dateRange} days</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Current month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                <p className="text-3xl font-bold text-purple-600">${stats.totalCommissions.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Paid to consultants</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-3xl font-bold text-orange-600">${stats.platformFees.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Platform earnings</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingPaymentRequests}</p>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalPayoutAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Paid out</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Consultants</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeConsultants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Country</p>
                <p className="text-3xl font-bold text-purple-600">{stats.topPerformingCountry}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Commission</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.activeConsultants > 0 ? (stats.totalCommissions / stats.activeConsultants).toLocaleString() : '0'}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'consultants', label: 'By Consultant', icon: Users },
                { key: 'countries', label: 'By Country', icon: Globe },
                { key: 'payments', label: 'Payment History', icon: CreditCard },
                { key: 'requests', label: 'Payment Requests', icon: Clock, count: stats.pendingPaymentRequests },
                { key: 'commissions', label: 'Commission Summary', icon: Award }
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Breakdown */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Total Revenue</span>
                        <span className="font-bold text-green-700">${stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Consultant Commissions (65%)</span>
                        <span className="font-bold text-purple-700">${stats.totalCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Platform Fees (35%)</span>
                        <span className="font-bold text-blue-700">${stats.platformFees.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Average Order Value</span>
                        <span className="font-bold text-blue-700">
                          ${stats.completedOrders > 0 ? (stats.totalRevenue / stats.completedOrders).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Revenue per Consultant</span>
                        <span className="font-bold text-purple-700">
                          ${stats.activeConsultants > 0 ? (stats.totalRevenue / stats.activeConsultants).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Top Performing Country</span>
                        <span className="font-bold text-green-700">{stats.topPerformingCountry}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="bg-yellow-600 text-white p-6 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Clock className="h-5 w-5" />
                    <span>Review Payment Requests ({stats.pendingPaymentRequests})</span>
                  </button>
                  <button
                    onClick={() => exportReport('commissions')}
                    className="bg-blue-600 text-white p-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Export Commission Report</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('commissions')}
                    className="bg-purple-600 text-white p-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Award className="h-5 w-5" />
                    <span>Commission Summary</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'consultants' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue by Consultant</h3>
                  <button
                    onClick={() => exportReport('consultants')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>

                {revenueByConsultant.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
                    <p className="text-gray-600">No completed orders found for the selected period.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueByConsultant.map((consultant, index) => (
                      <div key={consultant.consultant_id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{consultant.consultant_name}</h4>
                              <p className="text-sm text-gray-600">{consultant.orders_count} orders completed</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="font-bold text-green-600">${consultant.total_revenue.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Paid Commission</p>
                                <p className="font-bold text-green-600">${consultant.paid_commission.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Pending Commission</p>
                                <p className="font-bold text-yellow-600">${consultant.pending_commission.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Avg Order</p>
                                <p className="font-bold text-blue-600">${consultant.avg_order_value.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'countries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue by Country</h3>
                  <button
                    onClick={() => exportReport('countries')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>

                {revenueByCountry.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Country Data</h3>
                    <p className="text-gray-600">No revenue data by country found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueByCountry.map((country, index) => (
                      <div key={country.country} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{country.country}</h4>
                              <p className="text-sm text-gray-600">{country.consultants_count} consultants</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">+{country.growth_rate.toFixed(1)}% growth</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="font-bold text-green-600">${country.total_revenue.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Orders</p>
                                <p className="font-bold text-blue-600">{country.orders_count}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Avg Order Value</p>
                                <p className="font-bold text-purple-600">${country.avg_order_value.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Payment History</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    Historical payment data and transaction records. For active payment management, 
                    use the Payment Requests tab to approve/reject consultant payout requests.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h4 className="font-medium text-gray-900">Completed Payments</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${stats.totalPayoutAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total paid out</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <h4 className="font-medium text-gray-900">Pending Requests</h4>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPaymentRequests}</p>
                    <p className="text-sm text-gray-600">Awaiting approval</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      <h4 className="font-medium text-gray-900">This Month</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Monthly revenue</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payment requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Payment Requests List */}
                {filteredPaymentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
                    <p className="text-gray-600">No payment requests match your current filters.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPaymentRequests.map((request) => (
                      <div key={request.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                <DollarSign className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{request.consultant.full_name}</h4>
                                <p className="text-sm text-gray-600">{request.consultant.email}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">Amount:</span> ${request.amount.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(request.requested_at).toLocaleDateString()}
                              </div>
                              {request.processed_at && (
                                <div>
                                  <span className="font-medium">Processed:</span> {new Date(request.processed_at).toLocaleDateString()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Status:</span> {request.status}
                              </div>
                            </div>

                            {request.notes && (
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-sm text-gray-700">{request.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(request.id)}
                                  disabled={processingPayment}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason:');
                                    if (reason) handleRejectPayment(request.id, reason);
                                  }}
                                  disabled={processingPayment}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleMarkAsPaid(request.id)}
                                disabled={processingPayment}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>Mark as Paid</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRequestModal(true);
                              }}
                              className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Commission Summary</h3>
                  <button
                    onClick={() => exportReport('commissions')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>

                {commissionSummary.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Data</h3>
                    <p className="text-gray-600">No commission data available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissionSummary.map((summary) => (
                      <div key={summary.consultant_id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{summary.consultant_name}</h4>
                              <p className="text-sm text-gray-600">{summary.payment_requests_count} payment requests</p>
                              {summary.last_payment_date && (
                                <p className="text-xs text-gray-500">
                                  Last payment: {new Date(summary.last_payment_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Total Earned</p>
                                <p className="font-bold text-green-600">${summary.total_earned.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="font-bold text-blue-600">${summary.total_paid.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="font-bold text-yellow-600">${summary.pending_amount.toLocaleString()}</p>
                              </div>
                            </div>
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

        {/* Payment Request Detail Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => handleProcessPaymentRequest(selectedRequest.id, 'reject')}
                    disabled={processingRequest}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                    <span>Reject Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FinancialReports;