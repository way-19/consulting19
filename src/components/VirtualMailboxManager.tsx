import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Truck, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  User,
  Building
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
  shipping_fee: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
  updated_at: string;
  shipping_option?: string;
  shipping_address?: {
    full_name?: string;
    company_name?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
}

interface VirtualMailboxManagerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({
  isOpen,
  onClose,
  clientId
}) => {
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    if (isOpen && clientId) {
      fetchMailboxItems();
    }
  }, [isOpen, clientId]);

  const fetchMailboxItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('virtual_mailbox_items')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMailboxItems(data || []);
    } catch (error) {
      console.error('Error fetching mailbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayShippingFee = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ payment_status: 'paid' })
        .eq('id', itemId);

      if (error) throw error;
      await fetchMailboxItems();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDownloadDocument = async (item: VirtualMailboxItem) => {
    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ 
          status: 'downloaded',
          downloaded_date: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;
      
      if (item.file_url) {
        window.open(item.file_url, '_blank');
      }
      
      await fetchMailboxItems();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleViewDocument = async (item: VirtualMailboxItem) => {
    try {
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ 
          status: 'viewed',
          viewed_date: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;
      
      setSelectedItem(item);
      setShowItemModal(true);
      
      await fetchMailboxItems();
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  if (!isOpen) return null;

  // Filter items based on search and filters
  const q = (searchTerm || '').toLowerCase();
  const filteredItems = (mailboxItems || []).filter(item => {
    const name = (item.document_name || '').toLowerCase();
    const type = (item.document_type || '').toLowerCase();
    const track = (item.tracking_number || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || type.includes(q) || track.includes(q);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || item.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'downloaded': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Virtual Mailbox</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents, tracking numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="viewed">Viewed</option>
                <option value="downloaded">Downloaded</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Mail Items</h3>
              <p className="text-gray-600">
                {mailboxItems.length === 0 
                  ? "No mail items have been received yet."
                  : "No items match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.document_name}</h3>
                        <p className="text-sm text-gray-600">{item.document_type}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                          {item.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {item.tracking_number && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Tracking:</span>
                          <span className="text-sm text-gray-600 font-mono">{item.tracking_number}</span>
                        </div>
                      </div>
                    )}

                    {/* Shipping Fee */}
                    {item.shipping_fee > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Shipping Fee:</span>
                        <span className="font-semibold text-gray-900">${item.shipping_fee}</span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      {item.sent_date && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Truck className="h-3 w-3" />
                          <span>Sent: {new Date(item.sent_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.delivered_date && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>Delivered: {new Date(item.delivered_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(item)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      
                      {item.file_url && (
                        <button
                          onClick={() => handleDownloadDocument(item)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}

                      {item.payment_status === 'unpaid' && item.shipping_fee > 0 && (
                        <button
                          onClick={() => handlePayShippingFee(item.id)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>Pay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Document Details</h3>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Document Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Document Name:</span>
                    <p className="font-medium">{selectedItem.document_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Document Type:</span>
                    <p className="font-medium">{selectedItem.document_type}</p>
                  </div>
                  {selectedItem.file_size && (
                    <div>
                      <span className="text-sm text-gray-600">File Size:</span>
                      <p className="font-medium">{(selectedItem.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {selectedItem.description && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="font-medium mt-1">{selectedItem.description}</p>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              {selectedItem.tracking_number && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Shipping Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Tracking Number:</span>
                      <span className="font-mono text-sm">{selectedItem.tracking_number}</span>
                    </div>
                    {selectedItem.shipping_option && (
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Shipping Option:</span>
                        <span className="text-sm">{selectedItem.shipping_option}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {selectedItem.shipping_address && Object.keys(selectedItem.shipping_address).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Delivery Address</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedItem.shipping_address.full_name && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span>{selectedItem.shipping_address.full_name}</span>
                        </div>
                      )}
                      {selectedItem.shipping_address.company_name && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span>{selectedItem.shipping_address.company_name}</span>
                        </div>
                      )}
                      {selectedItem.shipping_address.address_line_1 && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <div>
                            <p>{selectedItem.shipping_address.address_line_1}</p>
                            {selectedItem.shipping_address.address_line_2 && (
                              <p>{selectedItem.shipping_address.address_line_2}</p>
                            )}
                            <p>
                              {selectedItem.shipping_address.city}, {selectedItem.shipping_address.state_province} {selectedItem.shipping_address.postal_code}
                            </p>
                            <p>{selectedItem.shipping_address.country}</p>
                          </div>
                        </div>
                      )}
                      {selectedItem.shipping_address.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <span>{selectedItem.shipping_address.phone}</span>
                        </div>
                      )}
                      {selectedItem.shipping_address.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-600" />
                          <span>{selectedItem.shipping_address.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Document Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedItem.sent_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Sent</p>
                        <p className="text-xs text-gray-500">{new Date(selectedItem.sent_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.delivered_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Delivered</p>
                        <p className="text-xs text-gray-500">{new Date(selectedItem.delivered_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.viewed_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Viewed</p>
                        <p className="text-xs text-gray-500">{new Date(selectedItem.viewed_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.downloaded_date && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Downloaded</p>
                        <p className="text-xs text-gray-500">{new Date(selectedItem.downloaded_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {selectedItem.file_url && (
                  <button
                    onClick={() => handleDownloadDocument(selectedItem)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                )}

                {selectedItem.payment_status === 'unpaid' && selectedItem.shipping_fee > 0 && (
                  <button
                    onClick={() => handlePayShippingFee(selectedItem.id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Pay ${selectedItem.shipping_fee}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMailboxManager;