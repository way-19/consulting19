import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import SearchFilterBar from '../components/common/SearchFilterBar';
import AdvancedDataTable, { TableColumn, TableAction } from '../components/common/AdvancedDataTable';
import useAdvancedSearch from '../hooks/useAdvancedSearch';
import { 
  ArrowLeft, 
  Users, 
  Plus,
  Eye, 
  Edit,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  X,
  Building,
  Star,
  Target,
  BarChart3,
  FileText,
  Package
} from 'lucide-react';

interface Client {
  id: string;
  profile_id: string;
  assigned_consultant_id: string;
  company_name?: string;
  phone?: string;
  status: 'new' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

interface ClientStats {
  totalClients: number;
  newClients: number;
  inProgressClients: number;
  completedClients: number;
  totalRevenue: number;
  avgSatisfaction: number;
}

const CustomersManagement = () => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showVirtualMailboxModal, setShowVirtualMailboxModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    newClients: 0,
    inProgressClients: 0,
    completedClients: 0,
    totalRevenue: 0,
    avgSatisfaction: 0
  });

  const [clientForm, setClientForm] = useState({
    company_name: '',
    phone: '',
    status: 'new' as Client['status'],
    priority: 'medium' as Client['priority'],
    service_type: 'company_formation',
    industry: ''
  });

  // Advanced search configuration
  const searchConfig = {
    searchFields: ['company_name', 'profile.email', 'profile.full_name'] as (keyof Client)[],
    filterFields: [
      {
        key: 'status' as keyof Client,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'new', label: 'New' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'on_hold', label: 'On Hold' }
        ]
      },
      {
        key: 'priority' as keyof Client,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Priority' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ]
      },
      {
        key: 'service_type' as keyof Client,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Services' },
          { value: 'company_formation', label: 'Company Formation' },
          { value: 'accounting', label: 'Accounting' },
          { value: 'legal', label: 'Legal' },
          { value: 'banking', label: 'Banking' }
        ]
      }
    ],
    sortFields: [
      { key: 'created_at' as keyof Client, label: 'Date Created', defaultOrder: 'desc' as const },
      { key: 'company_name' as keyof Client, label: 'Company Name', defaultOrder: 'asc' as const },
      { key: 'progress' as keyof Client, label: 'Progress', defaultOrder: 'desc' as const },
      { key: 'priority' as keyof Client, label: 'Priority', defaultOrder: 'desc' as const }
    ]
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData: filteredClients,
    totalCount,
    filteredCount
  } = useAdvancedSearch({
    data: clients,
    config: searchConfig,
    initialSortBy: 'created_at',
    initialFilters: { status: 'all', priority: 'all', service_type: 'all' }
  });

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
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData: Client[]) => {
    const totalClients = clientsData.length;
    const newClients = clientsData.filter(c => c.status === 'new').length;
    const inProgressClients = clientsData.filter(c => c.status === 'in_progress').length;
    const completedClients = clientsData.filter(c => c.status === 'completed').length;
    const avgSatisfaction = clientsData.length > 0 
      ? clientsData.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0) / clientsData.length 
      : 0;

    setStats({
      totalClients,
      newClients,
      inProgressClients,
      completedClients,
      totalRevenue: 0, // Will be calculated from orders
      avgSatisfaction
    });
  };

  const handleUpdateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (error) throw error;
      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      company_name: client.company_name || '',
      phone: client.phone || '',
      status: client.status,
      priority: client.priority,
      service_type: client.service_type,
      industry: client.industry || ''
    });
    setShowClientModal(true);
  };

  const handleOpenVirtualMailbox = (client: Client) => {
    setSelectedClient(client);
    setShowVirtualMailboxModal(true);
  };

  const resetForm = () => {
    setClientForm({
      company_name: '',
      phone: '',
      status: 'new',
      priority: 'medium',
      service_type: 'company_formation',
      industry: ''
    });
    setEditingClient(null);
    setSelectedClient(null);
    setShowClientModal(false);
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

  // Table columns configuration
  const columns: TableColumn<Client>[] = [
    {
      key: 'company_name',
      label: 'Client Information',
      render: (value, client) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {(client.company_name || client.profile?.full_name || client.profile?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {client.company_name || client.profile?.full_name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-600">{client.profile?.email}</p>
            <p className="text-xs text-gray-500">{client.profile?.country || 'Unknown'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status & Priority',
      render: (value, client) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
              {client.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(client.priority)}`}></div>
            <span className="text-xs text-gray-600">{client.priority} priority</span>
          </div>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progress & Service',
      render: (value, client) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  client.progress >= 80 ? 'bg-green-500' :
                  client.progress >= 50 ? 'bg-blue-500' :
                  client.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${client.progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{client.progress}%</span>
          </div>
          <p className="text-xs text-gray-600">{client.service_type.replace('_', ' ').toUpperCase()}</p>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Contact Info',
      render: (value, client) => (
        <div className="space-y-1 text-xs text-gray-600">
          {client.phone && (
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>{client.phone}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(client.created_at).toLocaleDateString()}</span>
          </div>
          {client.satisfaction_rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{client.satisfaction_rating}/5</span>
            </div>
          )}
        </div>
      )
    }
  ];

  // Table actions configuration
  const actions: TableAction<Client>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleViewClient,
      color: 'blue'
    },
    {
      label: 'Edit Client',
      icon: Edit,
      onClick: handleEditClient,
      color: 'green'
    },
    {
      label: 'Virtual Mailbox',
      icon: Package,
      onClick: handleOpenVirtualMailbox,
      color: 'purple'
    },
    {
      label: 'Send Message',
      icon: MessageSquare,
      onClick: (client) => {
        // Handle message sending
        alert(`Send message to ${client.company_name || client.profile?.full_name}`);
      },
      color: 'blue'
    }
  ];

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
              <p className="text-gray-600 mt-1">Manage your assigned clients and track their progress</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-3xl font-bold text-purple-600">{stats.newClients}</p>
              </div>
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressClients}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedClients}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.avgSatisfaction.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search clients by name, email, or company..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: filters.status || 'all',
              options: searchConfig.filterFields[0].options!,
              onChange: (value) => setFilter('status', value),
              icon: CheckCircle
            },
            {
              key: 'priority',
              label: 'Priority',
              value: filters.priority || 'all',
              options: searchConfig.filterFields[1].options!,
              onChange: (value) => setFilter('priority', value),
              icon: AlertTriangle
            },
            {
              key: 'service_type',
              label: 'Service',
              value: filters.service_type || 'all',
              options: searchConfig.filterFields[2].options!,
              onChange: (value) => setFilter('service_type', value),
              icon: Building
            }
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortOptions={searchConfig.sortFields.map(field => ({
            value: field.key as string,
            label: field.label
          }))}
          onSortChange={setSortBy}
          onSortOrderChange={setSortOrder}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onClearFilters={clearFilters}
          className="mb-8"
        />

        {/* Clients Table */}
        <AdvancedDataTable
          data={filteredClients}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyState={{
            icon: Users,
            title: 'No Clients Found',
            description: 'No clients have been assigned to you yet.',
            action: {
              label: 'Refresh Data',
              onClick: fetchClients
            }
          }}
          getItemId={(client) => client.id}
          className="mb-8"
        />
      </div>

      {/* Client Detail Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Client Details - {selectedClient.company_name || selectedClient.profile?.full_name}
                </h2>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
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
                      <span className="text-sm text-gray-600">Company Name:</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
                  <div className="space-y-3">
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
                      <span className="text-sm text-gray-600">Service Type:</span>
                      <p className="font-medium">{selectedClient.service_type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Progress:</span>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              selectedClient.progress >= 80 ? 'bg-green-500' :
                              selectedClient.progress >= 50 ? 'bg-blue-500' :
                              selectedClient.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedClient.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{selectedClient.progress}% Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleOpenVirtualMailbox(selectedClient)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
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
                  <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Mailbox Modal - Standalone */}
      {showVirtualMailboxModal && selectedClient && (
        <VirtualMailboxManager
          isOpen={showVirtualMailboxModal}
          onClose={() => {
            setShowVirtualMailboxModal(false);
            setSelectedClient(null);
          }}
          clientId={selectedClient.id}
        />
      )}
    </div>
  );
};

export default CustomersManagement;