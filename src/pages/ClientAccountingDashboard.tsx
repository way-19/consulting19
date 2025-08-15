import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ClientRecommendations from '../components/client/ClientRecommendations';
import UpcomingPayments from '../components/client/UpcomingPayments';
import RequestCustomServiceModal from '../components/client/RequestCustomServiceModal';
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
  DollarSign,
  Eye,
  Search,
  Mail,
  Plus,
  Lightbulb,
  Star,
  TrendingUp,
  Globe
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
  consultant?: { full_name: string; email: string };
  consultant_id?: string;
}

type DocStatus = 'pending' | 'received' | 'processed' | 'completed' | 'overdue';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface ClientDocument {
  id: string;
  document_type: string;
  category: string;
  title: string;
  due_date?: string;
  received_date?: string;
  status: DocStatus;
  priority: Priority;
  file_url?: string;
  size_kb?: number | null;
  tracking_number?: string | null;
  shipping_fee?: number | null;
  payment_status?: 'unpaid' | 'paid' | 'waived';
  created_at?: string;
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
  sender?: { full_name: string; email: string };
}

const ClientAccountingDashboard = () => {
  const { profile } = useAuth();

  const [accountingProfile, setAccountingProfile] = useState<ClientAccountingProfile | null>(null);
  const [clientId, setClientId] = useState<string | undefined>(undefined);

  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<'overview' | 'documents' | 'invoices' | 'messages' | 'mailbox'>('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showInvoiceCheckout, setShowInvoiceCheckout] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // --- Virtual Mailbox UI state ---
  const [docForModal, setDocForModal] = useState<ClientDocument | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [shipDoc, setShipDoc] = useState<ClientDocument | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shippingSubmitting, setShippingSubmitting] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    contact_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: '',
    method: 'standard', // standard | express
  });

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      await fetchAccountingProfile();
      await Promise.all([fetchDocuments(), fetchInvoices(), fetchMessages()]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountingProfile = async () => {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile?.id)
      .limit(1);

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return;
    }

    const client = clientData?.[0];
    if (!client) return;
    setClientId(client.id);

    const { data: accountingData, error } = await supabase
      .from('accounting_clients')
      .select(
        `
        *,
        consultant:consultant_id (full_name, email)
      `
      )
      .eq('client_id', client.id)
      .limit(1);

    if (error) {
      console.error('Error fetching accounting profile:', error);
      return;
    }
    if (accountingData?.[0]) setAccountingProfile(accountingData[0] as any);
  };

  const fetchDocuments = async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from('accounting_documents')
      .select('*')
      .eq('profile_id', profile.id) // uyarlayın: client_id ile bağlıysa değiştirin
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }
    setDocuments((data as ClientDocument[]) ?? []);
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
    setInvoices((data as ClientInvoice[]) ?? []);
  };

  const fetchMessages = async () => {
    if (!profile?.id) return;
    const { data, error } = await supabase
      .from('accounting_messages')
      .select(
        `
        *,
        sender:sender_id (full_name, email)
      `
      )
      .eq('recipient_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    setMessages((data as ClientMessage[]) ?? []);
  };

  const handlePayInvoice = (invoice: ClientInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceCheckout(true);
  };

  const handleInvoicePaymentSuccess = async (paymentIntentId: string) => {
    setShowInvoiceCheckout(false);
    setSelectedInvoice(null);
    if (selectedInvoice) {
      await supabase
        .from('accounting_invoices')
        .update({ status: 'paid', stripe_invoice_id: paymentIntentId })
        .eq('id', selectedInvoice.id);
      await fetchInvoices();
    }
    alert('Invoice payment successful!');
  };
  const handleInvoicePaymentError = (error: string) => alert(`Invoice payment failed: ${error}`);
  const handleInvoicePaymentCancel = () => {
    setShowInvoiceCheckout(false);
    setSelectedInvoice(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'received':
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
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
      default:
        return 'bg-gray-400';
    }
  };

  // --- Virtual Mailbox handlers ---
  const openDocDetails = (doc: ClientDocument) => {
    setDocForModal(doc);
    setShowDocModal(true);
  };

  const handlePreview = (doc: ClientDocument) => {
    if (!doc.file_url) {
      alert('Ön izleme için dosya yok.');
      return;
    }
    setPreviewUrl(doc.file_url);
    setShowPreview(true);
  };

  const handleDownload = (doc: ClientDocument) => {
    if (!doc.file_url) {
      alert('İndirilecek dosya bulunamadı.');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.file_url;
    a.target = '_blank';
    a.download = doc.title || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openShipModal = (doc: ClientDocument) => {
    setShipDoc(doc);
    setShowShipModal(true);
  };

  const shippingFee = shippingForm.method === 'express' ? 29 : 9;

  const submitShippingRequest = async () => {
    if (!accountingProfile || !shipDoc) return;
    setShippingSubmitting(true);
    try {
      const { error } = await supabase.from('mailbox_shipping_requests').insert([
        {
          accounting_client_id: accountingProfile.id,
          document_id: shipDoc.id,
          contact_name: shippingForm.contact_name,
          phone: shippingForm.phone,
          address_line1: shippingForm.address_line1,
          address_line2: shippingForm.address_line2,
          city: shippingForm.city,
          postal_code: shippingForm.postal_code,
          country: shippingForm.country,
          method: shippingForm.method,
          fee: shippingFee,
          status: 'requested'
        }
      ]);
      if (error) throw error;
      setShowShipModal(false);
      alert('Fiziksel gönderim talebiniz alındı.');
    } catch (e) {
      console.error(e);
      alert('Gönderim talebi kaydedilemedi.');
    } finally {
      setShippingSubmitting(false);
    }
  };

  const overdueDocuments = documents.filter((d) => d.status === 'overdue').length;
  const pendingDocuments = documents.filter((d) => d.status === 'pending').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
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
            <div className="text-right">
              <p className="text-sm text-gray-600">Consultant</p>
              <p className="font-medium text-gray-900">{accountingProfile.consultant?.full_name}</p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Contact Advisor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Payments */}
        <div className="mb-8">
          <UpcomingPayments clientId={clientId} />
        </div>

        {/* AI Recommendations (kısa tutalım) */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h2>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">3 new</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Estonia E-Residency Program</h4>
                    <p className="text-sm text-gray-700">Could provide significant tax advantages and EU market access.</p>
                  </div>
                </div>
              </div>
              <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Tax Optimization Service</h4>
                    <p className="text-sm text-gray-700">Potential savings: $3,000/year</p>
                  </div>
                </div>
              </div>
              <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">UAE Free Zone Expansion</h4>
                    <p className="text-sm text-gray-700">High growth potential with 0% corporate tax zones.</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">View All Recommendations →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Documents</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingDocuments}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Documents</p>
              <p className="text-3xl font-bold text-red-600">{overdueDocuments}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid Invoices</p>
              <p className="text-3xl font-bold text-orange-600">{unpaidInvoices}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Messages</p>
              <p className="text-3xl font-bold text-blue-600">{unreadMessages}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Company Info */}
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
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                Next Deadline: {new Date(accountingProfile.next_deadline).toLocaleDateString()}
              </span>
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
                { key: 'mailbox', label: 'Virtual Mailbox', icon: Mail }
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
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h3>
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`} />
                          <div>
                            <p className="font-medium text-gray-900">{document.title}</p>
                            <p className="text-sm text-gray-600">
                              Due: {document.due_date ? new Date(document.due_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                          <p className="text-sm text-gray-600">
                            {invoice.period_start && invoice.period_end
                              ? `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(
                                  invoice.period_end
                                ).toLocaleDateString()}`
                              : 'One-time invoice'}
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

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      .filter((doc) => {
                        const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'all' || doc.status === (statusFilter as DocStatus);
                        return matchesSearch && matchesStatus;
                      })
                      .map((doc) => (
                        <div key={doc.id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(doc.priority)}`} />
                                <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                  {doc.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                <div>
                                  <span className="font-medium">Type:</span> {doc.document_type}
                                </div>
                                <div>
                                  <span className="font-medium">Category:</span> {doc.category}
                                </div>
                                <div>
                                  <span className="font-medium">Due Date:</span>{' '}
                                  <span className={doc.due_date && new Date(doc.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                    {doc.due_date ? new Date(doc.due_date).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openDocDetails(doc)}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handlePreview(doc)}
                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Ön İzleme</span>
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>İndir</span>
                              </button>
                              <button
                                onClick={() => openShipModal(doc)}
                                className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                              >
                                <Mail className="h-4 w-4" />
                                <span>Fiziksel Gönderim</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices */}
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
                                <span className="font-medium">Period:</span> Monthly Service
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span>{' '}
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Paid:</span>{' '}
                                {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Not paid'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                              View
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

            {/* Messages */}
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
                      <div
                        key={message.id}
                        className={`rounded-lg p-6 ${message.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}
                      >
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
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">New</span>
                          )}
                        </div>

                        {message.subject && <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>}
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Virtual Mailbox */}
            {activeTab === 'mailbox' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">My Virtual Mailbox</h3>
                  <p className="text-gray-600">Receive official documents digitally and request physical shipping when needed</p>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Mail Items</h3>
                    <p className="text-gray-600">You don’t have any items in your virtual mailbox yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="bg-purple-100 rounded-lg p-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                                <p className="text-sm text-gray-600">{doc.category}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                {doc.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Tracking:</span>{' '}
                                {doc.tracking_number || 'VM' + (doc.id?.slice(0, 8) || '')}
                              </div>
                              <div>
                                <span className="font-medium">Shipping Fee:</span> ${doc.shipping_fee ?? 0}
                              </div>
                              <div>
                                <span className="font-medium">Payment:</span>{' '}
                                <span
                                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    (doc.payment_status || 'unpaid') === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : (doc.payment_status || 'unpaid') === 'waived'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {(doc.payment_status || 'unpaid').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {doc.size_kb ? `${doc.size_kb} KB` : '—'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDocDetails(doc)}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handlePreview(doc)}
                              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ön İzleme</span>
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>İndir</span>
                            </button>
                            <button
                              onClick={() => openShipModal(doc)}
                              className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              <span>Fiziksel Gönderim</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Chat */}
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

      {/* Custom Service Request */}
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

      {/* Document Details Modal */}
      {showDocModal && docForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Document Details</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Document Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Document Name:</span> {docForModal.title}</div>
                  <div><span className="font-medium">Type:</span> {docForModal.document_type}</div>
                  <div><span className="font-medium">Tracking Number:</span> {docForModal.tracking_number || '-'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status & Payment</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(docForModal.status)}`}>
                      {docForModal.status.toUpperCase()}
                    </span>
                  </div>
                  <div><span className="font-medium">Shipping Fee:</span> ${docForModal.shipping_fee ?? 0}</div>
                  <div>
                    <span className="font-medium">Payment Status:</span>{' '}
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        (docForModal.payment_status || 'unpaid') === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : (docForModal.payment_status || 'unpaid') === 'waived'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(docForModal.payment_status || 'unpaid').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex items-center justify-end gap-2">
              <button onClick={() => handlePreview(docForModal)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Ön İzleme
              </button>
              <button onClick={() => handleDownload(docForModal)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                İndir
              </button>
              <button onClick={() => openShipModal(docForModal)} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                Fiziksel Gönderim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <h4 className="font-semibold">Ön İzleme</h4>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <iframe title="preview" src={previewUrl} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShipModal && shipDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 class
