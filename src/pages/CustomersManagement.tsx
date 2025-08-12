import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MultilingualChat from '../components/MultilingualChat';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Globe, 
  Send, 
  Eye,
  Edit,
  Plus,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  MapPin,
  Building,
  Mail,
  Phone,
  Calendar,
  FileText,
  Star,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface CrossCountryOrder {
  id: string;
  order_number: string;
  source_consultant_id: string;
  target_consultant_id: string;
  source_country: string;
  target_country: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_type: string;
  service_details: any;
  total_amount: number;
  referral_commission: number;
  consultant_commission: number;
  platform_fee: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  estimated_completion_days: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  source_consultant?: {
    full_name: string;
    email: string;
    country: string;
  };
  target_consultant?: {
    full_name: string;
    email: string;
    country: string;
  };
}

interface ConsultantReferral {
  id: string;
  referring_consultant_id: string;
  receiving_consultant_id: string;
  order_id: string;
  client_email: string;
  service_type: string;
  referral_fee: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  paid_at?: string;
  created_at: string;
}

interface NewOrderForm {
  target_country: string;
  target_consultant_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  service_details: {
    company_name?: string;
    business_type?: string;
    special_requirements?: string;
    urgency_reason?: string;
  };
  total_amount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_completion_days: number;
  notes: string;
}

const CustomersManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'referrals' | 'new-order'>('received');
  const [receivedOrders, setReceivedOrders] = useState<CrossCountryOrder[]>([]);
  const [sentOrders, setSentOrders] = useState<CrossCountryOrder[]>([]);
  const [referrals, setReferrals] = useState<ConsultantReferral[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<CrossCountryOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState<NewOrderForm>({
    target_country: '',
    target_consultant_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: 'company_formation',
    service_details: {},
    total_amount: 0,
    priority: 'medium',
    estimated_completion_days: 14,
    notes: ''
  });

  // Stats calculations
  const totalReceived = receivedOrders.length;
  const totalSent = sentOrders.length;
  const completedOrders = [...receivedOrders, ...sentOrders].filter(o => o.status === 'completed').length;
  const totalReferralEarnings = referrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.referral_fee, 0);
  const totalConsultantEarnings = receivedOrders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.consultant_commission, 0);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchReceivedOrders(),
        fetchSentOrders(),
        fetchReferrals(),
        fetchConsultants()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedOrders = async () => {
    const { data, error } = await supabase
      .from('cross_country_orders')
      .select(`
        *,
        source_consultant:source_consultant_id (
          full_name,
          email,
          country
        )
      `)
      .eq('target_consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReceivedOrders(data || []);
  };

  const fetchSentOrders = async () => {
    const { data, error } = await supabase
      .from('cross_country_orders')
      .select(`
        *,
        target_consultant:target_consultant_id (
          full_name,
          email,
          country
        )
      `)
      .eq('source_consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSentOrders(data || []);
  };

  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from('consultant_referrals')
      .select('*')
      .eq('referring_consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReferrals(data || []);
  };

  const fetchConsultants = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        country,
        consultant_country_assignments!inner (
          country_id,
          countries (
            name,
            flag_emoji
          )
        )
      `)
      .eq('role', 'consultant')
      .neq('id', profile?.id);

    if (error) throw error;
    setConsultants(data || []);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        source_consultant_id: profile?.id,
        target_consultant_id: newOrderForm.target_consultant_id,
        source_country: profile?.country || 'Georgia',
        target_country: newOrderForm.target_country,
        client_name: newOrderForm.client_name,
        client_email: newOrderForm.client_email,
        client_phone: newOrderForm.client_phone,
        service_type: newOrderForm.service_type,
        service_details: newOrderForm.service_details,
        total_amount: newOrderForm.total_amount,
        priority: newOrderForm.priority,
        estimated_completion_days: newOrderForm.estimated_completion_days,
        notes: newOrderForm.notes
      };

      const { error } = await supabase
        .from('cross_country_orders')
        .insert([orderData]);

      if (error) throw error;

      await fetchData();
      setShowNewOrderForm(false);
      setNewOrderForm({
        target_country: '',
        target_consultant_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        service_type: 'company_formation',
        service_details: {},
        total_amount: 0,
        priority: 'medium',
        estimated_completion_days: 14,
        notes: ''
      });
      
      alert('Cross-country order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cross_country_orders')
        .update({ 
          status: newStatus,
          actual_completion_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', orderId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
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

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
    { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'MT', name: 'Malta', flag: '🇲🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' }
  ];

  const serviceTypes = [
    { value: 'company_formation', label: 'Company Formation' },
    { value: 'bank_account_opening', label: 'Bank Account Opening' },
    { value: 'tax_residency', label: 'Tax Residency' },
    { value: 'visa_residence', label: 'Visa & Residence' },
    { value: 'accounting_services', label: 'Accounting Services' },
    { value: 'legal_consulting', label: 'Legal Consulting' },
    { value: 'investment_advisory', label: 'Investment Advisory' },
    { value: 'custom_service', label: 'Custom Service' }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Cross-Country Customers</h1>
              <p className="text-gray-600 mt-1">Manage international client referrals and cross-border services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewOrderForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Refer Client</span>
              </button>
              <button
                onClick={fetchData}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received Orders</p>
                <p className="text-3xl font-bold text-blue-600">{totalReceived}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-600 rotate-180" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent Orders</p>
                <p className="text-3xl font-bold text-green-600">{totalSent}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-purple-600">{completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referral Earnings</p>
                <p className="text-3xl font-bold text-orange-600">${totalReferralEarnings.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Earnings</p>
                <p className="text-3xl font-bold text-indigo-600">${totalConsultantEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Commission Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Country Commission Structure</h3>
              <p className="text-gray-600">Revenue sharing for international client referrals and services</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">10%</div>
                <div className="text-sm text-gray-600">Referral Fee</div>
                <div className="text-xs text-gray-500">To referring consultant</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">55%</div>
                <div className="text-sm text-gray-600">Service Fee</div>
                <div className="text-xs text-gray-500">To executing consultant</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">35%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
                <div className="text-xs text-gray-500">To Consulting19</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'received', label: 'Received Orders', icon: ArrowRight, count: totalReceived, rotation: 'rotate-180' },
                { key: 'sent', label: 'Sent Orders', icon: ArrowRight, count: totalSent, rotation: '' },
                { key: 'referrals', label: 'My Referrals', icon: TrendingUp, count: referrals.length, rotation: '' },
                { key: 'new-order', label: 'Refer Client', icon: Plus, count: 0, rotation: '' }
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
                  <tab.icon className={`h-4 w-4 ${tab.rotation}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients, orders, or countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'received' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Orders Received from Other Countries</h3>
                  <span className="text-sm text-gray-500">You earn 55% commission on these orders</span>
                </div>
                
                {receivedOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4 rotate-180" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Received Orders</h3>
                    <p className="text-gray-600">No orders have been referred to you from other consultants yet.</p>
                  </div>
                ) : (
                  receivedOrders
                    .filter(order => {
                      const matchesSearch = 
                        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
                      const matchesCountry = countryFilter === 'all' || order.source_country === countryFilter;
                      return matchesSearch && matchesStatus && matchesCountry;
                    })
                    .map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          {/* Left Side - Order Info */}
                          <div className="flex-1 max-w-[40%]">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-blue-100 rounded-lg p-2">
                                <ArrowRight className="h-5 w-5 text-blue-600 rotate-180" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                                <p className="text-sm text-gray-500">
                                  From {order.source_country} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {serviceTypes.find(s => s.value === order.service_type)?.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Status & Actions */}
                          <div className="flex-1 max-w-[60%] ml-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Status */}
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`}></div>
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
                                  Your Commission: ${order.consultant_commission.toLocaleString()} (55%)
                                </div>
                                <div className="text-xs text-gray-500">
                                  Referral Fee: ${order.referral_commission.toLocaleString()} (10%)
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderModal(true);
                                  }}
                                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>

                                {order.status === 'pending' && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'accepted')}
                                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors text-xs"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'rejected')}
                                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors text-xs"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}

                                {(order.status === 'accepted' || order.status === 'in_progress') && (
                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                )}
                              </div>
                            </div>

                            {/* Service Details */}
                            {order.service_details && Object.keys(order.service_details).length > 0 && (
                              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-2">Service Requirements:</div>
                                <div className="space-y-1">
                                  {order.service_details.company_name && (
                                    <div className="text-sm text-gray-600">Company: {order.service_details.company_name}</div>
                                  )}
                                  {order.service_details.business_type && (
                                    <div className="text-sm text-gray-600">Type: {order.service_details.business_type}</div>
                                  )}
                                  {order.service_details.special_requirements && (
                                    <div className="text-sm text-gray-600">Requirements: {order.service_details.special_requirements}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Orders Sent to Other Countries</h3>
                  <span className="text-sm text-gray-500">You earn 10% referral commission on these orders</span>
                </div>
                
                {sentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sent Orders</h3>
                    <p className="text-gray-600">You haven't referred any clients to other countries yet.</p>
                    <button
                      onClick={() => setActiveTab('new-order')}
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Refer Your First Client
                    </button>
                  </div>
                ) : (
                  sentOrders
                    .filter(order => {
                      const matchesSearch = 
                        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
                      const matchesCountry = countryFilter === 'all' || order.target_country === countryFilter;
                      return matchesSearch && matchesStatus && matchesCountry;
                    })
                    .map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          {/* Left Side - Order Info */}
                          <div className="flex-1 max-w-[40%]">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-green-100 rounded-lg p-2">
                                <ArrowRight className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                                <p className="text-sm text-gray-500">
                                  To {order.target_country} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {order.target_consultant?.full_name || 'Consultant TBD'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Status & Earnings */}
                          <div className="flex-1 max-w-[60%] ml-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Status */}
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`}></div>
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
                                <div className="text-sm text-orange-600 font-medium">
                                  Your Referral: ${order.referral_commission.toLocaleString()} (10%)
                                </div>
                                <div className="text-xs text-gray-500">
                                  Consultant Gets: ${order.consultant_commission.toLocaleString()} (55%)
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderModal(true);
                                  }}
                                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  onClick={() => setIsChatOpen(true)}
                                  className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Message</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Orders Sent to Other Countries</h3>
                  <span className="text-sm text-gray-500">Track your client referrals and earn 10% commission</span>
                </div>
                
                {sentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sent Orders</h3>
                    <p className="text-gray-600">You haven't referred any clients to other countries yet.</p>
                    <button
                      onClick={() => setActiveTab('new-order')}
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Refer Your First Client
                    </button>
                  </div>
                ) : (
                  sentOrders
                    .filter(order => {
                      const matchesSearch = 
                        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
                      const matchesCountry = countryFilter === 'all' || order.target_country === countryFilter;
                      return matchesSearch && matchesStatus && matchesCountry;
                    })
                    .map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          {/* Left Side - Order Info */}
                          <div className="flex-1 max-w-[40%]">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="bg-green-100 rounded-lg p-2">
                                <ArrowRight className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                                <p className="text-sm text-gray-500">
                                  To {order.target_country} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{order.client_email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {order.target_consultant?.full_name || 'Consultant TBD'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Status & Earnings */}
                          <div className="flex-1 max-w-[60%] ml-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Status */}
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(order.priority)}`}></div>
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
                                <div className="text-sm text-orange-600 font-medium">
                                  Your Referral: ${order.referral_commission.toLocaleString()} (10%)
                                </div>
                                <div className="text-xs text-gray-500">
                                  Consultant Gets: ${order.consultant_commission.toLocaleString()} (55%)
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderModal(true);
                                  }}
                                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  onClick={() => setIsChatOpen(true)}
                                  className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Message</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Referral Commission Tracking</h3>
                  <span className="text-sm text-gray-500">Total earned: ${totalReferralEarnings.toLocaleString()}</span>
                </div>
                
                {referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h3>
                    <p className="text-gray-600">Start referring clients to earn 10% commission on their orders.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{referral.client_email}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                                {referral.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Service:</span> {referral.service_type.replace('_', ' ')}
                              </div>
                              <div>
                                <span className="font-medium">Referral Fee:</span> ${referral.referral_fee.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(referral.created_at).toLocaleDateString()}
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

            {activeTab === 'new-order' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Refer Client to Another Country</h3>
                  <p className="text-gray-600 mb-8">
                    Refer your client to a specialist consultant in another country and earn 10% commission.
                  </p>

                  <form onSubmit={handleCreateOrder} className="space-y-6">
                    {/* Client Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newOrderForm.client_name}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, client_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter client's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={newOrderForm.client_email}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, client_email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="client@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Phone
                      </label>
                      <input
                        type="tel"
                        value={newOrderForm.client_phone}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, client_phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Service Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Country *
                        </label>
                        <select
                          required
                          value={newOrderForm.target_country}
                          onChange={(e) => {
                            setNewOrderForm(prev => ({ ...prev, target_country: e.target.value }));
                            // Reset consultant selection when country changes
                            setNewOrderForm(prev => ({ ...prev, target_consultant_id: '' }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select target country</option>
                          {countries.map(country => (
                            <option key={country.code} value={country.name}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Consultant *
                        </label>
                        <select
                          required
                          value={newOrderForm.target_consultant_id}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, target_consultant_id: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={!newOrderForm.target_country}
                        >
                          <option value="">Select consultant</option>
                          {consultants
                            .filter(c => c.country === newOrderForm.target_country)
                            .map(consultant => (
                              <option key={consultant.id} value={consultant.id}>
                                {consultant.full_name} ({consultant.email})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type *
                        </label>
                        <select
                          required
                          value={newOrderForm.service_type}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, service_type: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {serviceTypes.map(service => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority Level *
                        </label>
                        <select
                          required
                          value={newOrderForm.priority}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Service Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name (if applicable)
                          </label>
                          <input
                            type="text"
                            value={newOrderForm.service_details.company_name || ''}
                            onChange={(e) => setNewOrderForm(prev => ({ 
                              ...prev, 
                              service_details: { ...prev.service_details, company_name: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Desired company name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type
                          </label>
                          <select
                            value={newOrderForm.service_details.business_type || ''}
                            onChange={(e) => setNewOrderForm(prev => ({ 
                              ...prev, 
                              service_details: { ...prev.service_details, business_type: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select business type</option>
                            <option value="llc">Limited Liability Company (LLC)</option>
                            <option value="corporation">Corporation</option>
                            <option value="partnership">Partnership</option>
                            <option value="sole_proprietorship">Sole Proprietorship</option>
                            <option value="holding_company">Holding Company</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Requirements
                        </label>
                        <textarea
                          rows={3}
                          value={newOrderForm.service_details.special_requirements || ''}
                          onChange={(e) => setNewOrderForm(prev => ({ 
                            ...prev, 
                            service_details: { ...prev.service_details, special_requirements: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Any special requirements or preferences..."
                        />
                      </div>
                    </div>

                    {/* Financial & Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Amount (USD) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={newOrderForm.total_amount}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Your referral commission: ${(newOrderForm.total_amount * 0.10).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Completion (Days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={newOrderForm.estimated_completion_days}
                          onChange={(e) => setNewOrderForm(prev => ({ ...prev, estimated_completion_days: parseInt(e.target.value) || 14 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h5 className="font-medium text-purple-900 mb-2">Commission Breakdown</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Your Referral (10%):</span>
                            <span className="font-medium">${(newOrderForm.total_amount * 0.10).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Consultant (55%):</span>
                            <span className="font-medium">${(newOrderForm.total_amount * 0.55).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Platform (35%):</span>
                            <span className="font-medium">${(newOrderForm.total_amount * 0.35).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        rows={4}
                        value={newOrderForm.notes}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Any additional information for the receiving consultant..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowNewOrderForm(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Send className="h-5 w-5" />
                        <span>Send Referral</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.order_number}</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Client Name:</span>
                      <p className="font-medium">{selectedOrder.client_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedOrder.client_email}</p>
                    </div>
                    {selectedOrder.client_phone && (
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedOrder.client_phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Service Type:</span>
                      <p className="font-medium">
                        {serviceTypes.find(s => s.value === selectedOrder.service_type)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Countries:</span>
                      <p className="font-medium">{selectedOrder.source_country} → {selectedOrder.target_country}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        selectedOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        selectedOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedOrder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedOrder.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">${selectedOrder.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">${selectedOrder.referral_commission.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Referral Fee (10%)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${selectedOrder.consultant_commission.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Consultant Fee (55%)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">${selectedOrder.platform_fee.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Platform Fee (35%)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              {selectedOrder.service_details && Object.keys(selectedOrder.service_details).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Requirements</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedOrder.service_details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-blue-700 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm text-blue-900 font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multilingual Chat Modal */}
      <MultilingualChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatType="consultant-client"
        currentUserId={profile?.id || 'consultant-1'}
        currentUserRole="consultant"
      />
    </div>
  );
};

export default CustomersManagement;