import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ClientRecommendations from '../components/client/ClientRecommendations';
import UpcomingPayments from '../components/client/UpcomingPayments';
import RequestCustomServiceModal from '../components/client/RequestCustomServiceModal';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import StripeCheckout from '../components/StripeCheckout';
import MultilingualChat from '../components/MultilingualChat';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Upload,
  Download,
  MessageSquare,
  Bell,
  DollarSign,
  Eye,
  Search,
  Filter,
  Mail,
  Plus,
  Lightbulb,
  Star,
  TrendingUp,
  Globe,
  Building,
  User,
  Shield,
  Zap
} from 'lucide-react';

interface ClientAccountingProfile {
  id: string;
  company_name: string;
  tax_number?: string;
  business_type: string;
  accounting_period: string;
  service_package: string;
  monthly_fee: number;
  status: string;
  next_deadline?: string;
  consultant?: {
    full_name: string;
    email: string;
  };
}

interface ClientDocument {
  id: string;
  document_type: string;
  category: string;
  title: string;
  due_date?: string;
  received_date?: string;
  status: 'pending' | 'received' | 'processed' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  file_url?: string;
}

interface ClientInvoice {
  id: string;
  invoice_number: string;
  period_start?: string;
  period_end?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  sent_at?: string;
  paid_at?: string;
}

interface ClientMessage {
  id: string;
  subject?: string;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

const ClientAccountingDashboard = () => {
  const { profile } = useAuth();
  const [accountingProfile, setAccountingProfile] = useState<ClientAccountingProfile | null>(null);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'invoices' | 'messages' | 'mailbox'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInvoiceCheckout, setShowInvoiceCheckout] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      console.log('🔍 ClientAccountingDashboard: Starting data fetch for profile:', profile.id, profile.email)
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      console.log('📊 Starting comprehensive data fetch...')
      // First fetch accounting profile
      await fetchAccountingProfile();
      
