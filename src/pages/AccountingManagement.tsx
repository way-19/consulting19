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
  FileText, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  MessageSquare,
  Bell,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Globe,
  Mail,
  X,
  Save
} from 'lucide-react';

interface AccountingClient {
  id: string;
  client_id: string;
  company_name: string;
  tax_number?: string;
  business_type: string;
  accounting_period: string;
  service_package: string;
  monthly_fee: number;
  status: 'active' | 'inactive' | 'suspended';
  last_document_received?: string;
  next_deadline?: string;
  reminder_frequency: number;
  preferred_language?: string;
  virtual_address?: string;
  virtual_address_service_start_date?: string;
  virtual_address_next_payment_date?: string;
  client?: {
    profile_id: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

interface AccountingDocument {
  id: string;
  client_id: string;
  document_type: string;
  category: string;
  title: string;
  due_date?: string;
  received_date?: string;
  status: 'pending' | 'received' | 'processed' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminder_sent: boolean;
  reminder_count: number;
  client?: {
    company_name: string;
    client?: {
      profile?: {
        full_name: string;
        email: string;
      };
    };
  };
}

interface AccountingTask {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  client?: {
    company_name: string;
  };
}

interface AccountingReminder {
  id: string;
  client_id: string;
  reminder_type: string;
  title: string;
  message: string;
  due_date?: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'cancelled';
  reminder_level: number;
  client?: {
    company_name: string;
    preferred_language: string;
  };
}

const AccountingManagement = () => {
  const { profile } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [clients, setClients] = useState<AccountingClient[]>([]);
  const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [tasks, setTasks] = useState<AccountingTask[]>([]);
  const [reminders, setReminders] = useState<AccountingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<AccountingClient | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clients' | 'documents' | 'tasks' | 'reminders' | 'messages'>('clients');

  // Client editing form state
  const [editingClient, setEditingClient] = useState<AccountingClient | null>(null);
  const [clientForm, setClientForm] = useState({
    company_name: '',
    tax_number: '',
    business_type: 'limited_company',
    accounting_period: 'monthly',
    service_package: 'basic',
    monthly_fee: 0,
    status: 'active',
    next_deadline: '',
    reminder_frequency: 7,
    preferred_language: 'en',
    virtual_address: '',
    virtual_address_service_start_date: '',
    virtual_address_next_payment_date: ''
  });

  useEffect(() => {
    if (!profile?.id) return;

    (async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (error) {
        console.error('fetch clientId error:', error);
        return;
      }
      setClientId(data?.id ?? null);
    })();
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  // Stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const overdueDocuments = documents.filter(d => d.status === 'overdue').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const monthlyRevenue = clients.reduce((sum, c) => sum + c.monthly_fee, 0);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchClients(),
        fetchDocuments(),
        fetchTasks(),
        fetchReminders()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('accounting_clients')
      .select(`
        *,
        client:client_id (
          profile_id,
          profile:profile_id (
            full_name,
            email
          )
        )
      `)
      .eq('consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setClients(data || []);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('accounting_documents')
      .select(`
        *,
        client:client_id (
          company_name,
          client:client_id (
            profile:profile_id (
              full_name,
              email
            )
          )
        )
      `)
      .eq('consultant_id', profile?.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    setDocuments(data || []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('accounting_tasks')
      .select(`
        *,
        client:client_id (
          company_name
        )
      `)
      .eq('consultant_id', profile?.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    setTasks(data || []);
  };

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('accounting_reminders')
      .select(`
        *,
        client:client_id (
          company_name,
          preferred_language
        )
      `)
      .eq('consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReminders(data || []);
  };

  const sendReminder = async (documentId: string, clientId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      const { error } = await supabase
        .from('accounting_reminders')
        .insert([{
          client_id: clientId,
          consultant_id: profile?.id,
          document_id: documentId,
          reminder_type: 'document_due',
          title: `Document Reminder: ${document.title}`,
          message: `Please submit your ${document.title} document. Due date: ${document.due_date}`,
          due_date: document.due_date,
          language: 'en'
        }]);

      if (error) throw error;

      // Update document reminder status
      await supabase
        .from('accounting_documents')
        .update({ 
          reminder_sent: true, 
          reminder_count: document.reminder_count + 1,
          last_reminder_sent: new Date().toISOString()
        })
        .eq('id', documentId);

      await fetchDocuments();
      await fetchReminders();
      
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    }
  };

  const handleEditClient = (client: AccountingClient) => {
    setEditingClient(client);
    setClientForm({
      company_name: client.company_name,
      tax_number: client.tax_number || '',
      business_type: client.business_type,
      accounting_period: client.accounting_period,
      service_package: client.service_package,
      monthly_fee: client.monthly_fee,
      status: client.status,
      next_deadline: client.next_deadline ? new Date(client.next_deadline).toISOString().split('T')[0] : '',
      reminder_frequency: client.reminder_frequency,
      preferred_language: client.preferred_language || 'en',
      virtual_address: client.virtual_address || '',
      virtual_address_service_start_date: client.virtual_address_service_start_date ? new Date(client.virtual_address_service_start_date).toISOString().split('T')[0] : '',
      virtual_address_next_payment_date: client.virtual_address_next_payment_date ? new Date(client.virtual_address_next_payment_date).toISOString().split('T')[0] : ''
    });
    setShowClientModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClient) return;

    try {
      const updateData = {
        ...clientForm,
        next_deadline: clientForm.next_deadline ? new Date(clientForm.next_deadline).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('accounting_clients')
        .update(updateData)
        .eq('id', editingClient.id);

      if (error) throw error;

      await fetchClients();
      setShowClientModal(false);
      setEditingClient(null);
      alert('Client information updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client information');
    }
  };

  const resetClientForm = () => {
    setClientForm({
      company_name: '',
      tax_number: '',
      business_type: 'limited_company',
      accounting_period: 'monthly',
      service_package: 'basic',
      monthly_fee: 0,
      status: 'active',
      next_deadline: '',
      reminder_frequency: 7,
      preferred_language: 'en',
      virtual_address: '',
      virtual_address_service_start_date: '',
      virtual_address_next_payment_date: ''
    });
    setEditingClient(null);
    setShowClientModal(false);
  };

  const updateDocumentStatus = async (documentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('accounting_documents')
        .update({ 
          status: newStatus,
          received_date: newStatus === 'received' ? new Date().toISOString() : null
        })
        .eq('id', documentId);

      if (error) throw error;
      await fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client?.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Accounting Management</h1>
              <p className="text-gray-600 mt-1">Manage client documents, track deadlines and automate reminders</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Send Message</span>
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
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-3xl font-bold text-green-600">{activeClients}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-600">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-600">${monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'clients', label: 'Clients', icon: Users, count: totalClients },
                { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
                { key: 'tasks', label: 'Tasks', icon: CheckCircle, count: tasks.length },
                { key: 'reminders', label: 'Reminders', icon: Bell, count: reminders.length },
                { key: 'messages', label: 'Messages', icon: MessageSquare, count: 0 }
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
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
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
                  placeholder="Müşteri, belge veya görev ara..."
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
                    <option value="all">All Situations</option>
                    {activeTab === 'clients' && (
                      <>
                        <option value="active">Active</option>
                        <option value="inactive">Passive</option>
                        <option value="suspended">Suspended</option>
                      </>
                    )}
                    {activeTab === 'documents' && (
                      <>
                        <option value="pending">Waiting</option>
                        <option value="received">Received</option>
                        <option value="processed">İşlenen</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Delayed</option>
                      </>
                    )}
                  </select>
                </div>

                {activeTab === 'documents' && (
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Middle</option>
                    <option value="low">Low</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'clients' && (
              <div className="space-y-4">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Not Found</h3>
                    <p className="text-gray-600">No accounting clients were found that match your current filters.</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div key={client.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{client.company_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(client.status)}`}>
                              {client.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Communication:</span> {client.client?.profile?.full_name}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {client.client?.profile?.email}
                            </div>
                            <div>
                              <span className="font-medium">Package:</span> {client.service_package}
                            </div>
                            <div>
                              <span className="font-medium">Monthly Fee:</span> ${client.monthly_fee}
                            </div>
                          </div>

                          {client.virtual_address && (
                            <div>
                              <span className="font-medium">Virtual Address:</span> {client.virtual_address}
                            </div>
                          )}

                          {client.virtual_address_next_payment_date && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className="text-sm text-purple-600 font-medium">
                                Virtual Address Payment Due: {new Date(client.virtual_address_next_payment_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {client.next_deadline && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-orange-600 font-medium">
                                Next Deadline: {new Date(client.next_deadline).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setIsChatOpen(true);
                            }}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Message</span>
                          </button>
                          <button
                            onClick={() => {
                              handleEditClient(client);
                            }}
                            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Not Found</h3>
                    <p className="text-gray-600">No documents were found matching your current filters..</p>
                  </div>
                ) : (
                  filteredDocuments.map((document) => (
                    <div key={document.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                            <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(document.status)}`}>
                              {document.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Customer:</span> {document.client?.company_name}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {document.document_type}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {document.category}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> 
                              <span className={document.due_date && new Date(document.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                {document.due_date ? new Date(document.due_date).toLocaleDateString('tr-TR') : 'Yok'}
                              </span>
                            </div>
                          </div>

                          {document.reminder_sent && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              <Bell className="h-4 w-4" />
                              <span>Reminder sent ({document.reminder_count} kez)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {document.status === 'pending' && (
                            <button
                              onClick={() => sendReminder(document.id, document.client_id)}
                              className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                            >
                              <Bell className="h-4 w-4" />
                              <span>Send Reminder</span>
                            </button>
                          )}
                          
                          <select
                            value={document.status}
                            onChange={(e) => updateDocumentStatus(document.id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="processed">Processed</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Late</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Task Not Found</h3>
                    <p className="text-gray-600">There are no available tasks.</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{task.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Customer:</span> {task.client?.company_name}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {task.task_type.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> 
                              {task.due_date ? new Date(task.due_date).toLocaleDateString('tr-TR') : 'Yok'}
                            </div>
                            <div>
                              <span className="font-medium">Hour:</span> 
                              {task.estimated_hours ? `${task.estimated_hours}s tahmini` : 'Yok'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reminder Not Found</h3>
                    <p className="text-gray-600">There are no reminders available.</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <Bell className="h-5 w-5 text-orange-500" />
                            <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(reminder.status)}`}>
                              {reminder.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{reminder.message}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Customer:</span> {reminder.client?.company_name}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {reminder.reminder_type.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> 
                              {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString('tr-TR') : 'Yok'}
                            </div>
                            <div>
                              <span className="font-medium">Level:</span> {reminder.reminder_level}
                              {reminder.client?.preferred_language && (
                                <span className="ml-2 text-blue-600">({reminder.client.preferred_language.toUpperCase()})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Multilingual Messaging</h3>
                <p className="text-gray-600 mb-6">Send messages to your customers in their preferred language</p>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Send className="h-5 w-5" />
                  <span>Send New Message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multilingual Chat Modal */}
      {selectedClient && (
        <MultilingualChat
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedClient(null);
          }}
          chatType="consultant-client"
          currentUserId={profile?.id || 'consultant-1'}
          currentUserRole="consultant"
          targetUserId={selectedClient.client?.profile_id}
        />
      )}

      {/* Client Edit Modal */}
      {showClientModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Customer Information</h2>
                <button
                  onClick={resetClientForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.company_name}
                      onChange={(e) => setClientForm(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Şirket adını girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Number
                    </label>
                    <input
                      type="text"
                      value={clientForm.tax_number}
                      onChange={(e) => setClientForm(prev => ({ ...prev, tax_number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Vergi numarasını girin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={clientForm.business_type}
                      onChange={(e) => setClientForm(prev => ({ ...prev, business_type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="limited_company">Limited Company</option>
                      <option value="sole_proprietorship">Sole Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accounting Period
                    </label>
                    <select
                      value={clientForm.accounting_period}
                      onChange={(e) => setClientForm(prev => ({ ...prev, accounting_period: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Annual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Package
                    </label>
                    <select
                      value={clientForm.service_package}
                      onChange={(e) => setClientForm(prev => ({ ...prev, service_package: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="basic">Basic Package</option>
                      <option value="standard">Standard Package</option>
                      <option value="premium">Premium Package</option>
                      <option value="enterprise">Corporate Package</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Fee (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={clientForm.monthly_fee}
                      onChange={(e) => setClientForm(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situation
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Passive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Deadline
                    </label>
                    <input
                      type="date"
                      value={clientForm.next_deadline}
                      onChange={(e) => setClientForm(prev => ({ ...prev, next_deadline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Frequency (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={clientForm.reminder_frequency}
                      onChange={(e) => setClientForm(prev => ({ ...prev, reminder_frequency: parseInt(e.target.value) || 7 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language
                    </label>
                    <select
                      value={clientForm.preferred_language}
                      onChange={(e) => setClientForm(prev => ({ ...prev, preferred_language: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="tr">Türkçe</option>
                      <option value="ka">ქართული</option>
                      <option value="ru">Русский</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Virtual Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Address Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Virtual Address
                    </label>
                    <textarea
                      rows={2}
                      value={clientForm.virtual_address}
                      onChange={(e) => setClientForm(prev => ({ ...prev, virtual_address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter virtual address if provided"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Start Date
                    </label>
                    <input
                      type="date"
                      value={clientForm.virtual_address_service_start_date}
                      onChange={(e) => setClientForm(prev => ({ ...prev, virtual_address_service_start_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Payment Date
                    </label>
                    <input
                      type="date"
                      value={clientForm.virtual_address_next_payment_date}
                      onChange={(e) => setClientForm(prev => ({ ...prev, virtual_address_next_payment_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Virtual address payments: First 6 months prepaid, then every 6 months
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Package Details */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Package Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Current Package:</span> {clientForm.service_package}
                  </div>
                  <div>
                    <span className="font-medium">Monthly Fee:</span> ${clientForm.monthly_fee}
                  </div>
                  <div>
                    <span className="font-medium">Period:</span> {clientForm.accounting_period}
                  </div>
                  {clientForm.virtual_address && (
                    <div className="md:col-span-3">
                      <span className="font-medium">Virtual Address:</span> {clientForm.virtual_address}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetClientForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;