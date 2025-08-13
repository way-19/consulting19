import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  FileText, 
  Send, 
  Eye, 
  Download, 
  Upload, 
  Package, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Search,
  Filter,
  X,
  Save,
  Trash2,
  Mail,
  Truck,
  CreditCard,
  AlertCircle,
  MapPin
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
  tracking_number: string;
  shipping_fee: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

interface VirtualMailboxManagerProps {
  clientId?: string;
  viewMode: 'consultant' | 'client';
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({ clientId, viewMode }) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingData, setShippingData] = useState({
    delivery_type: 'standard' as 'standard' | 'express',
    recipient_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Pricing configuration
  const SHIPPING_PRICES = {
    standard: 15, // $15 for standard delivery (5-7 business days)
    express: 25   // $25 for express delivery (2-3 business days)
  };

  const [formData, setFormData] = useState({
    client_id: clientId || '',
    document_type: '',
    document_name: '',
    description: '',
    file: null as File | null
  });

  const documentTypes = [
    'Company Registration Certificate',
    'Tax Registration Document',
    'Bank Account Information',
    'Corporate Seal',
    'Shareholder Agreement',
    'Board Resolution',
    'Business License',
    'VAT Certificate',
    'Legal Address Certificate',
    'Director Appointment Letter',
    'Share Certificate',
    'Company Bylaws',
    'Other Official Document'
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchItems();
    } else {
      // Add sample data for testing when no profile
      const sampleItems: VirtualMailboxItem[] = [
        {
          id: 'sample-1',
          client_id: 'client-1',
          consultant_id: 'consultant-1',
          document_type: 'Company Registration Certificate',
          document_name: 'Georgia Tech Solutions LLC - Registration Certificate',
          description: 'Official company registration certificate from Georgian House of Justice',
          file_url: 'https://example.com/sample-certificate.pdf',
          file_size: 245760, // 240 KB
          status: 'sent',
          tracking_number: 'VM-2024-001',
          shipping_fee: 25.00,
          payment_status: 'unpaid',
          sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          client: {
            company_name: 'Georgia Tech Solutions LLC',
            profile: {
              full_name: 'Test Client',
              email: 'client.georgia@consulting19.com'
            }
          }
        },
        {
          id: 'sample-2',
          client_id: 'client-1',
          consultant_id: 'consultant-1',
          document_type: 'Tax Registration Document',
          document_name: 'Tax Number Certificate - GE123456789',
          description: 'Official tax registration certificate with tax number',
          file_url: 'https://example.com/sample-tax-cert.pdf',
          file_size: 189440, // 185 KB
          status: 'delivered',
          tracking_number: 'VM-2024-002',
          shipping_fee: 25.00,
          payment_status: 'paid',
          sent_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          delivered_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          viewed_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          client: {
            company_name: 'Georgia Tech Solutions LLC',
            profile: {
              full_name: 'Test Client',
              email: 'client.georgia@consulting19.com'
            }
          }
        },
        {
          id: 'sample-3',
          client_id: 'client-1',
          consultant_id: 'consultant-1',
          document_type: 'Corporate Seal',
          document_name: 'Official Corporate Seal',
          description: 'Physical corporate seal for official documents',
          status: 'pending',
          tracking_number: 'VM-2024-003',
          shipping_fee: 35.00,
          payment_status: 'unpaid',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          client: {
            company_name: 'Georgia Tech Solutions LLC',
            profile: {
              full_name: 'Test Client',
              email: 'client.georgia@consulting19.com'
            }
          }
        }
      ];
      setItems(sampleItems);
      setLoading(false);
    }
  }, [clientId, profile]);

  const fetchItems = async () => {
    if (!profile?.id) {
      // For testing without database connection
      console.log('🧪 Using sample data for Virtual Mailbox testing');
      setLoading(false);
      return;
    }
    
    try {
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
        `);

      if (viewMode === 'consultant') {
        query = query.eq('consultant_id', profile?.id);
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
      } else if (viewMode === 'client') {
        // Client view - get client record first
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (clientData) {
          query = query.eq('client_id', clientData.id);
        }
      } else {
        // Invalid view mode, return empty results
        setItems([]);
        return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching mailbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate file upload
    if (!formData.file) {
      alert('Please upload a document file');
      return;
    }
    
    // For testing without database
    if (!profile?.id) {
      const newItem: VirtualMailboxItem = {
        id: `sample-${Date.now()}`,
        client_id: formData.client_id || 'client-1',
        consultant_id: 'consultant-1',
        document_type: formData.document_type,
        document_name: formData.document_name,
        description: formData.description,
        file_url: `https://example.com/documents/${formData.file?.name}`,
        file_size: formData.file?.size || 0,
        status: 'pending',
        tracking_number: `VM-2024-${String(items.length + 1).padStart(3, '0')}`,
        shipping_fee: 0,
        payment_status: 'unpaid',
        created_at: new Date().toISOString(),
        client: {
          company_name: 'Georgia Tech Solutions LLC',
          profile: {
            full_name: 'Test Client',
            email: 'client.georgia@consulting19.com'
          }
        }
      };
      
      setItems(prev => [newItem, ...prev]);
      resetForm();
      alert(`Document "${formData.document_name}" uploaded and added to virtual mailbox!\n\nFile: ${formData.file?.name}\n\n(Test Mode - Customer will enter shipping address when requesting delivery)`);
      return;
    }
    
    try {
      // 1) Prepare file URL (simulation)
      let fileUrl = null;
      
      // 2) Destructure formData, excluding file (not in DB schema)
      const { file, ...restOfFormData } = formData;
      
      if (formData.file) {
        // In real implementation, upload to Supabase Storage
        fileUrl = `https://example.com/documents/${formData.file.name}`;
      }
      
      // 3) Prepare DB insert payload
      const itemData = {
        ...restOfFormData,
        consultant_id: profile?.id,
        status: 'pending',
        file_url: fileUrl,
        file_size: formData.file?.size || 0,
        shipping_fee: 0, // Will be set when client chooses delivery option
      };

      const { error } = await supabase
        .from('virtual_mailbox_items')
        .insert([itemData]);

      if (error) throw error;

      await fetchItems();
      resetForm();
      alert('Document added to virtual mailbox successfully!');
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Failed to add document');
    }
  };

  const updateStatus = async (itemId: string, newStatus: string) => {
    // For testing without database
    if (!profile?.id) {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: newStatus as any,
              delivered_date: newStatus === 'delivered' ? new Date().toISOString() : item.delivered_date,
              viewed_date: newStatus === 'viewed' ? new Date().toISOString() : item.viewed_date,
              downloaded_date: newStatus === 'downloaded' ? new Date().toISOString() : item.downloaded_date
            }
          : item
      ));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updatePaymentStatus = async (itemId: string, newPaymentStatus: string) => {
    // For testing without database
    if (!profile?.id) {
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, payment_status: newPaymentStatus as any }
          : item
      ));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ payment_status: newPaymentStatus })
        .eq('id', itemId);

      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: clientId || '',
      document_type: '',
      document_name: '',
      description: '',
      file: null
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloaded': return 'bg-green-100 text-green-800';
      case 'viewed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloaded': return <Download className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || item.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pendingItems = items.filter(i => i.status === 'pending').length;
  const unpaidItems = items.filter(i => i.payment_status === 'unpaid').length;
  const totalRevenue = items.filter(i => i.payment_status === 'paid').reduce((sum, i) => sum + i.shipping_fee, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats for consultant view */}
      {viewMode === 'consultant' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingItems}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">{unpaidItems}</p>
              </div>
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {viewMode === 'consultant' ? 'Virtual Mailbox Management' : 'My Virtual Mailbox'}
          </h2>
          <p className="text-gray-600">
            {viewMode === 'consultant' 
              ? 'Send official documents to clients via virtual mailbox'
              : 'Receive and download your official documents'
            }
          </p>
        </div>
        {viewMode === 'consultant' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Document</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="viewed">Viewed</option>
              <option value="downloaded">Downloaded</option>
            </select>

            {viewMode === 'consultant' && (
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewMode === 'consultant' ? 'No Documents Sent' : 'No Documents Received'}
            </h3>
            <p className="text-gray-600">
              {viewMode === 'consultant' 
                ? 'Start sending documents to your clients via virtual mailbox.'
                : 'You haven\'t received any documents yet.'
              }
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.document_name}</h3>
                      <p className="text-sm text-gray-600">{item.document_type}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-gray-700 mb-3">{item.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Tracking:</span> {item.tracking_number}
                    </div>
                    <div>
                      <span className="font-medium">Shipping Fee:</span> ${item.shipping_fee}
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                        {item.payment_status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {item.sent_date && (
                      <div className="flex items-center space-x-1">
                        <Send className="h-3 w-3" />
                        <span>Sent: {new Date(item.sent_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {item.delivered_date && (
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3" />
                        <span>Delivered: {new Date(item.delivered_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {item.viewed_date && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>Viewed: {new Date(item.viewed_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {viewMode === 'consultant' ? (
                    <>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(item.id, 'sent')}
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                        >
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </button>
                      )}
                      
                      {item.payment_status === 'unpaid' && (
                        <button
                          onClick={() => updatePaymentStatus(item.id, 'waived')}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                        >
                          Waive Fee
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {item.payment_status === 'unpaid' && item.status === 'sent' && (
                        <button
                          onClick={() => handleShippingPayment(item)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Enter Address & Pay ${SHIPPING_PRICES.standard}</span>
                        </button>
                      )}
                      
                      {item.payment_status === 'paid' && item.file_url && (
                        <button
                          onClick={() => {
                            updateStatus(item.id, 'downloaded');
                            // Simulate file download
                            const link = document.createElement('a');
                            link.href = item.file_url;
                            link.download = item.document_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            const name = String(item?.document_name ?? 'Unnamed');
                            alert('Document "' + name + '" downloaded successfully!');
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                      
                      {item.payment_status === 'paid' && item.file_url && !item.viewed_date && (
                        <button
                          onClick={() => {
                            updateStatus(item.id, 'viewed');
                            // Simulate document preview
                            window.open(item.file_url, '_blank');
                          }}
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </button>
                      )}
                    </>
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Document Form Modal */}
      {showAddForm && viewMode === 'consultant' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Document to Virtual Mailbox</h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client Selection */}
              {!clientId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client *
                  </label>
                  <select
                    required
                    value={formData.client_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a client...</option>
                    <option value="client-1">Georgia Tech Solutions LLC</option>
                    <option value="client-2">Test Company Ltd</option>
                    <option value="client-3">Sample Business Inc</option>
                  </select>
                </div>
              )}

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  required
                  value={formData.document_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select document type...</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.document_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Georgia Tech Solutions LLC - Registration Certificate"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData(prev => ({ ...prev, file }));
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {formData.file ? formData.file.name : 'Click to upload document'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </label>
                </div>
                {formData.file && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">{formData.file.name}</span>
                      <span className="text-xs text-green-600">({(formData.file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Additional notes about this document..."
                />
              </div>

              {/* Shipping Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h4>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Process:</strong> Client will see document in their panel, choose delivery option 
                    (Standard $10 / Express $25), enter shipping address, and pay. You will be notified when payment is completed.
                  </p>
                </div>
              </div>

              {/* Actions */}
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
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Add to Mailbox</span>
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
                <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Document Name:</span>
                      <p className="font-medium">{selectedItem.document_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <p className="font-medium">{selectedItem.document_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tracking Number:</span>
                      <p className="font-medium font-mono">{selectedItem.tracking_number}</p>
                    </div>
                    {selectedItem.description && (
                      <div>
                        <span className="text-sm text-gray-600">Description:</span>
                        <p className="font-medium">{selectedItem.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Payment</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={'ml-2 px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(selectedItem.status)}>
                        {selectedItem.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Shipping Fee:</span>
                      <p className="font-medium">${selectedItem.shipping_fee}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedItem.payment_status)}`}>
                        {selectedItem.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Document Created</p>
                      <p className="text-sm text-gray-600">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedItem.sent_date && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Send className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Document Sent</p>
                        <p className="text-sm text-blue-700">{new Date(selectedItem.sent_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.delivered_date && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Document Delivered</p>
                        <p className="text-sm text-purple-700">{new Date(selectedItem.delivered_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.viewed_date && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Document Viewed</p>
                        <p className="text-sm text-green-700">{new Date(selectedItem.viewed_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {viewMode === 'client' && selectedItem.payment_status === 'unpaid' && selectedItem.status === 'sent' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-900">Shipping Address & Payment Required</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please enter your shipping address and pay ${selectedItem.shipping_fee} shipping fee to receive your document.
                      </p>
                      <button
                        onClick={() => {
                          // In real implementation, this would open address form
                          const address = prompt('Enter your shipping address:');
                          if (address) {
                            updatePaymentStatus(selectedItem.id, 'paid');
                            alert(`Address saved: ${address}\nPayment processed: $${selectedItem.shipping_fee}\nDocument will be shipped soon!`);
                          }
                        }}
                        className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Enter Address & Pay ${selectedItem.shipping_fee}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMailboxManager;