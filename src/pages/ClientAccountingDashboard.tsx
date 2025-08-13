import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
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
  CreditCard,
  Settings,
  Mail,
  Truck,
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

  const [accountingProfile, setAccountingProfile] =
    useState<ClientAccountingProfile | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'invoices' | 'messages' | 'mailbox'
  >('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedMailboxItem, setSelectedMailboxItem] =
    useState<VirtualMailboxItem | null>(null);
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>(
    'standard',
  );
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleShippingPayment = async () => {
    if (!selectedMailboxItem) return;

    setPaymentLoading(true);
    try {
      const shippingFee = shippingOption === 'standard' ? 15 : 25;

      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({
          shipping_fee: shippingFee,
          payment_status: 'paid',
          status: 'sent',
          sent_date: new Date().toISOString(),
        })
        .eq('id', selectedMailboxItem.id);

      if (error) throw error;

      setShowShippingModal(false);
      setSelectedMailboxItem(null);
      await fetchVirtualMailboxItems();

      alert(
        `Payment successful! Your document will be shipped via ${shippingOption} delivery ($${shippingFee}). Tracking number will be provided once shipped.`,
      );
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchVirtualMailboxItems = async () => {
    // TODO: Supabase'den gerçek verileri çek
    // Şimdilik boş bırakıyoruz / mock ile çalışabilirsiniz.
  };

  console.log('🔵 ClientDashboard render:', {
    loading,
    user: !!user,
    profile: !!profile,
    profileRole: profile?.role,
  });

  // Mock data for demo
  useEffect(() => {
    const mockProfile: ClientAccountingProfile = {
      id: 'mock-client-1',
      company_name: 'Georgia Tech Solutions LLC',
      tax_number: 'GE123456789',
      business_type: 'limited_company',
      accounting_period: 'monthly',
      service_package: 'basic',
      monthly_fee: 500,
      status: 'active',
      next_deadline: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      consultant: {
        full_name: 'Nino Kvaratskhelia',
        email: 'georgia@consulting19.com',
      },
    };

    const mockDocuments: ClientDocument[] = [
      {
        id: '1',
        document_type: 'Monthly Financial Report',
        category: 'financial',
        title: 'December 2024 Financial Report',
        due_date: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'pending',
        priority: 'high',
      },
      {
        id: '2',
        document_type: 'Tax Declaration',
        category: 'tax',
        title: 'Q4 2024 Tax Declaration',
        due_date: new Date(
          Date.now() + 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'pending',
        priority: 'medium',
      },
      {
        id: '3',
        document_type: 'Bank Statement',
        category: 'financial',
        title: 'November 2024 Bank Statement',
        received_date: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'completed',
        priority: 'low',
      },
    ];

    const mockInvoices: ClientInvoice[] = [
      {
        id: '1',
        invoice_number: 'INV-2024-001',
        period_start: '2024-12-01',
        period_end: '2024-12-31',
        amount: 500,
        currency: 'USD',
        status: 'sent',
        due_date: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        sent_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: '2',
        invoice_number: 'INV-2024-002',
        period_start: '2024-11-01',
        period_end: '2024-11-30',
        amount: 500,
        currency: 'USD',
        status: 'paid',
        due_date: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        paid_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];

    const mockMessages: ClientMessage[] = [
      {
        id: '1',
        subject: 'Monthly Report Reminder',
        message:
          'Please submit your December financial documents by the end of this week.',
        message_type: 'reminder',
        is_read: false,
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        sender: {
          full_name: 'Nino Kvaratskhelia',
          email: 'georgia@consulting19.com',
        },
      },
      {
        id: '2',
        subject: 'Welcome to Accounting Services',
        message:
          'Welcome to our accounting services! I will be your dedicated consultant.',
        message_type: 'general',
        is_read: true,
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        sender: {
          full_name: 'Nino Kvaratskhelia',
          email: 'georgia@consulting19.com',
        },
      },
    ];

    setAccountingProfile(mockProfile);
    setDocuments(mockDocuments);
    setInvoices(mockInvoices);
    setMessages(mockMessages);
  }, []);

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

  const overdueDocuments = documents.filter((d) => d.status === 'overdue').length;
  const pendingDocuments = documents.filter((d) => d.status === 'pending').length;
  const unpaidInvoices = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'overdue',
  ).length;
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
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/image.png"
                alt="Consulting19 Logo"
                className="h-16 w-32"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
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
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                {profile?.role || 'client'} • Georgia Tech Solutions
              </span>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || profile?.email || user?.email || 'Client'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Consultant: Nino Kvaratskhelia
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Premium Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
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
        {/* Stats Cards */}
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

        {/* Company Info Card */}
        {accountingProfile && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Company Information
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium text-gray-900">
                  {accountingProfile.company_name}
                </p>
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
                  {accountingProfile.service_package}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Fee</p>
                <p className="font-medium text-gray-900">
                  ${accountingProfile.monthly_fee}
                </p>
              </div>
            </div>
            {accountingProfile.next_deadline && (
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    Next Deadline:{' '}
                    {new Date(accountingProfile.next_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Tab Content */}
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
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Recent Documents
                    </h3>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`h-3 w-3 rounded-full ${getPriorityColor(
                                document.priority,
                              )}`}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {document.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                Due:{' '}
                                {document.due_date
                                  ? new Date(
                                      document.due_date,
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                              document.status,
                            )}`}
                          >
                            {document.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Invoices */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Recent Invoices
                    </h3>
                    <div className="space-y-3">
                      {invoices.slice(0, 2).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {invoice.invoice_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              {invoice.period_start && invoice.period_end
                                ? `${new Date(
                                    invoice.period_start,
                                  ).toLocaleDateString()} - ${new Date(
                                    invoice.period_end,
                                  ).toLocaleDateString()}`
                                : 'One-time invoice'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${invoice.amount}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                invoice.status,
                              )}`}
                            >
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
                  {documents.map((document) => (
                    <div key={document.id} className="rounded-lg bg-gray-50 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-4">
                            <div
                              className={`h-3 w-3 rounded-full ${getPriorityColor(
                                document.priority,
                              )}`}
                            ></div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {document.title}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                document.status,
                              )}`}
                            >
                              {document.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="mb-4 grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              {document.document_type}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span>{' '}
                              {document.category}
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span>{' '}
                              <span
                                className={
                                  document.due_date &&
                                  new Date(document.due_date) < new Date()
                                    ? 'font-medium text-red-600'
                                    : ''
                                }
                              >
                                {document.due_date
                                  ? new Date(
                                      document.due_date,
                                    ).toLocaleDateString()
                                  : 'N/A'}
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
                  ))}
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-lg bg-gray-50 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invoice.invoice_number}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                invoice.status,
                              )}`}
                            >
                              {invoice.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-4">
                            <div>
                              <span className="font-medium">Amount:</span> $
                              {invoice.amount} {invoice.currency}
                            </div>
                            <div>
                              <span className="font-medium">Period:</span>{' '}
                              {invoice.period_start && invoice.period_end
                                ? `${new Date(
                                    invoice.period_start,
                                  ).toLocaleDateString()} - ${new Date(
                                    invoice.period_end,
                                  ).toLocaleDateString()}`
                                : 'One-time'}
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span>{' '}
                              {invoice.due_date
                                ? new Date(
                                    invoice.due_date,
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Paid:</span>{' '}
                              {invoice.paid_at
                                ? new Date(invoice.paid_at).toLocaleDateString()
                                : 'Not paid'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-2 rounded-lg bg-purple-50 px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-100">
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          {(invoice.status === 'sent' ||
                            invoice.status === 'overdue') && (
                            <button className="rounded-lg bg-green-50 px-4 py-2 font-medium text-green-600 transition-colors hover:bg-green-100">
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg p-6 ${
                        message.is_read
                          ? 'bg-gray-50'
                          : 'border border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {message.sender?.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {!message.is_read && (
                          <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                            New
                          </span>
                        )}
                      </div>

                      {message.subject && (
                        <h4 className="mb-2 font-medium text-gray-900">
                          {message.subject}
                        </h4>
                      )}

                      <p className="text-gray-700">{message.message}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            message.message_type === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : message.message_type === 'reminder'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.message_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'mailbox' && (
                <div>
                  <VirtualMailboxManager viewMode="client" />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Debug Info */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                System Status
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-700">User:</span>
                  <p className="text-blue-600">{user?.email || 'No user'}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Profile:</span>
                  <p className="text-blue-600">
                    {profile ? `${profile.email} (${profile.role})` : 'No profile'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Company:</span>
                  <p className="text-blue-600">
                    {accountingProfile?.company_name || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Consultant Info */}
            {accountingProfile?.consultant && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Your Consultant
                </h3>
                <div className="mb-4 flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">
                    {accountingProfile.consultant.full_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {accountingProfile.consultant.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {accountingProfile.consultant.email}
                    </p>
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
                    {
                      name: 'Upload Document',
                      icon: Upload,
                      color: 'bg-green-500 hover:bg-green-600',
                    },
                    {
                      name: 'Pay Invoice',
                      icon: CreditCard,
                      color: 'bg-blue-500 hover:bg-blue-600',
                    },
                    {
                      name: 'Message Consultant',
                      icon: MessageSquare,
                      color: 'bg-purple-500 hover:bg-purple-600',
                    },
                    {
                      name: 'View Reports',
                      icon: FileText,
                      color: 'bg-indigo-500 hover:bg-indigo-600',
                    },
                    {
                      name: 'Download Files',
                      icon: Download,
                      color: 'bg-teal-500 hover:bg-teal-600',
                    },
                    {
                      name: 'Account Settings',
                      icon: Settings,
                      color: 'bg-gray-500 hover:bg-gray-600',
                    },
                  ].map((action, index) => (
                    <button
                      key={index}
                      className={`${action.color} group cursor-pointer rounded-lg p-4 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
                    >
                      <action.icon className="mx-auto mb-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      <div className="text-xs font-medium">{action.name}</div>
                    </button>
                  ))}
                </div>
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

      {/* Shipping Modal */}
      {showShippingModal && selectedMailboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Ship Document</h3>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Document Info */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-900">
                  {selectedMailboxItem.document_name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedMailboxItem.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Document Type:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMailboxItem.document_type}
                  </span>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Shipping Option
                </label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingOption === 'standard'}
                      onChange={(e) =>
                        setShippingOption(e.target.value as 'standard' | 'express')
                      }
                      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          Standard Shipping
                        </span>
                        <span className="font-bold text-gray-900">$15</span>
                      </div>
                      <p className="text-sm text-gray-600">5-7 business days</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingOption === 'express'}
                      onChange={(e) =>
                        setShippingOption(e.target.value as 'standard' | 'express')
                      }
                      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          Express Shipping
                        </span>
                        <span className="font-bold text-gray-900">$25</span>
                      </div>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Payment Summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-700">Shipping Fee:</span>
                  <span className="font-bold text-gray-900">
                    ${shippingOption === 'standard' ? '15' : '25'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Delivery Time:</span>
                  <span className="text-gray-900">
                    {shippingOption === 'standard' ? '5-7 days' : '2-3 days'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShippingPayment}
                  disabled={
                    paymentLoading ||
                    !shippingAddress.fullName ||
                    !shippingAddress.address ||
                    !shippingAddress.city ||
                    !shippingAddress.country
                  }
                  className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>
                        Pay ${shippingOption === 'standard' ? '15' : '25'}
                      </span>
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
