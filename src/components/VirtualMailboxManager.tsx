import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { supabase, uploadFileToStorage, getPublicImageUrl, deleteFileFromStorage } from '../lib/supabase';
import StripeCheckout from '../components/StripeCheckout'; // Import StripeCheckout
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Calendar,
  RefreshCw,
  Save,
  X,
  Bell,
  Shield,
  Paperclip,
  Send,
  Mail,
  DollarSign,
  Truck,
  Package,
  Zap
} from 'lucide-react';

interface VirtualMailboxItem {
  id: string;
  client_id: string;
  consultant_id: string;
  document_type: string;
  document_name: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'downloaded';
  tracking_number?: string;
  shipping_fee?: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  shipping_option?: 'standard' | 'express';
  shipping_address?: any; // JSONB type
  created_at: string;
  updated_at: string;
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

interface VirtualMailboxStats {
  totalItems: number;
  pendingPayment: number;
  pendingShipping: number;
  delivered: number;
}

interface VirtualMailboxManagerProps {
  clientId?: string; // For client view
  viewMode: 'client' | 'consultant';
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({ clientId, viewMode }) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<VirtualMailboxItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VirtualMailboxItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  // State for Stripe Checkout
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [checkoutOrderDetails, setCheckoutOrderDetails] = useState({
    serviceName: '',
    consultantName: '',
    deliveryTime: 0,
  });
  const [shippingAddress, setShippingAddress] = useState({
    full_name: profile?.full_name || '',
    company_name: '', // Will be fetched from client data
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: profile?.country || '',
    phone: profile?.phone || '',
    email: profile?.email || ''
  });
  const [selectedShippingOption, setSelectedShippingOption] = useState<'standard' | 'express'>('standard');

  const [stats, setStats] = useState<VirtualMailboxStats>({
    totalItems: 0,
    pendingPayment: 0,
    pendingShipping: 0,
    delivered: 0,
  });

  const documentTypes = [
    'Official Letter', 'Certificate', 'Contract', 'Invoice', 'Bank Statement', 'Tax Document', 'Other'
  ];

