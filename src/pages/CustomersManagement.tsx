import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye, 
  Edit,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Star,
  Globe,
  Package,
  Truck
} from 'lucide-react';

interface Client {
  id: string;
  profile_id: string;
  assigned_consultant_id: string;
  company_name?: string;
  phone?: string;
  status: string;
  priority: string;
  service_type: string;
  progress: number;
  satisfaction_rating?: number;
  created_at: string;
  updated_at: string;
  industry?: string;
  profile?: {
    full_name?: string;
    email: string;
    country?: string;
  };
}

const CustomersManagement = () => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [showVirtualMailbox, setShowVirtualMailbox] = useState(false);
  const [selectedClientForMailbox, setSelectedClientForMailbox] = useState<Client | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchClients();
    }
  }, [profile]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profile:profile_id (
            full_name,
            email,
            country
          )
        `)
        .eq('assigned_consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVirtualMailbox = (client: Client) => {
    setSelectedClientForMailbox(client);
    setShowVirtualMailbox(true);
  };

  const handleCloseVirtualMailbox = () => {
    setShowVirtualMailbox(false);
    setSelectedClientForMailbox(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
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
      client.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || client.priority === priorityFilter;
    
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
              <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-1">Manage your assigned clients and their projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchClients}
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-3xl font-bold text-purple-600">{clients.filter(c => c.status === 'new').length}</p>
              </div>
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{clients.filter(c => c.status === 'in_progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{clients.filter(c => c.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-3xl font-bold text-yellow-600">{clients.filter(c => c.status === 'on_hold').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">{clients.filter(c => c.priority === 'high' || c.priority === 'urgent').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Clients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
            <p className="text-gray-600">No clients match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(client.company_name || client.profile?.full_name || client.profile?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.company_name || client.profile?.full_name || 'Unknown Company'}
                        </h3>
                        <p className="text-gray-600">{client.profile?.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(client.priority)}`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {client.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {client.service_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      {client.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.profile?.country && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{client.profile.country}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {new Date(client.created_at).toLocaleDateString()}</span>
                      </div>
                      {client.satisfaction_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{client.satisfaction_rating}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{client.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            client.progress >= 80 ? 'bg-green-500' :
                            client.progress >= 50 ? 'bg-blue-500' :
                            client.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${client.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenVirtualMailbox(client)}
                      className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                      title="Virtual Mailbox"
                    >
                      <Package className="h-4 w-4" />
                      <span>Mailbox</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowClientDetail(true);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>

                    <button className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </button>

                    <button className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Virtual Mailbox Modal */}
      <VirtualMailboxManager
        isOpen={showVirtualMailbox}
        onClose={handleCloseVirtualMailbox}
        clientId={selectedClientForMailbox?.id}
        consultantId={profile?.id}
        userRole="consultant"
      />

      {/* Client Detail Modal */}
      {showClientDetail && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Client Details - {selectedClient.company_name || selectedClient.profile?.full_name}
                </h2>
                <button
                  onClick={() => setShowClientDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Company:</span>
                      <p className="font-medium">{selectedClient.company_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Contact Person:</span>
                      <p className="font-medium">{selectedClient.profile?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedClient.profile?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedClient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Country:</span>
                      <p className="font-medium">{selectedClient.profile?.country || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Service Type:</span>
                      <p className="font-medium">{selectedClient.service_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                        {selectedClient.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Priority:</span>
                      <div className="inline-flex items-center space-x-2 ml-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedClient.priority)}`}></div>
                        <span className="font-medium">{selectedClient.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Progress:</span>
                      <p className="font-medium">{selectedClient.progress}%</p>
                    </div>
                    {selectedClient.satisfaction_rating && (
                      <div>
                        <span className="text-sm text-gray-600">Satisfaction:</span>
                        <div className="flex items-center space-x-1 ml-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{selectedClient.satisfaction_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setShowClientDetail(false);
                      handleOpenVirtualMailbox(selectedClient);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>Virtual Mailbox</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Message</span>
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>View Documents</span>
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit Client</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;