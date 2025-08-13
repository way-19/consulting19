import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import MultilingualChat from '../components/MultilingualChat';
import AccountSettingsPage from './AccountSettingsPage';
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
            