  useEffect(() => {
    if (profile?.id || clientId) {
      fetchData();
    }
  }, [profile, clientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchItems(),
        viewMode === 'consultant' ? fetchClients() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    let query = supabase
      .from('virtual_mailbox_items')
      .select(`
        *,
        client:client_id (
          company_name,
          profile:profile_id (
            full_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (viewMode === 'client' && clientId) {
      query = query.eq('client_id', clientId);
    } else if (viewMode === 'consultant' && profile?.id) {
      query = query.eq('consultant_id', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    setItems(data || []);
    calculateStats(data || []);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        company_name,
        profile:profile_id (
          full_name,
          email
        )
      `)
      .eq('assigned_consultant_id', profile?.id);

    if (error) throw error;
    setClients(data || []);
  };

  const calculateStats = (itemsData: VirtualMailboxItem[]) => {
    const stats: VirtualMailboxStats = {
      totalItems: itemsData.length,
      pendingPayment: itemsData.filter(item => item.payment_status === 'unpaid').length,
      pendingShipping: itemsData.filter(item => item.payment_status === 'paid' && item.status === 'pending').length,
      delivered: itemsData.filter(item => item.status === 'delivered').length,
    };
    setStats(stats);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...editingItem, // Keep existing fields if editing
        ...documentForm,
        consultant_id: profile?.id,
        shipping_fee: selectedShippingOption === 'standard' ? 15.00 : 25.00, // Set fee based on option
        payment_status: 'unpaid', // Always unpaid initially
        shipping_option: selectedShippingOption,
        shipping_address: null, // Address will be filled by client
        tracking_number: null, // Tracking will be filled by consultant
      };

      if (editingItem) {
        const { error } = await supabase
          .from('virtual_mailbox_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('virtual_mailbox_items')
          .insert([itemData]);
        
        if (error) throw error;
      }

      await fetchItems();
      resetForm();
      alert('Mailbox item saved successfully!');
    } catch (error) {
      console.error('Error saving mailbox item:', error);
      alert('Failed to save mailbox item: ' + (error as Error).message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this mailbox item?')) return;

    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchItems();
      alert('Mailbox item deleted successfully!');
    } catch (error) {
      console.error('Error deleting mailbox item:', error);
      alert('Failed to delete mailbox item');
    }
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: 'pending' | 'sent' | 'delivered' | 'viewed' | 'downloaded', field: 'status' | 'payment_status' | 'tracking_number' | 'shipping_address', value?: string | any) => {
    try {
      let updateData: any = { [field]: value || newStatus };
      if (field === 'status') {
        if (newStatus === 'sent') updateData.sent_date = new Date().toISOString();
        if (newStatus === 'delivered') updateData.delivered_date = new Date().toISOString();
        if (newStatus === 'viewed') updateData.viewed_date = new Date().toISOString();
        if (newStatus === 'downloaded') updateData.downloaded_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error updating mailbox item status:', error);
    }
  };

  const handlePhysicalShipping = (item: VirtualMailboxItem) => {
    setSelectedItem(item);
    setCheckoutAmount(item.shipping_fee || 0);
    setCheckoutOrderId(item.id);
    setCheckoutOrderDetails({
      serviceName: `Physical Shipping for ${item.document_name}`,
      consultantName: profile?.full_name || 'Consulting19',
      deliveryTime: item.shipping_option === 'express' ? 3 : 7, // Mock delivery time
    });
    // Pre-fill address if available from item or profile
    setShippingAddress(prev => ({
      ...prev,
      full_name: item.shipping_address?.full_name || profile?.full_name || '',
      email: item.shipping_address?.email || profile?.email || '',
      phone: item.shipping_address?.phone || profile?.phone || '',
      address_line_1: item.shipping_address?.address_line_1 || '',
      address_line_2: item.shipping_address?.address_line_2 || '',
      city: item.shipping_address?.city || '',
      state_province: item.shipping_address?.state_province || '',
      postal_code: item.shipping_address?.postal_code || '',
      country: item.shipping_address?.country || profile?.country || '',
    }));
    setShowStripeCheckout(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (selectedItem) {
      await handleUpdateItemStatus(selectedItem.id, 'paid', 'payment_status', 'paid');
      await handleUpdateItemStatus(selectedItem.id, 'pending', 'status', 'pending'); // Set status to pending for consultant to ship
      await handleUpdateItemStatus(selectedItem.id, 'shipping_address', 'shipping_address', shippingAddress); // Save address
      alert('Payment successful! Your document will be shipped soon.');
      setShowStripeCheckout(false);
      setSelectedItem(null);
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
    setShowStripeCheckout(false);
    setSelectedItem(null);
  };

  const resetForm = () => {
    setDocumentForm({
      document_type: '',
      document_name: '',
      description: '',
      file_url: '',
      file_size: 0,
      shipping_option: 'standard'
    });
    setEditingItem(null);
    setShowItemModal(false);
    setSelectedShippingOption('standard');
  };

  const documentForm = {
    document_type: editingItem?.document_type || '',
    document_name: editingItem?.document_name || '',
    description: editingItem?.description || '',
    file_url: editingItem?.file_url || '',
    file_size: editingItem?.file_size || 0,
    shipping_option: editingItem?.shipping_option || 'standard'
  };

  const setDocumentForm = (updates: Partial<typeof documentForm>) => {
    if (editingItem) {
      setEditingItem(prev => ({ ...prev!, ...updates }));
    } else {
      // This part is for the add new item form, not editing
      // For simplicity, we'll just update a local state for the form
      // In a real app, you might have a dedicated form state for new items
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesClient = clientFilter === 'all' || item.client_id === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'unpaid': return <DollarSign className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {viewMode === 'consultant' && (
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
                <h1 className="text-2xl font-bold text-gray-900">Virtual Mailbox Management</h1>
                <p className="text-gray-600 mt-1">Manage physical documents for your clients</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowItemModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Mailbox Item</span>
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
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'consultant' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <Mail className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                  <p className="text-3xl font-bold text-red-600">{stats.pendingPayment}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Shipping</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingShipping}</p>
                </div>
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Document name, type, tracking..."
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
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="viewed">Viewed</option>
                <option value="downloaded">Downloaded</option>
              </select>
            </div>

            {viewMode === 'consultant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.profile?.full_name || client.profile?.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Mailbox Items List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Mailbox Items</h3>
            <p className="text-gray-600">
              {viewMode === 'consultant' ? 'Create your first mailbox item to send to clients.' : 'You have no items in your virtual mailbox.'}
            </p>
            {viewMode === 'consultant' && (
              <button
                onClick={() => setShowItemModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors mt-6"
              >
                Create First Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.document_name}</h3>
                        <p className="text-sm text-gray-600">{item.document_type}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(item.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      {viewMode === 'consultant' && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{item.client?.company_name || item.client?.profile?.full_name || 'Unknown Client'}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Size:</span> {item.file_size ? formatFileSize(item.file_size) : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Created:</span> {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tracking:</span> {item.tracking_number || 'Not assigned yet'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Payment:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                          {item.payment_status.toUpperCase()}
                        </span>
                      </div>
                      {item.shipping_option && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Shipping:</span> {item.shipping_option.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.file_url && (
                      <button
                        onClick={() => window.open(item.file_url, '_blank')}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    )}

                    {viewMode === 'client' && item.payment_status === 'unpaid' && item.shipping_fee && (
                      <button
                        onClick={() => handlePhysicalShipping(item)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Physical Shipping</span>
                      </button>
                    )}

                    {viewMode === 'consultant' && item.payment_status === 'paid' && item.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          onChange={(e) => setSelectedItem(prev => ({ ...prev!, tracking_number: e.target.value }))}
                          value={selectedItem?.id === item.id ? selectedItem.tracking_number || '' : ''}
                        />
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'sent', 'tracking_number', selectedItem?.tracking_number)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </button>
                      </div>
                    )}

                    {viewMode === 'consultant' && item.status === 'sent' && (
                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'delivered', 'status')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Delivered</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowItemDetail(true);
                      }}
                      className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {viewMode === 'consultant' && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Form Modal (Consultant View) */}
      {viewMode === 'consultant' && showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit Mailbox Item' : 'New Mailbox Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitItem} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  required
                  value={documentForm.client_id}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.profile?.full_name || client.profile?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentForm.document_name}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, document_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Original Company Certificate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    required
                    value={documentForm.document_type}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select document type...</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={documentForm.description}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Additional notes about this item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File URL (Optional - for digital copy)
                </label>
                <input
                  type="text"
                  value={documentForm.file_url}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, file_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/document.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size (Bytes - Optional)
                </label>
                <input
                  type="number"
                  value={documentForm.file_size}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, file_size: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Option *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="shipping_option"
                      value="standard"
                      checked={selectedShippingOption === 'standard'}
                      onChange={() => setSelectedShippingOption('standard')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span>Standard ($15.00)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="shipping_option"
                      value="express"
                      checked={selectedShippingOption === 'express'}
                      onChange={() => setSelectedShippingOption('express')}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span>Express ($25.00)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingItem ? 'Update' : 'Create'} Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Mailbox Item Details</h2>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Document Name:</span>
                      <p className="font-medium">{selectedItem.document_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Document Type:</span>
                      <p className="font-medium">{selectedItem.document_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedItem.payment_status)}`}>
                        {selectedItem.payment_status.toUpperCase()}
                      </span>
                    </div>
                    {selectedItem.shipping_fee && (
                      <div>
                        <span className="text-sm text-gray-600">Shipping Fee:</span>
                        <p className="font-medium">${selectedItem.shipping_fee.toFixed(2)} ({selectedItem.shipping_option === 'standard' ? 'Standard' : 'Express'})</p>
                      </div>
                    )}
                    {selectedItem.tracking_number && (
                      <div>
                        <span className="text-sm text-gray-600">Tracking Number:</span>
                        <p className="font-medium">{selectedItem.tracking_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client & Shipping Info</h3>
                  <div className="space-y-3">
                    {selectedItem.client && (
                      <>
                        <div>
                          <span className="text-sm text-gray-600">Client:</span>
                          <p className="font-medium">{selectedItem.client.company_name || selectedItem.client.profile?.full_name || selectedItem.client.profile?.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Client Email:</span>
                          <p className="font-medium">{selectedItem.client.profile?.email}</p>
                        </div>
                      </>
                    )}
                    {selectedItem.shipping_address ? (
                      <>
                        <div>
                          <span className="text-sm text-gray-600">Shipping Address:</span>
                          <p className="font-medium">{selectedItem.shipping_address.full_name}</p>
                          <p className="text-sm text-gray-600">{selectedItem.shipping_address.address_line_1}</p>
                          {selectedItem.shipping_address.address_line_2 && <p className="text-sm text-gray-600">{selectedItem.shipping_address.address_line_2}</p>}
                          <p className="text-sm text-gray-600">{selectedItem.shipping_address.city}, {selectedItem.shipping_address.state_province} {selectedItem.shipping_address.postal_code}</p>
                          <p className="text-sm text-gray-600">{selectedItem.shipping_address.country}</p>
                          <p className="text-sm text-gray-600">Phone: {selectedItem.shipping_address.phone}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-sm text-gray-600">Shipping Address:</span>
                        <p className="font-medium text-gray-500">Not provided yet (pending client payment)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.file_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Copy</h3>
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700">{selectedItem.document_name}</span>
                    <a 
                      href={selectedItem.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {viewMode === 'consultant' && selectedItem.payment_status === 'paid' && selectedItem.status === 'pending' && (
                  <>
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => setSelectedItem(prev => ({ ...prev!, tracking_number: e.target.value }))}
                      value={selectedItem.tracking_number || ''}
                    />
                    <button
                      onClick={() => handleUpdateItemStatus(selectedItem.id, 'sent', 'tracking_number', selectedItem.tracking_number)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-5 w-5" />
                      <span>Mark as Sent</span>
                    </button>
                  </>
                )}
                {viewMode === 'consultant' && selectedItem.status === 'sent' && (
                  <button
                    onClick={() => handleUpdateItemStatus(selectedItem.id, 'delivered', 'status')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Mark as Delivered</span>
                  </button>
                )}
                {viewMode === 'consultant' && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Item</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showStripeCheckout && (
        <StripeCheckout
          isOpen={showStripeCheckout}
          onClose={() => setShowStripeCheckout(false)}
          amount={checkoutAmount}
          currency="USD"
          orderId={checkoutOrderId}
          orderDetails={checkoutOrderDetails}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          shippingAddress={shippingAddress}
          onAddressChange={setShippingAddress}
          showAddressForm={true} // Always show address form for physical shipping
        />
      )}
    </div>
  );
};

export default VirtualMailboxManager;
