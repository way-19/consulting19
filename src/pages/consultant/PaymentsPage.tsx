import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ConsultantLayout from '../../components/consultant/ConsultantLayout';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Users,
  CreditCard,
  Download,
  Send,
  Clock,
  CheckCircle,
  BarChart3,
  Wallet,
  Target,
  Award,
  RefreshCw
} from 'lucide-react';

interface PaymentStats {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalClients: number;
  averageOrderValue: number;
  conversionRate: number;
}

const PaymentsPage = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    totalClients: 0,
    averageOrderValue: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'requests'>('overview');

  useEffect(() => {
    if (profile?.id) {
      fetchPaymentData();
    }
  }, [profile]);

  const fetchPaymentData = async () => {
    try {
      // Mock data for demonstration
      const mockStats: PaymentStats = {
        totalEarnings: 47250.00,
        monthlyEarnings: 8420.00,
        pendingCommissions: 2150.00,
        paidCommissions: 45100.00,
        totalClients: 23,
        averageOrderValue: 1850.00,
        conversionRate: 85.5
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ConsultantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ConsultantLayout>
    );
  }

  return (
    <ConsultantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payments & Earnings</h2>
            <p className="text-gray-600">Track your earnings, commissions, and payment requests</p>
          </div>
          <button
            onClick={fetchPaymentData}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-purple-100 text-sm font-medium">Pending</p>
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'commissions', label: 'Commission Breakdown', icon: DollarSign },
                { key: 'requests', label: 'Payment Requests', icon: Send }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
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
              <div className="space-y-8">
                {/* Commission Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Commission Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Revenue:</span>
                        <span className="font-medium">${(stats.totalEarnings * 1.54).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee (35%):</span>
                        <span className="font-medium text-red-600">-${(stats.totalEarnings * 0.54).toLocaleString()}</span>
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

                {/* Earnings Chart Placeholder */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Earnings Trend</h3>
                  <div className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Earnings chart visualization</p>
                      <p className="text-sm text-gray-500">Real-time data from webhook integration</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Commission Details</h3>
                  <p className="text-gray-600">Detailed commission breakdown will be available here</p>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Payment Requests</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>New Request</span>
                  </button>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Available for Withdrawal</p>
                      <p className="text-2xl font-bold text-green-800">${stats.pendingCommissions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
                  <p className="text-gray-600 mb-6">You haven't submitted any payment requests yet.</p>
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Submit First Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConsultantLayout>
  );
};

export default PaymentsPage;