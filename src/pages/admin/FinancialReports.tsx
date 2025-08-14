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
  AlertTriangle
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
}

interface RevenueByConsultant {
  consultant_id: string;
  consultant_name: string;
  total_revenue: number;
  commission_earned: number;
  orders_count: number;
  avg_order_value: number;
}

interface RevenueByCountry {
  country: string;
  total_revenue: number;
  orders_count: number;
  consultants_count: number;
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
    topPerformingCountry: ''
  });
  const [revenueByConsultant, setRevenueByConsultant] = useState<RevenueByConsultant[]>([]);
  const [revenueByCountry, setRevenueByCountry] = useState<RevenueByCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [activeTab, setActiveTab] = useState<'overview' | 'consultants' | 'countries' | 'payments'>('overview');

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
        fetchCountryRevenue()
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

    setStats({
      totalRevenue,
      monthlyRevenue,
      totalCommissions,
      platformFees,
      pendingPayments: (legacyOrders || []).filter(o => o.payment_status === 'pending').length,
      completedOrders: allOrders.filter(o => o.status === 'completed' || o.payment_status === 'paid').length,
      activeConsultants: consultantCount || 0,
      topPerformingCountry: topCountry
    });
  };

  const fetchConsultantRevenue = async () => {
    const { data, error } = await supabase
      .from('legacy_orders')
      .select(`
        consultant_id,
        total_amount,
        consultant_commission,
        profiles!legacy_orders_consultant_id_fkey (
          full_name,
          email
        )
      `)
      .eq('payment_status', 'paid');

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
          avg_order_value: 0
        };
      }
      
      acc[consultantId].total_revenue += parseFloat(order.total_amount);
      acc[consultantId].commission_earned += parseFloat(order.consultant_commission);
      acc[consultantId].orders_count += 1;
      
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
      .eq('payment_status', 'paid');

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
          consultants: new Set()
        };
      }
      
      acc[country].total_revenue += parseFloat(order.total_amount);
      acc[country].orders_count += 1;
      acc[country].consultants.add(order.consultant_id);
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate consultant count
    const countryArray = Object.values(countryStats).map(country => ({
      country: country.country,
      total_revenue: country.total_revenue,
      orders_count: country.orders_count,
      consultants_count: country.consultants.size
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    setRevenueByCountry(countryArray);
  };

  const exportReport = (type: string) => {
    // This would generate and download a report
    alert(`Exporting ${type} report...`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
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
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'consultants', label: 'By Consultant', icon: Users },
                { key: 'countries', label: 'By Country', icon: Globe },
                { key: 'payments', label: 'Payments', icon: CreditCard }
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
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="font-bold text-green-600">${consultant.total_revenue.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Commission</p>
                                <p className="font-bold text-purple-600">${consultant.commission_earned.toLocaleString()}</p>
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
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="font-bold text-green-600">${country.total_revenue.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Orders</p>
                                <p className="font-bold text-blue-600">{country.orders_count}</p>
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
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Payment Management</h4>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Payment processing and commission management features will be implemented in the next phase.
                    This includes automated payment requests, approval workflows, and Stripe integration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <h4 className="font-medium text-gray-900">Pending Payments</h4>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                    <p className="text-sm text-gray-600">Awaiting processing</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h4 className="font-medium text-gray-900">Processed This Month</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600">Successfully processed</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <h4 className="font-medium text-gray-900">Failed Payments</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-600">0</p>
                    <p className="text-sm text-gray-600">Requires attention</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;