import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import MultilingualChat from '../components/MultilingualChat';
import AccountSettingsPage from './AccountSettingsPage';
import ClientServices from './ClientServices';
import ConsultantServices from './ConsultantServices';
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
  Users,
  TrendingUp,
  Globe2,
  Star,
  Package,
  Settings,
  Mail,
  Truck,
  CreditCard,
  MapPin,
  X,
  Save
} from 'lucide-react';

interface ClientAccountingProfile {
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
  const navigate = useNavigate();

  const [accountingProfile, setAccountingProfile] = useState<ClientAccountingProfile | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'invoices' | 'messages' | 'mailbox'>('overview');

  // Quick Actions states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentType, setUploadDocumentType] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<ClientInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);

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
        setError('No client record found. Please contact support.');
        return;
      }

      // Fetch accounting client profile - FIXED: Remove .single() to handle multiple results
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
        .eq('client_id', clientData.id);

      if (accountingError) {
        console.error('Error fetching accounting profile:', accountingError);
        await createDefaultAccountingProfile(clientData.id);
        return;
      }

      // Handle multiple results - take the first one
      if (!accountingData || accountingData.length === 0) {
        await createDefaultAccountingProfile(clientData.id);
        return;
      }

      if (accountingData.length > 1) {
        console.warn('Multiple accounting profiles found, using the first one');
      }

      setAccountingProfile(accountingData[0]);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('accounting_documents')
        .select('*')
        .eq('client_id', accountingData[0].id)
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
        .eq('client_id', accountingData[0].id)
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
        .eq('client_id', accountingData[0].id)
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
      // FIXED: Check if an accounting profile already exists to prevent duplicates
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

  // Quick Actions handlers
  const handleMessageConsultant = () => {
    setIsChatOpen(true);
  };

  const handleUploadDocumentClick = () => {
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const confirmUpload = async () => {
    if (!uploadFile || !uploadDocumentType) {
      alert('Please select a file and document type');
      return;
    }

    setUploadLoading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would upload to Supabase Storage
      // and create a record in accounting_documents table
      
      alert(`Document "${uploadFile.name}" uploaded successfully!`);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadDocumentType('');
      setUploadDescription('');
      
      // Refresh documents
      await fetchAccountingData();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePayInvoiceClick = () => {
    const unpaidInvoice = invoices.find(i => i.status === 'sent' || i.status === 'overdue');
    if (unpaidInvoice) {
      setSelectedInvoiceToPay(unpaidInvoice);
      setShowPayInvoiceModal(true);
    } else {
      alert('No unpaid invoices found.');
    }
  };

  const confirmPayInvoice = async () => {
    if (!selectedInvoiceToPay) return;

    setPaymentProcessing(true);
    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update invoice status to paid
      const { error } = await supabase
        .from('accounting_invoices')
        .update({ status: 'paid' })
        .eq('id', selectedInvoiceToPay.id);

      if (error) throw error;

      alert(`Invoice ${selectedInvoiceToPay.invoice_number} paid successfully!`);
      setShowPayInvoiceModal(false);
      setSelectedInvoiceToPay(null);
      
      // Refresh invoices
      await fetchAccountingData();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleAccountSettings = () => {
    navigate('/account-settings');
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
                              <button 
                                onClick={handleUploadDocumentClick}
                                className="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-100"
                              >
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
                              <button 
                                onClick={handlePayInvoiceClick}
                                className="rounded-lg bg-green-50 px-4 py-2 font-medium text-green-600 transition-colors hover:bg-green-100"
                              >
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
                <button 
                  onClick={handleMessageConsultant}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700"
                >
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
                  <button 
                    onClick={handleUploadDocumentClick}
                    className="bg-green-500 hover:bg-green-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Upload className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Upload Document</div>
                  </button>

                  <button 
                    onClick={handlePayInvoiceClick}
                    className="bg-blue-500 hover:bg-blue-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <CreditCard className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Pay Invoice</div>
                  </button>

                  <button 
                    onClick={handleMessageConsultant}
                    className="bg-purple-500 hover:bg-purple-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <MessageSquare className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Message Consultant</div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('documents')}
                    className="bg-indigo-500 hover:bg-indigo-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <FileText className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">View Reports</div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('documents')}
                    className="bg-teal-500 hover:bg-teal-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Download className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Download Files</div>
                  </button>

                  <button 
                    onClick={() => navigate('/client-services')}
                    className="bg-orange-500 hover:bg-orange-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Settings className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Additional Services</div>
                  </button>

                  <button 
                    onClick={() => setShowAccountSettingsModal(true)}
                    className="bg-gray-500 hover:bg-gray-600 group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Settings className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="text-xs font-medium">Account Settings</div>
                  </button>
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
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-300" />
                    <span className="font-bold">5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Chat Modal */}
      {accountingProfile.consultant && (
        <MultilingualChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatType="consultant-client"
          currentUserId={profile?.id || 'client-1'}
          currentUserRole="client"
          targetUserId={accountingProfile.consultant_id}
        />
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={uploadDocumentType}
                    onChange={(e) => setUploadDocumentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select document type</option>
                    <option value="Financial Statement">Financial Statement</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Tax Document">Tax Document</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Receipt">Receipt</option>
                    <option value="Contract">Contract</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief description of the document..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                  {uploadFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={uploadLoading || !uploadFile || !uploadDocumentType}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Invoice Modal */}
      {showPayInvoiceModal && selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Pay Invoice</h3>
                <button
                  onClick={() => setShowPayInvoiceModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Invoice Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">{selectedInvoiceToPay.invoice_number}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">${selectedInvoiceToPay.amount} {selectedInvoiceToPay.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-900">
                      {selectedInvoiceToPay.due_date ? new Date(selectedInvoiceToPay.due_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoiceToPay.status)}`}>
                      {selectedInvoiceToPay.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'bank')}
                      className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Credit Card</span>
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Pay securely with your credit card</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'bank')}
                      className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Bank Transfer</span>
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Direct bank transfer</p>
                    </div>
                  </label>
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
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

      {/* Account Settings Modal */}
      {showAccountSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                <button
                  onClick={() => setShowAccountSettingsModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={profile?.country || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={profile?.address || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={profile?.city || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={profile?.state || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={profile?.postal_code || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={profile?.phone || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about your documents and invoices</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive updates about new services and features</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAccountSettingsModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
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