      // Then fetch other data after profile is loaded
      setTimeout(async () => {
        console.log('📋 Fetching additional data...')
        await Promise.all([
          fetchDocuments(),
          fetchInvoices(),
          fetchMessages()
        ]);
      }, 500);
    } catch (error) {
      console.error('💥 Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountingProfile = async () => {
    console.log('🔍 Step 1: Fetching accounting profile for user:', profile?.id, profile?.email)
    
    // First get the client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile?.id)
      .limit(1);

    if (clientError) {
      console.error('❌ Error fetching client:', clientError);
      return;
    }

    const client = clientData?.[0];
    console.log('📋 Step 2: Client record lookup result:', client)

    if (!client) {
      console.log('⚠️ No client record found for profile:', profile?.id)
      console.log('🔧 Creating client record automatically...')
      
      // Auto-create client record if missing
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          profile_id: profile?.id,
          assigned_consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83', // Georgia consultant
          status: 'new',
          priority: 'medium',
          service_type: 'company_formation',
          progress: 0
        }])
        .select()
        .limit(1);
      
      if (clientError || !newClient?.[0]) {
        console.error('❌ Error creating client record:', clientError);
        return;
      }
      
      console.log('✅ Client record created:', newClient[0]);
      setClientId(newClient[0].id);
      
      // Now create accounting profile
      const { data: newAccountingProfile, error: accountingError } = await supabase
        .from('accounting_clients')
        .insert([{
          client_id: newClient[0].id,
          consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
          company_name: 'Georgia Tech Solutions LLC',
          business_type: 'limited_company',
          accounting_period: 'monthly',
          service_package: 'basic',
          monthly_fee: 500,
          status: 'active',
          reminder_frequency: 7,
          preferred_language: 'en'
        }])
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          )
        `)
        .limit(1);
      
      if (accountingError || !newAccountingProfile?.[0]) {
        console.error('❌ Error creating accounting profile:', accountingError);
        return;
      }
      
      console.log('✅ Accounting profile created:', newAccountingProfile[0]);
      setAccountingProfile(newAccountingProfile[0]);
      return;
    }

    setClientId(client.id);

    const { data: accountingData, error } = await supabase
      .from('accounting_clients')
      .select(`
        *,
        consultant:consultant_id (
          full_name,
          email
        )
      `)
      .eq('client_id', client.id)
      .limit(1);

    console.log('💼 Step 3: Accounting profile lookup result:', accountingData)

    if (error) {
      console.error('❌ Error fetching accounting profile:', error.message, error.code);
      
      if (error.code === 'PGRST116') {
        // No accounting profile found, create one
      console.log('⚠️ No accounting profile found for client:', client.id)
      console.log('🔧 Creating accounting profile automatically...')
      
      // Auto-create accounting profile if missing
      const { data: newAccountingProfile, error: accountingError } = await supabase
        .from('accounting_clients')
        .insert([{
          client_id: client.id,
          consultant_id: '3732cae6-3238-44b6-9c6b-2f29f0216a83',
          company_name: 'Georgia Tech Solutions LLC',
          business_type: 'limited_company',
          accounting_period: 'monthly',
          service_package: 'basic',
          monthly_fee: 500,
          status: 'active',
          reminder_frequency: 7,
          preferred_language: 'en'
        }])
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          )
        `)
        .limit(1);
      
      if (accountingError || !newAccountingProfile?.[0]) {
        console.error('❌ Error creating accounting profile:', accountingError);
        return;
      }
      return;
      }
      
      console.log('✅ Accounting profile auto-created:', newAccountingProfile[0]);
      setAccountingProfile(newAccountingProfile[0]);
      return;
    }

    if (accountingData?.[0]) {
      setAccountingProfile(accountingData[0]);
    }
  };

  const fetchDocuments = async () => {
    if (!accountingProfile) return;

    const { data, error } = await supabase
      .from('accounting_documents')
      .select('*')
      .eq('client_id', accountingProfile.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    setDocuments(data || []);
  };

  const fetchInvoices = async () => {
    if (!accountingProfile) return;

    const { data, error } = await supabase
      .from('accounting_invoices')
      .select('*')
      .eq('client_id', accountingProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return;
    }

    setInvoices(data || []);
  };

  const fetchMessages = async () => {
    // First get the client record to get the client_id for accounting_clients
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile?.id)
      .limit(1);

    if (clientError || !clientData?.[0]) {
      console.error('Error fetching client for messages:', clientError);
      return;
    }

    const client = clientData[0];

    // Then get the accounting_client record
    const { data: accountingClientData, error: accountingError } = await supabase
      .from('accounting_clients')
      .select('id')
      .eq('client_id', client.id)
      .limit(1);

    if (accountingError || !accountingClientData?.[0]) {
      console.error('Error fetching accounting client for messages:', accountingError);
      return;
    }

    const { data, error: messageError } = await supabase
      .from('accounting_messages')
      .select(`
        *,
        sender:sender_id (
          full_name,
          email
        )
      `)
      .eq('recipient_id', profile?.id)
      .order('created_at', { ascending: false });

    if (messageError) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handlePayInvoice = (invoice: ClientInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceCheckout(true);
  };

  const handleInvoicePaymentSuccess = async (paymentIntentId: string) => {
    setShowInvoiceCheckout(false);
    setSelectedInvoice(null);
    
    // Update invoice status
    if (selectedInvoice) {
      await supabase
        .from('accounting_invoices')
        .update({ 
          status: 'paid',
          stripe_invoice_id: paymentIntentId
        })
        .eq('id', selectedInvoice.id);
    }
    
    await fetchInvoices();
    alert('Invoice payment successful!');
  };

  const handleInvoicePaymentError = (error: string) => {
    alert(`Invoice payment failed: ${error}`);
  };

  const handleInvoicePaymentCancel = () => {
    setShowInvoiceCheckout(false);
    setSelectedInvoice(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
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

  const overdueDocuments = documents.filter(d => d.status === 'overdue').length;
  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
  const unreadMessages = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!accountingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounting Profile</h3>
          <p className="text-gray-600">Your accounting profile is not set up yet. Please contact your consultant.</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your documents, invoices, and accounting communications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Consultant</p>
                <p className="font-medium text-gray-900">{accountingProfile.consultant?.full_name}</p>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Danışmanla İletişim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Payments Warning System */}
        <div className="mb-8">
          <UpcomingPayments clientId={clientId} />
        </div>

        {/* AI-Powered Client Recommendations */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h2>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  3 new
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Personalized recommendations based on your business profile and goals
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="border-l-4 border-l-blue-500 bg-blue-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">Estonia E-Residency Program</h4>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">Based on your tech business profile, Estonia's e-Residency could provide significant tax advantages and EU market access.</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>AI Recommendation</span>
                          <span>•</span>
                          <span>95% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-l-green-500 bg-green-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Tax Optimization Service</h4>
                        <p className="text-sm text-gray-700 mb-2">Our analysis shows you could save 15-20% on taxes with proper structure optimization.</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Service Recommendation</span>
                          <span>•</span>
                          <span>Potential savings: $3,000/year</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-l-purple-500 bg-purple-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <Globe className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">UAE Free Zone Expansion</h4>
                        <p className="text-sm text-gray-700 mb-2">Consider expanding to UAE for Middle East market access with 0% corporate tax benefits.</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Market Opportunity</span>
                          <span>•</span>
                          <span>High growth potential</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View All Recommendations (5) →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Service Request System */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200 mb-8">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Custom Service</h2>
            <p className="text-lg text-gray-600 mb-6">
              Need a specialized service? Request a custom solution from your consultant.
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Request Custom Service</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingDocuments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Documents</p>
                <p className="text-3xl font-bold text-red-600">{overdueDocuments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid Invoices</p>
                <p className="text-3xl font-bold text-orange-600">{unpaidInvoices}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Messages</p>
                <p className="text-3xl font-bold text-blue-600">{unreadMessages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="font-medium text-gray-900">{accountingProfile.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Type</p>
              <p className="font-medium text-gray-900">{accountingProfile.business_type.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Package</p>
              <p className="font-medium text-gray-900">{accountingProfile.service_package}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Fee</p>
              <p className="font-medium text-gray-900">${accountingProfile.monthly_fee}</p>
            </div>
          </div>
          {accountingProfile.next_deadline && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Next Deadline: {new Date(accountingProfile.next_deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
                { key: 'invoices', label: 'Invoices', icon: DollarSign, count: invoices.length },
                { key: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages },
                { key: 'mailbox', label: 'Virtual Mailbox', icon: Mail, count: 0 }
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
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
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
                {/* Recent Documents */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{document.title}</p>
                            <p className="text-sm text-gray-600">Due: {document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Invoices */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-600">
                            {invoice.period_start && invoice.period_end 
                              ? `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(invoice.period_end).toLocaleDateString()}`
                              : 'One-time invoice'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${invoice.amount}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="processed">Processed</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
                    <p className="text-gray-600">No documents have been assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents
                      .filter(doc => {
                        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((document) => (
                        <div key={document.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                                <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                                  {document.status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                  <span className="font-medium">Type:</span> {document.document_type}
                                </div>
                                <div>
                                  <span className="font-medium">Category:</span> {document.category}
                                </div>
                                <div>
                                  <span className="font-medium">Due Date:</span> 
                                  <span className={document.due_date && new Date(document.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                    {document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {document.file_url ? (
                                <button className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2">
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </button>
                              ) : (
                                <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2">
                                  <Upload className="h-4 w-4" />
                                  <span>Upload</span>
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

            {activeTab === 'invoices' && (
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices</h3>
                    <p className="text-gray-600">No invoices have been generated yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Amount:</span> ${invoice.amount} {invoice.currency}
                              </div>
                              <div>
                                <span className="font-medium">Period:</span> 
                                {invoice.period_start && invoice.period_end 
                                  ? `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(invoice.period_end).toLocaleDateString()}`
                                  : 'One-time'
                                }
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span> 
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Paid:</span> 
                                {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Not paid'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2">
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                              <button 
                                onClick={() => handlePayInvoice(invoice)}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                              >
                                Pay ${invoice.amount}
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

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
                    <p className="text-gray-600">No messages from your consultant yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`rounded-lg p-6 ${message.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{message.sender?.full_name}</p>
                              <p className="text-sm text-gray-600">{new Date(message.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {!message.is_read && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                        
                        {message.subject && (
                          <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                        )}
                        
                        <p className="text-gray-700">{message.message}</p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.message_type === 'urgent' ? 'bg-red-100 text-red-800' :
                            message.message_type === 'reminder' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.message_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mailbox' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">My Virtual Mailbox</h3>
                  <p className="text-gray-600">Receive official documents digitally and request physical shipping when needed</p>
                </div>
                <VirtualMailboxManager viewMode="client" clientId={clientId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Payment Checkout */}
      {showInvoiceCheckout && selectedInvoice && (
        <StripeCheckout
          isOpen={showInvoiceCheckout}
          onClose={handleInvoicePaymentCancel}
          amount={selectedInvoice.amount}
          currency={selectedInvoice.currency}
          orderId={selectedInvoice.id}
          orderDetails={{
            serviceName: `Invoice ${selectedInvoice.invoice_number}`,
            consultantName: accountingProfile?.consultant?.full_name || 'Consultant',
            deliveryTime: 0
          }}
          onSuccess={handleInvoicePaymentSuccess}
          onError={handleInvoicePaymentError}
        />
      )}

      {/* Multilingual Chat Modal */}
      {accountingProfile && (
        <MultilingualChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatType="consultant-client"
          currentUserId={profile?.id || 'client-1'}
          currentUserRole="client"
          targetUserId={accountingProfile.consultant_id}
        />
      )}

      {/* Custom Service Request Modal */}
      {showRequestModal && (
        <RequestCustomServiceModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            alert('Custom service request submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default ClientAccountingDashboard;