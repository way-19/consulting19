import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
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
  Package,
  CreditCard,
  Star,
  Building,
  Phone,
  MapPin,
  Truck
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
}

const ClientAccountingDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'tasks' | 'reminders' | 'messages' | 'services' | 'mailbox'>('overview');
  const [accountingClient, setAccountingClient] = useState<AccountingClient | null>(null);
  const [documents, setDocuments] = useState<AccountingDocument[]>([]);
  const [tasks, setTasks] = useState<AccountingTask[]>([]);
  const [reminders, setReminders] = useState<AccountingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (profile?.id) {
      fetchAccountingData();
    }
  }, [profile]);

  const fetchAccountingData = async () => {
    try {
      // Fetch accounting client profile
      const { data: clientData, error: clientError } = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('client_id', profile?.id)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error fetching accounting client:', clientError);
      } else {
        setAccountingClient(clientData);
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('accounting_documents')
        .select('*')
        .eq('client_id', clientData?.id)
        .order('due_date', { ascending: true });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      } else {
        setDocuments(documentsData || []);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('accounting_tasks')
        .select('*')
        .eq('client_id', clientData?.id)
        .order('due_date', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }

      // Fetch reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from('accounting_reminders')
        .select('*')
        .eq('client_id', clientData?.id)
        .order('created_at', { ascending: false });

      if (remindersError) {
        console.error('Error fetching reminders:', remindersError);
      } else {
        setReminders(remindersData || []);
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    } finally {
      setLoading(false);
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Accounting Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your accounting documents, tasks, and deadlines</p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Client</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'documents', label: 'Documents', icon: FileText },
                { key: 'tasks', label: 'Tasks', icon: CheckCircle },
                { key: 'reminders', label: 'Reminders', icon: Bell },
                { key: 'messages', label: 'Messages', icon: MessageSquare },
                { key: 'services', label: 'Additional Services', icon: Settings },
                { key: 'mailbox', label: 'Virtual Mailbox', icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Client Info Card */}
            {accountingClient ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Accounting Service Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <span className="text-sm text-gray-600">Company Name:</span>
                    <p className="font-medium text-gray-900">{accountingClient.company_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Service Package:</span>
                    <p className="font-medium text-gray-900">{accountingClient.service_package.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Monthly Fee:</span>
                    <p className="font-medium text-gray-900">${accountingClient.monthly_fee}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(accountingClient.status)}`}>
                      {accountingClient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounting Service</h3>
                <p className="text-gray-600 mb-6">You don't have an active accounting service yet.</p>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Request Accounting Service
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                    <p className="text-3xl font-bold text-yellow-600">{documents.filter(d => d.status === 'pending').length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                    <p className="text-3xl font-bold text-red-600">{documents.filter(d => d.status === 'overdue').length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                    <p className="text-3xl font-bold text-purple-600">3</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Document submitted successfully</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New message from consultant</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reminder: Monthly documents due</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="processed">Processed</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                  <p className="text-gray-600">No documents match your current filters.</p>
                </div>
              ) : (
                filteredDocuments.map((document) => (
                  <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
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

                        {document.reminder_sent && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Bell className="h-4 w-4" />
                            <span>Reminder received ({document.reminder_count} times)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload</span>
                        </button>
                        <button className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
                  <p className="text-gray-600">No tasks match your current filters.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {task.task_type.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> 
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Estimated Hours:</span> 
                            {task.estimated_hours ? `${task.estimated_hours}h` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {reminders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reminders</h3>
                  <p className="text-gray-600">You have no active reminders.</p>
                </div>
              ) : (
                reminders.map((reminder) => (
                  <div key={reminder.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <Bell className="h-5 w-5 text-orange-500" />
                          <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                            {reminder.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{reminder.message}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {reminder.reminder_type.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span> 
                            {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString() : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Level:</span> {reminder.reminder_level}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 mb-6">Communicate with your accounting consultant</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Start Conversation
            </button>
          </div>
        )}

        {/* Additional Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
              <p className="text-gray-600 mb-6">Request additional services from your consultant</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Tax Consultation</h4>
                  <p className="text-gray-600 text-sm mb-4">Expert tax advice and optimization strategies</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Request Service
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Financial Analysis</h4>
                  <p className="text-gray-600 text-sm mb-4">Detailed financial reporting and analysis</p>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Request Service
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Custom Service</h4>
                  <p className="text-gray-600 text-sm mb-4">Request a custom accounting service</p>
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    Request Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Virtual Mailbox Tab */}
        {activeTab === 'mailbox' && (
          <div className="space-y-6">
            <VirtualMailboxManager viewMode="client" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAccountingDashboard;