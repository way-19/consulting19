import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MultilingualChat from '../components/MultilingualChat';
import VirtualMailboxManager from '../components/VirtualMailboxManager';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Plus,
  Eye, 
  Edit,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Upload,
  MoreVertical,
  UserPlus,
  Building,
  Globe,
  X
} from 'lucide-react';

interface AssignedClient {
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
  profile?: {
    id: string;
    email: string;
    full_name?: string;
    country?: string;
  };
  // Calculated fields
  total_orders?: number;
  total_revenue?: number;
  last_contact?: string;
  next_deadline?: string;
}

interface ClientStats {
  total: number;
  new: number;
  in_progress: number;
  completed: number;
  on_hold: number;
  high_priority: number;
  total_revenue: number;
  avg_satisfaction: number;
}

const CustomersManagement = () => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<AssignedClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<AssignedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'progress' | 'revenue' | 'last_contact'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedClient, setSelectedClient] = useState<AssignedClient | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [showServiceRequestsModal, setShowServiceRequestsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [stats, setStats] = useState<ClientStats>({
    total: 0,
    new: 0,
    in_progress: 0,
    completed: 0,
    on_hold: 0,
    high_priority: 0,
    total_revenue: 0,
    avg_satisfaction: 0
  });

  useEffect(() => {
    if (profile?.id) {
      fetchClients();
    }
  }, [profile]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [clients, searchTerm, statusFilter, priorityFilter, serviceFilter, sortBy, sortOrder]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all clients for consultant:', profile?.id);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profile:profile_id (
            id,
            email,
            full_name,
            country
          )
        `)
        .eq('assigned_consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching clients:', error);
        return;
      }

      console.log('✅ Fetched clients:', data?.length || 0);
      
      // Calculate additional stats for each client
      const enrichedClients = await Promise.all(
        (data || []).map(async (client) => {
          // Get order count and revenue
          const { data: orders } = await supabase
            .from('legacy_orders')
            .select('total_amount, status, created_at')
            .eq('client_id', client.profile_id);

          const totalOrders = orders?.length || 0;
          const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
          const lastContact = orders?.[0]?.created_at || client.created_at;

          return {
            ...client,
            total_orders: totalOrders,
            total_revenue: totalRevenue,
            last_contact: lastContact
          };
        })
      );

      setClients(enrichedClients);
      calculateStats(enrichedClients);
    } catch (error) {
      console.error('💥 Error in fetchClients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientData: AssignedClient[]) => {
    const stats: ClientStats = {
      total: clientData.length,
      new: clientData.filter(c => c.status === 'new').length,
      in_progress: clientData.filter(c => c.status === 'in_progress').length,
      completed: clientData.filter(c => c.status === 'completed').length,
      on_hold: clientData.filter(c => c.status === 'on_hold').length,
      high_priority: clientData.filter(c => c.priority === 'high' || c.priority === 'urgent').length,
      total_revenue: clientData.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      avg_satisfaction: clientData.filter(c => c.satisfaction_rating).length > 0 
        ? clientData.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0) / clientData.filter(c => c.satisfaction_rating).length
        : 0
    };
    setStats(stats);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.profile?.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(client => client.priority === priorityFilter);
    }

    // Apply service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(client => client.service_type === serviceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.company_name || a.profile?.full_name || a.profile?.email || '';
          bValue = b.company_name || b.profile?.full_name || b.profile?.email || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'revenue':
          aValue = a.total_revenue || 0;
          bValue = b.total_revenue || 0;
          break;
        case 'last_contact':
          aValue = new Date(a.last_contact || a.created_at);
          bValue = new Date(b.last_contact || b.created_at);
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateClientStatus = async (clientId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;
      await fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  const updateClientPriority = async (clientId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ priority: newPriority })
        .eq('id', clientId);

      if (error) throw error;
      await fetchClients();
    } catch (error) {
      console.error('Error updating client priority:', error);
    }
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const serviceTypes = Array.from(new Set(clients.map(c => c.service_type)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
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
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600 mt-1">Comprehensive client management and tracking system</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowClientModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add Client</span>
                </button>
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
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.new}</p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Hold</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.on_hold}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-3xl font-bold text-red-600">{stats.high_priority}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${stats.total_revenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.avg_satisfaction.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              {/* Search */}
              <div className="lg:col-span-2">
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

              {/* Status Filter */}
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

              {/* Priority Filter */}
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

              {/* Service Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Services</option>
                  {serviceTypes.map(service => (
                    <option key={service} value={service}>{service.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="created_at">Date Created</option>
                  <option value="name">Name</option>
                  <option value="progress">Progress</option>
                  <option value="revenue">Revenue</option>
                  <option value="last_contact">Last Contact</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {currentClients.length} of {filteredClients.length} clients
                {filteredClients.length !== stats.total && ` (filtered from ${stats.total} total)`}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {currentClients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Found</h3>
                <p className="text-gray-600 mb-6">
                  {filteredClients.length === 0 && stats.total === 0 
                    ? 'No clients have been assigned to you yet.'
                    : 'No clients match your current filters.'
                  }
                </p>
                {filteredClients.length === 0 && stats.total === 0 && (
                  <button
                    onClick={() => setShowClientModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Add Your First Client
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-3">Client Information</div>
                    <div className="col-span-2">Status & Priority</div>
                    <div className="col-span-2">Progress & Service</div>
                    <div className="col-span-2">Revenue & Orders</div>
                    <div className="col-span-2">Contact Info</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {currentClients.map((client) => (
                    <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Client Information */}
                        <div className="col-span-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {(client.company_name || client.profile?.full_name || client.profile?.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {client.company_name || client.profile?.full_name || 'Unnamed Client'}
                              </p>
                              <p className="text-sm text-gray-600">{client.profile?.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Globe className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{client.profile?.country || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status & Priority */}
                        <div className="col-span-2">
                          <div className="space-y-2">
                            <select
                              value={client.status}
                              onChange={(e) => updateClientStatus(client.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(client.status)}`}
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(client.priority)}`}></div>
                              <select
                                value={client.priority}
                                onChange={(e) => updateClientPriority(client.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Progress & Service */}
                        <div className="col-span-2">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(client.progress)}`}
                                  style={{ width: `${client.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{client.progress}%</span>
                            </div>
                            <p className="text-xs text-gray-600">{client.service_type.replace('_', ' ').toUpperCase()}</p>
                            {client.satisfaction_rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{client.satisfaction_rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Revenue & Orders */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-green-600">
                              ${(client.total_revenue || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {client.total_orders || 0} orders
                            </p>
                            <p className="text-xs text-gray-500">
                              Last: {client.last_contact ? new Date(client.last_contact).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="col-span-2">
                          <div className="space-y-1">
                            {client.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{client.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{client.profile?.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {new Date(client.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setIsChatOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Send Message"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setShowMailboxModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mailbox"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setShowClientModal(true);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="More Options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} clients
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm rounded-lg ${
                                  currentPage === page
                                    ? 'bg-purple-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          {totalPages > 5 && (
                            <>
                              <span className="px-2 text-gray-500">...</span>
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`px-3 py-2 text-sm rounded-lg ${
                                  currentPage === totalPages
                                    ? 'bg-purple-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
          targetUserId={selectedClient.profile_id}
        />
      )}

      {/* Virtual Mailbox Modal */}
      {showMailboxModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Virtual Mailbox - {selectedClient.company_name || selectedClient.profile?.full_name}
                </h2>
                <button
                  onClick={() => {
                    setShowMailboxModal(false);
                    setSelectedClient(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <VirtualMailboxManager 
                clientId={selectedClient.id}
                viewMode="consultant"
              />
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => {
                    setShowClientModal(false);
                    setSelectedClient(null);
                  }}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Service Type:</span>
                      <p className="font-medium">{selectedClient.service_type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                        {selectedClient.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Priority:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedClient.priority)}`}></div>
                        <span className="font-medium">{selectedClient.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Progress:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(selectedClient.progress)}`}
                            style={{ width: `${selectedClient.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{selectedClient.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-700">${(selectedClient.total_revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedClient.total_orders || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Satisfaction</p>
                    <div className="flex items-center space-x-1">
                      <p className="text-2xl font-bold text-purple-700">
                        {selectedClient.satisfaction_rating || 'N/A'}
                      </p>
                      {selectedClient.satisfaction_rating && (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setIsChatOpen(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setShowMailboxModal(true);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Mailbox</span>
                </button>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Generate Report</span>
                </button>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setShowServiceRequestsModal(true);
                  }}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Service Requests</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Requests Modal */}
      {showServiceRequestsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Service Requests - {selectedClient.company_name || selectedClient.profile?.full_name}
                </h2>
                <button
                  onClick={() => {
                    setShowServiceRequestsModal(false);
                    setSelectedClient(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Service Requests</h3>
                <p className="text-gray-600">
                  Bu müşterinin hizmet talepleri burada görünecektir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomersManagement;