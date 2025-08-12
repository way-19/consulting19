import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
  Filter
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
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'invoices' | 'messages'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchAccountingProfile(),
        fetchDocuments(),
        fetchInvoices(),
        fetchMessages()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountingProfile = async () => {
    // First get the client record
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile?.id)
      .single();

    if (!clientData) return;

    const { data, error } = await supabase
      .from('accounting_clients')
      .select(`
        *,
        consultant:consultant_id (
          full_name,
          email
        )
      `)
      .eq('client_id', clientData.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching accounting profile:', error);
      return;
    }

    setAccountingProfile(data);
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
    const { data, error } = await supabase
      .from('accounting_messages')
      .select(`
        *,
        sender:sender_id (
          full_name,
          email
        )
      `)
      .eq('receiver_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                { key: 'messages', label: 'Messages', icon: MessageSquare, count: unreadMessages }
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
                              <button className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors">
                                Pay Now
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAccountingDashboard;