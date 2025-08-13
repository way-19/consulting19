import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import {
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  MessageSquare,
  DollarSign,
  Eye,
  Users,
  TrendingUp,
  Globe2,
  Star,
  Package,
  Settings,
  CreditCard,
} from 'lucide-react';

  Settings,
  Mail,
  Truck
  id: string;
  client_id: string;
  consultant_id: string;
  company_name: string;
  tax_number?: string;
  business_type: string;
  accounting_period: string;
  service_package: string;
  monthly_fee: number;
  status: string;
  last_document_received?: string;
  next_deadline?: string;
  reminder_frequency: number;
  preferred_language?: string;
  created_at: string;
  updated_at: string;
  consultant?: {
    full_name: string;
    email: string;
  };
  client?: {
    profile?: {
      full_name: string;
      email: string;
    };
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
  amount: number;
  currency: string;
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  created_at: string;
}

interface ClientMessage {
  id: string;
  subject?: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

interface VirtualMailboxItem {
  id: string;
  document_type: string;
  document_name: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'downloaded';
  tracking_number: string;
  shipping_fee: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
}
const ClientAccountingDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  const [accountingProfile, setAccountingProfile] = useState<ClientAccountingProfile | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'invoices' | 'messages' | 'mailbox'>('overview');

  useEffect(() => {
    if (profile?.id) {
      fetchAccountingData();
    }
  }, [profile]);

  const fetchAccountingData = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the client record to find the accounting client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (clientError) {
        console.error('Error fetching client:', clientError);
        // If no client record exists, show message
        setError('No client record found. Please contact support.');
        return;
      }

