import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Users,
  CreditCard,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Filter,
  Eye,
  Wallet,
  Target,
  Award,
  Zap,
  Globe,
  Building
} from 'lucide-react';

interface PaymentStats {
  totalEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalClients: number;
  activeOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  referralEarnings: number;
  platformFeeDeducted: number;
}

interface CommissionBreakdown {
  id: string;
  source: 'legacy_order' | 'service_order' | 'accounting_payment' | 'referral';
  source_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  platform_fee: number;
  net_earnings: number;
  status: 'pending' | 'processed' | 'paid';
  created_at: string;
  client_name?: string;
  service_name?: string;
  order_number?: string;
}

interface PaymentRequest {
  id: string;
  consultant_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  request_date: string;
  processed_date?: string;
  notes?: string;
  admin_notes?: string;
}

interface MonthlyReport {
  month: string;
  year: number;
  total_revenue: number;
  commission_earned: number;
  platform_fees: number;
  net_earnings: number;
  orders_count: number;
  clients_count: number;
  avg_order_value: number;
}

const ConsultantPayments = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    yearlyEarnings: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    totalClients: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    referralEarnings: 0,
    platformFeeDeducted: 0
  });
  const [commissions, setCommissions] = useState<CommissionBreakdown[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'requests' | 'reports' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  useEffect(() => {
    if (profile?.id) {
      fetchPaymentData();
    }
  }, [profile, selectedPeriod]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - in real app this would come from webhook-processed data
      const mockStats: PaymentStats = {
        totalEarnings: 47250.00,
        monthlyEarnings: 8420.00,
        yearlyEarnings: 47250.00,
        pendingCommissions: 2150.00,
        paidCommissions: 45100.00,
        totalClients: 23,
        activeOrders: 8,
        completedOrders: 67,
        averageOrderValue: 1850.00,
        conversionRate: 85.5,
        referralEarnings: 3200.00,
        platformFeeDeducted: 25485.00
      };

      const mockCommissions: CommissionBreakdown[] = [
        {
          id: '1',
          source: 'legacy_order',
          source_id: 'ORD-2024-001',
          amount: 2500.00,
          commission_rate: 65,
          commission_amount: 1625.00,
          platform_fee: 875.00,
          net_earnings: 1625.00,
          status: 'pending',
          created_at: new Date().toISOString(),
          client_name: 'Tech Startup LLC',
          service_name: 'Company Formation',
          order_number: 'ORD-2024-001'
        },
        {
          id: '2',
          source: 'service_order',
          source_id: 'SRV-2024-015',
          amount: 800.00,
          commission_rate: 70,
          commission_amount: 560.00,
          platform_fee: 240.00,
          net_earnings: 560.00,
          status: 'processed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          client_name: 'Global Trading Co',
          service_name: 'Tax Consultation',
          order_number: 'SRV-2024-015'
        },
        {
          id: '3',
          source: 'accounting_payment',
          source_id: 'ACC-2024-089',
          amount: 500.00,
          commission_rate: 60,
          commission_amount: 300.00,
          platform_fee: 200.00,
          net_earnings: 300.00,
          status: 'paid',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          client_name: 'Investment Fund Ltd',
          service_name: 'Monthly Accounting',
          order_number: 'ACC-2024-089'
        }
      ];

      const mockPaymentRequests: PaymentRequest[] = [
        {
          id: '1',
          consultant_id: profile?.id || '',
          amount: 5200.00,
          currency: 'USD',
          status: 'pending',
          request_date: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Monthly commission payout request for December 2024'
        },
        {
          id: '2',
          consultant_id: profile?.id || '',
          amount: 4800.00,
          currency: 'USD',
          status: 'paid',
          request_date: new Date(Date.now() - 2592000000).toISOString(),
          processed_date: new Date(Date.now() - 2505600000).toISOString(),
          notes: 'Monthly commission payout request for November 2024',
          admin_notes: 'Processed successfully via bank transfer'
        }
      ];

      const mockMonthlyReports: MonthlyReport[] = [
        {
          month: 'December',
          year: 2024,
          total_revenue: 12500.00,
          commission_earned: 8125.00,
          platform_fees: 4375.00,
          net_earnings: 8125.00,
          orders_count: 8,
          clients_count: 6,
          avg_order_value: 1562.50
        },
        {
          month: 'November',
          year: 2024,
          total_revenue: 11200.00,
          commission_earned: 7280.00,
          platform_fees: 3920.00,
          net_earnings: 7280.00,
          orders_count: 7,
          clients_count: 5,
          avg_order_value: 1600.00
        },
        {
          month: 'October',
          year: 2024,
          total_revenue: 9800.00,
          commission_earned: 6370.00,
          platform_fees: 3430.00,
          net_earnings: 6370.00,
          orders_count: 6,
          clients_count: 4,
          avg_order_value: 1633.33
        }
      ];

      setStats(mockStats);
      setCommissions(mockCommissions);
      setPaymentRequests(mockPaymentRequests);
      setMonthlyReports(mockMonthlyReports);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRequest = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // In real implementation, this would create a payment request in the database
      // and notify admins via webhook
      const newRequest: PaymentRequest = {
        id: Date.now().toString(),
        consultant_id: profile?.id || '',
        amount: parseFloat(requestAmount),
        currency: 'USD',
        status: 'pending',
        request_date: new Date().toISOString(),
        notes: requestNotes
      };

      setPaymentRequests(prev => [newRequest, ...prev]);
      setShowPaymentRequestModal(false);
      setRequestAmount('');
      setRequestNotes('');
      
      alert('Payment request submitted successfully! Admin will be notified.');
    } catch (error) {
      console.error('Error submitting payment request:', error);
      alert('Failed to submit payment request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'legacy_order': return <Building className="h-4 w-4" />;
      case 'service_order': return <Target className="h-4 w-4" />;
      case 'accounting_payment': return <FileText className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'legacy_order': return 'Legacy Order';
      case 'service_order': return 'Service Order';
      case 'accounting_payment': return 'Accounting Service';
      case 'referral': return 'Referral Bonus';
      default: return source;
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
              <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>
              <p className="text-gray-600 mt-1">Track your earnings, commissions, and payment requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPaymentRequestModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Send className="h-5 w-5" />
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
        {/* Period Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="current_year">Current Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold">${stats.totalEarnings.toLocaleString()}</p>
                <p className="text-green-200 text-sm">+23% from last month</p>
              </div>
              <Wallet className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Monthly Earnings</p>
                <p className="text-3xl font-bold">${stats.monthlyEarnings.toLocaleString()}</p>
                <p className="text-blue-200 text-sm">This month</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-sm text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pending Commissions</p>
                <p className="text-3xl font-bold">${stats.pendingCommissions.toLocaleString()}</p>
                <p className="text-purple-200 text-sm">Awaiting processing</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                <p className="text-orange-200 text-sm">Client success rate</p>
              </div>
              <Target className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageOrderValue.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-gray-900">${stats.referralEarnings.toLocaleString()}</p>
              </div>
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-gray-900">${stats.platformFeeDeducted.toLocaleString()}</p>
              </div>
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">${(stats.totalEarnings - stats.platformFeeDeducted).toLocaleString()}</p>
              </div>
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'commissions', label: 'Commission Breakdown', icon: DollarSign },
                { key: 'requests', label: 'Payment Requests', icon: Send },
                { key: 'reports', label: 'Monthly Reports', icon: FileText },
                { key: 'analytics', label: 'Analytics', icon: PieChart }
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Earnings Chart Placeholder */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Earnings Trend</h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Earnings chart visualization</p>
                      <p className="text-sm text-gray-500">Webhook integration will provide real-time data</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Commission Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Revenue:</span>
                        <span className="font-medium">${(stats.totalEarnings + stats.platformFeeDeducted).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee (35%):</span>
                        <span className="font-medium text-red-600">-${stats.platformFeeDeducted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Net Earnings (65%):</span>
                        <span className="font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Clients:</span>
                        <span className="font-medium">{stats.totalClients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium text-green-600">{stats.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Order Value:</span>
                        <span className="font-medium">${stats.averageOrderValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid Out:</span>
                        <span className="font-medium text-green-600">${stats.paidCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-medium text-yellow-600">${stats.pendingCommissions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Payout:</span>
                        <span className="font-medium text-blue-600">Jan 1, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Commission Breakdown</h3>
                  <div className="text-sm text-gray-600">
                    All commissions are calculated via webhook integration
                  </div>
                </div>

                <div className="space-y-4">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="bg-purple-100 rounded-lg p-2">
                              {getSourceIcon(commission.source)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {commission.service_name} - {commission.client_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {getSourceLabel(commission.source)} • {commission.order_number}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                              {commission.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Order Amount:</span>
                              <p className="font-medium text-gray-900">${commission.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Commission Rate:</span>
                              <p className="font-medium text-blue-600">{commission.commission_rate}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Commission:</span>
                              <p className="font-medium text-green-600">${commission.commission_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Platform Fee:</span>
                              <p className="font-medium text-red-600">${commission.platform_fee.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Net Earnings:</span>
                              <p className="font-bold text-green-700">${commission.net_earnings.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500">
                            Processed: {new Date(commission.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Payment Requests</h3>
                  <button
                    onClick={() => setShowPaymentRequestModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>New Request</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentRequests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                      <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
                      <p className="text-gray-600 mb-6">You haven't submitted any payment requests yet.</p>
                      <button
                        onClick={() => setShowPaymentRequestModal(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Submit First Request
                      </button>
                    </div>
                  ) : (
                    paymentRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="bg-green-100 rounded-lg p-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  ${request.amount.toLocaleString()} {request.currency}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Requested: {new Date(request.request_date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>

                            {request.notes && (
                              <p className="text-gray-700 mb-3">{request.notes}</p>
                            )}

                            {request.admin_notes && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <p className="text-sm text-blue-800">
                                  <strong>Admin Notes:</strong> {request.admin_notes}
                                </p>
                              </div>
                            )}

                            {request.processed_date && (
                              <div className="mt-3 text-sm text-gray-600">
                                Processed: {new Date(request.processed_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Monthly Reports</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export All</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {monthlyReports.map((report, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {report.month} {report.year}
                        </h4>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Export</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">${report.total_revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-600 font-medium">Commission Earned</p>
                          <p className="text-2xl font-bold text-blue-700">${report.commission_earned.toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-purple-600 font-medium">Orders</p>
                          <p className="text-2xl font-bold text-purple-700">{report.orders_count}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <p className="text-sm text-orange-600 font-medium">Avg Order Value</p>
                          <p className="text-2xl font-bold text-orange-700">${report.avg_order_value.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Revenue Sources */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Revenue Sources</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Legacy Orders</span>
                        </div>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">Custom Services</span>
                        </div>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-700">Accounting Services</span>
                        </div>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Trends */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Performance Trends</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Monthly Growth</span>
                        <span className="font-medium text-green-600">+23%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Client Retention</span>
                        <span className="font-medium text-blue-600">94%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Referral Rate</span>
                        <span className="font-medium text-purple-600">18%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Integration Status */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Webhook Integration</h4>
                      <p className="text-gray-600">Real-time commission tracking and payment processing</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Order Processing</span>
                      </div>
                      <p className="text-xs text-gray-600">Automatic commission calculation on order completion</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Payment Tracking</span>
                      </div>
                      <p className="text-xs text-gray-600">Real-time payment status updates</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Admin Notifications</span>
                      </div>
                      <p className="text-xs text-gray-600">Automatic admin alerts for payment requests</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Request Modal */}
      {showPaymentRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Request Payment</h2>
                <button
                  onClick={() => setShowPaymentRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Available Balance */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">Available for Withdrawal</p>
                    <p className="text-2xl font-bold text-green-800">${stats.pendingCommissions.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Request Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Amount (USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={stats.pendingCommissions}
                  step="0.01"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ${stats.pendingCommissions.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional notes for admin..."
                />
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Payment Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Payments are processed monthly by admin</p>
                  <p>• Processing time: 3-5 business days</p>
                  <p>• Admin will be automatically notified</p>
                  <p>• Bank transfer to registered account</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPaymentRequestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentRequest}
                  disabled={!requestAmount || parseFloat(requestAmount) <= 0}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
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