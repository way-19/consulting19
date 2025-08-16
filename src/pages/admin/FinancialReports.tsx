import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { logAdminAction } from '../../lib/logging';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Users,
  Globe,
  Target,
  Award,
  CreditCard,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  Calculator,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCommissions: number;
  platformFees: number;
  pendingPayments: number;
  completedOrders: number;
  activeClients: number;
  avgOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  topConsultant: string;
  topCountry: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  commissions: number;
  platformFees: number;
  orders: number;
}

interface ConsultantPerformance {
  id: string;
  name: string;
  email: string;
  country: string;
  totalRevenue: number;
  totalOrders: number;
  commissionEarned: number;
  conversionRate: number;
  avgOrderValue: number;
  clientCount: number;
  rating: number;
}

interface CountryPerformance {
  id: string;
  name: string;
  flag: string;
  totalRevenue: number;
  totalOrders: number;
  consultantCount: number;
  avgOrderValue: number;
  growthRate: number;
  marketShare: number;
}

interface ServicePerformance {
  category: string;
  revenue: number;
  orders: number;
  avgPrice: number;
  growthRate: number;
  marketShare: number;
}

const FinancialReports = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'consultants' | 'countries' | 'services' | 'analytics'>('overview');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCommissions: 0,
    platformFees: 0,
    pendingPayments: 0,
    completedOrders: 0,
    activeClients: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    topConsultant: '',
    topCountry: ''
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [consultantPerformance, setConsultantPerformance] = useState<ConsultantPerformance[]>([]);
  const [countryPerformance, setCountryPerformance] = useState<CountryPerformance[]>([]);
  const [servicePerformance, setServicePerformance] = useState<ServicePerformance[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchFinancialData();
    }
  }, [profile, dateRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOverallStats(),
        fetchRevenueData(),
        fetchConsultantPerformance(),
        fetchCountryPerformance(),
        fetchServicePerformance()
      ]);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    // Get legacy orders
    const { data: legacyOrders } = await supabase
      .from('legacy_orders')
      .select('total_amount, consultant_commission, platform_fee, payment_status, created_at');

    // Get service orders
    const { data: serviceOrders } = await supabase
      .from('service_orders')
      .select('total_amount, status, created_at');

    // Get accounting payments
    const { data: accountingPayments } = await supabase
      .from('accounting_payments')
      .select('amount, consultant_commission, platform_fee, status, processed_at');

    // Calculate stats
    const allOrders = [...(legacyOrders || []), ...(serviceOrders || [])];
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    
    const totalCommissions = (legacyOrders || []).reduce((sum, order) => sum + parseFloat(order.consultant_commission), 0) +
                            (accountingPayments || []).reduce((sum, payment) => sum + parseFloat(payment.consultant_commission), 0);
    
    const platformFees = (legacyOrders || []).reduce((sum, order) => sum + parseFloat(order.platform_fee), 0) +
                        (accountingPayments || []).reduce((sum, payment) => sum + parseFloat(payment.platform_fee), 0);

    // Current month revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyOrders = allOrders.filter(order => new Date(order.created_at) >= currentMonth);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Get client count
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
    const completedOrders = allOrders.filter(order => 
      order.payment_status === 'paid' || order.status === 'completed'
    ).length;

    setStats({
      totalRevenue,
      monthlyRevenue,
      totalCommissions,
      platformFees,
      pendingPayments: totalRevenue - (totalCommissions + platformFees),
      completedOrders,
      activeClients: clientCount || 0,
      avgOrderValue,
      conversionRate: 85.5, // Mock data
      revenueGrowth: 15.2, // Mock data
      topConsultant: 'Nino Kvaratskhelia',
      topCountry: 'Georgia'
    });
  };

  const fetchRevenueData = async () => {
    // Mock revenue data for the last 12 months
    const mockData: RevenueData[] = [
      { month: 'Jan 2024', revenue: 45000, commissions: 29250, platformFees: 15750, orders: 18 },
      { month: 'Feb 2024', revenue: 52000, commissions: 33800, platformFees: 18200, orders: 21 },
      { month: 'Mar 2024', revenue: 48000, commissions: 31200, platformFees: 16800, orders: 19 },
      { month: 'Apr 2024', revenue: 61000, commissions: 39650, platformFees: 21350, orders: 24 },
      { month: 'May 2024', revenue: 58000, commissions: 37700, platformFees: 20300, orders: 23 },
      { month: 'Jun 2024', revenue: 67000, commissions: 43550, platformFees: 23450, orders: 27 },
      { month: 'Jul 2024', revenue: 72000, commissions: 46800, platformFees: 25200, orders: 29 },
      { month: 'Aug 2024', revenue: 69000, commissions: 44850, platformFees: 24150, orders: 28 },
      { month: 'Sep 2024', revenue: 78000, commissions: 50700, platformFees: 27300, orders: 31 },
      { month: 'Oct 2024', revenue: 84000, commissions: 54600, platformFees: 29400, orders: 34 },
      { month: 'Nov 2024', revenue: 91000, commissions: 59150, platformFees: 31850, orders: 36 },
      { month: 'Dec 2024', revenue: 95000, commissions: 61750, platformFees: 33250, orders: 38 }
    ];

    setRevenueData(mockData);
  };

  const fetchConsultantPerformance = async () => {
    const { data: consultants } = await supabase
      .from('profiles')
      .select('id, full_name, email, country')
      .eq('legacy_role', 'consultant')
      .eq('is_active', true);

    // Mock performance data
    const mockPerformance: ConsultantPerformance[] = [
      {
        id: '1',
        name: 'Nino Kvaratskhelia',
        email: 'georgia@consulting19.com',
        country: 'Georgia',
        totalRevenue: 245000,
        totalOrders: 89,
        commissionEarned: 159250,
        conversionRate: 92.5,
        avgOrderValue: 2753,
        clientCount: 24,
        rating: 4.9
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'usa@consulting19.com',
        country: 'USA',
        totalRevenue: 189000,
        totalOrders: 67,
        commissionEarned: 122850,
        conversionRate: 88.2,
        avgOrderValue: 2821,
        clientCount: 18,
        rating: 4.8
      },
      {
        id: '3',
        name: 'Ahmed Al-Rashid',
        email: 'uae@consulting19.com',
        country: 'UAE',
        totalRevenue: 156000,
        totalOrders: 45,
        commissionEarned: 101400,
        conversionRate: 85.7,
        avgOrderValue: 3467,
        clientCount: 15,
        rating: 4.7
      }
    ];

    setConsultantPerformance(mockPerformance);
  };

  const fetchCountryPerformance = async () => {
    const mockCountryData: CountryPerformance[] = [
      {
        id: '1',
        name: 'Georgia',
        flag: '🇬🇪',
        totalRevenue: 245000,
        totalOrders: 89,
        consultantCount: 3,
        avgOrderValue: 2753,
        growthRate: 18.5,
        marketShare: 35.2
      },
      {
        id: '2',
        name: 'USA',
        flag: '🇺🇸',
        totalRevenue: 189000,
        totalOrders: 67,
        consultantCount: 2,
        avgOrderValue: 2821,
        growthRate: 12.3,
        marketShare: 27.1
      },
      {
        id: '3',
        name: 'UAE',
        flag: '🇦🇪',
        totalRevenue: 156000,
        totalOrders: 45,
        consultantCount: 2,
        avgOrderValue: 3467,
        growthRate: 22.1,
        marketShare: 22.4
      },
      {
        id: '4',
        name: 'Estonia',
        flag: '🇪🇪',
        totalRevenue: 78000,
        totalOrders: 28,
        consultantCount: 1,
        avgOrderValue: 2786,
        growthRate: 8.7,
        marketShare: 11.2
      }
    ];

    setCountryPerformance(mockCountryData);
  };

  const fetchServicePerformance = async () => {
    const mockServiceData: ServicePerformance[] = [
      {
        category: 'Company Formation',
        revenue: 285000,
        orders: 95,
        avgPrice: 3000,
        growthRate: 15.8,
        marketShare: 42.1
      },
      {
        category: 'Accounting Services',
        revenue: 156000,
        orders: 78,
        avgPrice: 2000,
        growthRate: 22.3,
        marketShare: 23.0
      },
      {
        category: 'Legal Consulting',
        revenue: 124000,
        orders: 62,
        avgPrice: 2000,
        growthRate: 18.7,
        marketShare: 18.3
      },
      {
        category: 'Banking Solutions',
        revenue: 89000,
        orders: 45,
        avgPrice: 1978,
        growthRate: 12.1,
        marketShare: 13.1
      },
      {
        category: 'Tax Services',
        revenue: 23000,
        orders: 15,
        avgPrice: 1533,
        growthRate: 8.9,
        marketShare: 3.4
      }
    ];

    setServicePerformance(mockServiceData);
  };

  const exportReport = async (reportType: string) => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (reportType) {
        case 'revenue':
          data = revenueData;
          filename = 'revenue_report.csv';
          break;
        case 'consultants':
          data = consultantPerformance;
          filename = 'consultant_performance.csv';
          break;
        case 'countries':
          data = countryPerformance;
          filename = 'country_performance.csv';
          break;
        case 'services':
          data = servicePerformance;
          filename = 'service_performance.csv';
          break;
        default:
          return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      await logAdminAction('EXPORT_FINANCIAL_REPORT', 'reports', null, null, { reportType, dateRange });
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (growth < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
              <h1 className="text-2xl font-bold text-gray-900">Financial Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive financial analysis and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="last_12_months">Last 12 Months</option>
                <option value="all_time">All Time</option>
              </select>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                <div className={`flex items-center space-x-1 mt-1 ${getGrowthColor(stats.revenueGrowth)}`}>
                  {getGrowthIcon(stats.revenueGrowth)}
                  <span className="text-sm font-medium">{formatPercentage(stats.revenueGrowth)}</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.monthlyRevenue)}</p>
                <div className="flex items-center space-x-1 mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+12.3%</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.platformFees)}</p>
                <div className="flex items-center space-x-1 mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+8.7%</span>
                </div>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.avgOrderValue)}</p>
                <div className="flex items-center space-x-1 mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+5.2%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
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
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{formatPercentage(stats.conversionRate)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultant Commissions</p>
                <p className="text-3xl font-bold text-indigo-600">{formatCurrency(stats.totalCommissions)}</p>
              </div>
              <Award className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Revenue Overview', icon: BarChart3 },
                { key: 'consultants', label: 'Consultant Performance', icon: Users },
                { key: 'countries', label: 'Country Analysis', icon: Globe },
                { key: 'services', label: 'Service Performance', icon: Building },
                { key: 'analytics', label: 'Advanced Analytics', icon: Activity }
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
                {/* Revenue Chart Placeholder */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 12 Months)</h3>
                    <button
                      onClick={() => exportReport('revenue')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {revenueData.slice(-4).map((data, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">{data.month}</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(data.revenue)}</p>
                        <p className="text-xs text-gray-500">{data.orders} orders</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Revenue Breakdown</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCommissions)}</p>
                        <p className="text-sm text-gray-600">Consultant Commissions (65%)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.platformFees)}</p>
                        <p className="text-sm text-gray-600">Platform Fees (35%)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="text-sm text-gray-600">Total Revenue (100%)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Consultant</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        N
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stats.topConsultant}</p>
                        <p className="text-sm text-gray-600">Georgia Specialist</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-green-600 font-medium">{formatCurrency(245000)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">89 orders</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Country</h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">🇬🇪</div>
                      <div>
                        <p className="font-semibold text-gray-900">{stats.topCountry}</p>
                        <p className="text-sm text-gray-600">Strategic Gateway</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-green-600 font-medium">{formatPercentage(35.2)} market share</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">+18.5% growth</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consultants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Consultant Performance Analysis</h3>
                  <button
                    onClick={() => exportReport('consultants')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {consultantPerformance.map((consultant, index) => (
                    <div key={consultant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                              'bg-gradient-to-br from-orange-400 to-red-500'
                            }`}>
                              {consultant.name[0]}
                            </div>
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-500' :
                                'bg-orange-500'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{consultant.name}</h4>
                            <p className="text-sm text-gray-600">{consultant.country} Specialist</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <Award className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-gray-600">{consultant.rating}/5</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-600">{consultant.clientCount} clients</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(consultant.totalRevenue)}</p>
                            <p className="text-xs text-gray-600">Total Revenue</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">{consultant.totalOrders}</p>
                            <p className="text-xs text-gray-600">Orders</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{formatCurrency(consultant.commissionEarned)}</p>
                            <p className="text-xs text-gray-600">Commission</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-600">{formatPercentage(consultant.conversionRate)}</p>
                            <p className="text-xs text-gray-600">Conversion</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'countries' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Country Performance Analysis</h3>
                  <button
                    onClick={() => exportReport('countries')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {countryPerformance.map((country) => (
                    <div key={country.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="text-4xl">{country.flag}</div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{country.name}</h4>
                          <p className="text-sm text-gray-600">{country.consultantCount} consultants</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm text-gray-600">Market Share</p>
                          <p className="text-lg font-bold text-purple-600">{formatPercentage(country.marketShare)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(country.totalRevenue)}</p>
                          <p className="text-xs text-green-700">Total Revenue</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-blue-600">{country.totalOrders}</p>
                          <p className="text-xs text-blue-700">Total Orders</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Avg Order:</span>
                          <span className="font-medium text-gray-900 ml-1">{formatCurrency(country.avgOrderValue)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getGrowthColor(country.growthRate)}`}>
                          {getGrowthIcon(country.growthRate)}
                          <span className="font-medium">{formatPercentage(country.growthRate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Service Category Performance</h3>
                  <button
                    onClick={() => exportReport('services')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {servicePerformance.map((service, index) => (
                    <div key={service.category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}>
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{service.category}</h4>
                            <p className="text-sm text-gray-600">{service.orders} orders completed</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(service.revenue)}</p>
                            <p className="text-xs text-gray-600">Revenue</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(service.avgPrice)}</p>
                            <p className="text-xs text-gray-600">Avg Price</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">{formatPercentage(service.marketShare)}</p>
                            <p className="text-xs text-gray-600">Market Share</p>
                          </div>
                          <div className={`${getGrowthColor(service.growthRate)}`}>
                            <div className="flex items-center justify-center space-x-1">
                              {getGrowthIcon(service.growthRate)}
                              <p className="text-lg font-bold">{formatPercentage(service.growthRate)}</p>
                            </div>
                            <p className="text-xs text-gray-600">Growth</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial Health Score */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Score</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">92/100</div>
                      <p className="text-green-700 font-medium">Excellent</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Revenue Growth</span>
                          <span className="text-green-600 font-medium">95/100</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Client Retention</span>
                          <span className="text-green-600 font-medium">88/100</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Profitability</span>
                          <span className="text-green-600 font-medium">94/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Performance Indicators */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">Monthly Recurring Revenue</span>
                        </div>
                        <span className="font-bold text-blue-600">{formatCurrency(45000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">Customer Lifetime Value</span>
                        </div>
                        <span className="font-bold text-blue-600">{formatCurrency(8500)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calculator className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">Customer Acquisition Cost</span>
                        </div>
                        <span className="font-bold text-blue-600">{formatCurrency(250)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-700">Avg Time to Close</span>
                        </div>
                        <span className="font-bold text-blue-600">12 days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Metrics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Revenue Forecast</h4>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(125000)}</p>
                      <p className="text-sm text-gray-600">Next month projection</p>
                    </div>

                    <div className="text-center">
                      <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Client Satisfaction</h4>
                      <p className="text-2xl font-bold text-green-600">4.8/5</p>
                      <p className="text-sm text-gray-600">Average rating</p>
                    </div>

                    <div className="text-center">
                      <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Efficiency Score</h4>
                      <p className="text-2xl font-bold text-orange-600">87%</p>
                      <p className="text-sm text-gray-600">Operational efficiency</p>
                    </div>
                  </div>
                </div>

                {/* Predictive Analytics */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Revenue Predictions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Q1 2025 Forecast</span>
                          <span className="font-bold text-green-600">{formatCurrency(285000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Annual Target</span>
                          <span className="font-bold text-blue-600">{formatCurrency(1200000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Achievement Rate</span>
                          <span className="font-bold text-purple-600">78%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Market Insights</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Fastest Growing Market</span>
                          <span className="font-bold text-green-600">🇦🇪 UAE (+22.1%)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Most Profitable Service</span>
                          <span className="font-bold text-blue-600">Company Formation</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Peak Season</span>
                          <span className="font-bold text-purple-600">Q4 (Oct-Dec)</span>
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
    </div>
  );
};

export default FinancialReports;