      // Fetch accounting client profile
      const { data: accountingData, error: accountingError } = await supabase
        .from('accounting_clients')
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          ),
          client:client_id (
            profile:profile_id (
              full_name,
              email
            )
          )
        `)
        .eq('client_id', clientData.id)
        .single();

      if (accountingError) {
        console.error('Error fetching accounting profile:', accountingError);
        // If no accounting profile exists, create a default one
        await createDefaultAccountingProfile(clientData.id);
        return;
      }

      setAccountingProfile(accountingData);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('accounting_documents')
        .select('*')
        .eq('client_id', accountingData.id)
        .order('due_date', { ascending: true });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      } else {
        setDocuments(documentsData || []);
      }

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('accounting_invoices')
        .select('*')
        .eq('client_id', accountingData.id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
      } else {
        setInvoices(invoicesData || []);
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('accounting_messages')
        .select(`
          *,
          sender:sender_id (
            full_name,
            email
          )
        `)
        .eq('client_id', accountingData.id)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessages(messagesData || []);
      }

    } catch (error) {
      console.error('Error in fetchAccountingData:', error);
      setError('Failed to load accounting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAccountingProfile = async (clientId: string) => {
    try {
      // First check if an accounting profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('accounting_clients')
        .select('id')
        .eq('client_id', clientId);

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        setError('Failed to check existing accounting profile.');
        return;
      }

      if (existingProfile && existingProfile.length > 0) {
        console.log('Accounting profile already exists, fetching data...');
        await fetchAccountingData();
        return;
      }

      // Get the consultant assigned to this client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('assigned_consultant_id, company_name')
        .eq('id', clientId)
        .single();

      if (clientError || !clientData?.assigned_consultant_id) {
        setError('No assigned consultant found. Please contact support.');
        return;
      }

      // Create default accounting profile
      const { data: newProfile, error: createError } = await supabase
        .from('accounting_clients')
        .insert([{
          client_id: clientId,
          consultant_id: clientData.assigned_consultant_id,
          company_name: clientData.company_name || 'Company Name Not Set',
          business_type: 'limited_company',
          accounting_period: 'monthly',
          service_package: 'basic',
          monthly_fee: 500, // Default fee, consultant can adjust
          status: 'active',
          reminder_frequency: 7,
          preferred_language: 'en'
        }])
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          ),
          client:client_id (
            profile:profile_id (
              full_name,
              email
            )
          )
        `)
        .single();

      if (createError) {
        console.error('Error creating accounting profile:', createError);
        setError('Failed to create accounting profile. Please contact support.');
      } else {
        setAccountingProfile(newProfile);
      }
    } catch (error) {
      console.error('Error creating default profile:', error);
      setError('Failed to setup accounting profile. Please contact support.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your accounting dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAccountingData}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!accountingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Accounting Profile</h2>
          <p className="text-gray-600 mb-4">
            You don't have an accounting profile yet. This will be created automatically when you order accounting services.
          </p>
          <Link
            to="/client-services"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Browse Services</span>
          </Link>
        </div>
      </div>
    );
  }

  const overdueDocuments = documents.filter((d) => d.status === 'overdue').length;
  const pendingDocuments = documents.filter((d) => d.status === 'pending').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  const stats = [
    {
      name: 'Pending Documents',
      value: pendingDocuments.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+2',
      changeType: 'neutral',
      description: 'Documents awaiting submission',
    },
    {
      name: 'Overdue Items',
      value: overdueDocuments.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '0',
      changeType: 'positive',
      description: 'Items past due date',
    },
    {
      name: 'Unpaid Invoices',
      value: unpaidInvoices.toString(),
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+1',
      changeType: 'neutral',
      description: 'Outstanding payments',
    },
    {
      name: 'New Messages',
      value: unreadMessages.toString(),
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: '+3',
      changeType: 'neutral',
      description: 'Unread messages',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/image.png"
                alt="Consulting19 Logo"
                className="h-16 w-32"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe2 className="hidden h-16 w-32 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Client Accounting Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 rounded-full bg-green-100 px-4 py-2 text-green-800">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm font-medium">{accountingProfile.status.toUpperCase()}</span>
              </div>
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                {profile?.role || 'client'} • {accountingProfile.company_name}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || profile?.email || user?.email || 'Client'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Consultant: {accountingProfile.consultant?.full_name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {accountingProfile.service_package.charAt(0).toUpperCase() + accountingProfile.service_package.slice(1)} Package
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border border-blue-200 bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'border border-blue-200 bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Documents ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'invoices'
                  ? 'border border-blue-200 bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Invoices ({invoices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'border border-blue-200 bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages ({unreadMessages})</span>
            </button>
            <button
              onClick={() => setActiveTab('mailbox')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'mailbox'
                  ? 'border border-blue-200 bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Virtual Mailbox</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="transform rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : stat.changeType === 'neutral'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Company Info */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Company Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="font-medium text-gray-900">{accountingProfile.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Type</p>
              <p className="font-medium text-gray-900">
                {accountingProfile.business_type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Package</p>
              <p className="font-medium text-gray-900">
                {accountingProfile.service_package.charAt(0).toUpperCase() + accountingProfile.service_package.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Fee</p>
              <p className="font-medium text-green-600 text-lg">${accountingProfile.monthly_fee.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {accountingProfile.accounting_period.charAt(0).toUpperCase() + accountingProfile.accounting_period.slice(1)} billing
              </p>
            </div>
          </div>
          {accountingProfile.next_deadline && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  Next Deadline: {new Date(accountingProfile.next_deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'documents' && 'My Documents'}
                {activeTab === 'invoices' && 'My Invoices'}
                {activeTab === 'messages' && 'Messages from Consultant'}
                {activeTab === 'mailbox' && 'Virtual Mailbox'}
              </h2>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Documents */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Documents</h3>
                    {documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No documents yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {documents.slice(0, 3).map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`h-3 w-3 rounded-full ${getPriorityColor(document.priority)}`} />
                              <div>
                                <p className="font-medium text-gray-900">{document.title}</p>
                                <p className="text-sm text-gray-600">
                                  Due: {document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(document.status)}`}>
                              {document.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Invoices */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    {invoices.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No invoices yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoices.slice(0, 2).map((invoice) => (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${invoice.amount} {invoice.currency}</p>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
                      <p className="text-gray-600">Your consultant will add documents here when needed.</p>
                    </div>
                  ) : (
                    documents.map((document) => (
                      <div key={document.id} className="rounded-lg bg-gray-50 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-4">
                              <div className={`h-3 w-3 rounded-full ${getPriorityColor(document.priority)}`} />
                              <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(document.status)}`}>
                                {document.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="mb-4 grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                              <div>
                                <span className="font-medium">Type:</span> {document.document_type}
                              </div>
                              <div>
                                <span className="font-medium">Category:</span> {document.category}
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span>{' '}
                                <span
                                  className={
                                    document.due_date && new Date(document.due_date) < new Date()
                                      ? 'font-medium text-red-600'
                                      : ''
                                  }
                                >
                                  {document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {document.file_url ? (
                              <button className="flex items-center space-x-2 rounded-lg bg-green-50 px-4 py-2 font-medium text-green-600 transition-colors hover:bg-green-100">
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            ) : (
                              <button className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-100">
                                <Upload className="h-4 w-4" />
                                <span>Upload</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
                      <p className="text-gray-600">Invoices will appear here when generated by your consultant.</p>
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="rounded-lg bg-gray-50 p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-4">
                              <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                              <div>
                                <span className="font-medium">Amount:</span> ${invoice.amount} {invoice.currency}
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span>{' '}
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span>{' '}
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 rounded-lg bg-purple-50 px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-100">
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                              <button className="rounded-lg bg-green-50 px-4 py-2 font-medium text-green-600 transition-colors hover:bg-green-100">
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                      <p className="text-gray-600">Messages from your consultant will appear here.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg p-6 ${message.is_read ? 'bg-gray-50' : 'border border-blue-200 bg-blue-50'}`}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{message.sender?.full_name || 'Consultant'}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(message.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {!message.is_read && (
                            <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">New</span>
                          )}
                        </div>

                        {message.subject && (
                          <h4 className="mb-2 font-medium text-gray-900">{message.subject}</h4>
                        )}

                        <p className="text-gray-700">{message.message}</p>

                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              message.category === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : message.category === 'reminder'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {message.category.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'mailbox' && (
                <div>
                  <VirtualMailboxManager viewMode="client" />
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Consultant */}
            {accountingProfile.consultant && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Consultant</h3>
                <div className="mb-4 flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">
                    {accountingProfile.consultant.full_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{accountingProfile.consultant.full_name}</p>
                    <p className="text-sm text-gray-600">{accountingProfile.consultant.email}</p>
                    <div className="mt-1 flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs text-gray-500">4.9 Rating</span>
                    </div>
                  </div>
                </div>
                <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700">
                  <MessageSquare className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Upload Document', icon: Upload, color: 'bg-green-500 hover:bg-green-600' },
                    { name: 'Pay Invoice', icon: CreditCard, color: 'bg-blue-500 hover:bg-blue-600' },
                    { name: 'Message Consultant', icon: MessageSquare, color: 'bg-purple-500 hover:bg-purple-600' },
                    { name: 'View Reports', icon: FileText, color: 'bg-indigo-500 hover:bg-indigo-600' },
                    { name: 'Download Files', icon: Download, color: 'bg-teal-500 hover:bg-teal-600' },
                    { name: 'Account Settings', icon: Settings, color: 'bg-gray-500 hover:bg-gray-600' },
                  ].map((action, index) => (
                    <button
                      key={index}
                      className={`${action.color} group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
                    >
                      <action.icon className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      <div className="text-xs font-medium">{action.name}</div>
                    </button>
                  ))}

                  {/* Additional Services Button */}
                  <Link
                    to="/client-services"
                    className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group cursor-pointer"
                  >
                    <Package className="h-5 w-5 mx-auto mb-2 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium text-center">Additional Services</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Service Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Package Type:</span>
                  <span className="font-medium text-gray-900">
                    {accountingProfile.service_package.charAt(0).toUpperCase() + accountingProfile.service_package.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Billing Period:</span>
                  <span className="font-medium text-gray-900">
                    {accountingProfile.accounting_period.charAt(0).toUpperCase() + accountingProfile.accounting_period.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Fee:</span>
                  <span className="font-bold text-green-600 text-lg">${accountingProfile.monthly_fee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reminder Frequency:</span>
                  <span className="font-medium text-gray-900">{accountingProfile.reminder_frequency} days</span>
                </div>
                {accountingProfile.last_document_received && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Document:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(accountingProfile.last_document_received).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">This Month</h3>
                <TrendingUp className="h-6 w-6 text-blue-200" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Documents Submitted</span>
                  <span className="font-bold">
                    {documents.filter((d) => d.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Invoices Paid</span>
                  <span className="font-bold">
                    {invoices.filter((i) => i.status === 'paid').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Service Rating</span>
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedMailboxItem, setSelectedMailboxItem] = useState<VirtualMailboxItem | null>(null);
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-300" />
                    <span className="font-bold">5.0</span>
                    Document Type
                  </label>
                  <select
                    value={uploadDocumentType}
                    onChange={(e) => setUploadDocumentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select document type</option>
                    <option value="financial_statement">Financial Statement</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="tax_document">Tax Document</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="contract">Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief description of the document..."
                  />
                </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG, XLSX, XLS (Max 10MB)
                  </p>
                </div>
              </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={uploadProcessing || !uploadFile || !uploadDocumentType}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadProcessing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-5 w-5" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            </div>
      {/* Pay Invoice Modal */}
      {showPayInvoiceModal && selectedInvoiceToPay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Pay Invoice</h3>
                <button
                  onClick={() => setShowPayInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
          </div>
              {/* Invoice Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4">{selectedInvoiceToPay.invoice_number}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">${selectedInvoiceToPay.amount} {selectedInvoiceToPay.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-gray-900">
                      {selectedInvoiceToPay.due_date ? new Date(selectedInvoiceToPay.due_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoiceToPay.status)}`}>
                      {selectedInvoiceToPay.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
        </div>
              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Credit/Debit Card</span>
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Secure payment via Stripe</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">Bank Transfer</span>
                      <p className="text-sm text-gray-600">Direct bank transfer</p>
                    </div>
                  </label>
                </div>
              </div>
      </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowPayInvoiceModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayInvoice}
                  disabled={paymentProcessing}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Pay ${selectedInvoiceToPay.amount}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAccountingDashboard;