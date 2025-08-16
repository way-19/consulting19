import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  MapPin, 
  CreditCard,
  X,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  User,
  Phone,
  Mail
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
  shipping_option?: string;
  shipping_address?: any;
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
  updated_at: string;
}

interface VirtualMailboxManagerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  consultantId?: string;
  userRole: 'client' | 'consultant';
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({
  isOpen,
  onClose,
  clientId,
  consultantId,
  userRole
}) => {
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  useEffect(() => {
    if (isOpen && (clientId || consultantId)) {
      fetchMailboxItems();
    }
  }, [isOpen, clientId, consultantId]);

  const fetchMailboxItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('virtual_mailbox_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      if (consultantId) {
        query = query.eq('consultant_id', consultantId);
      }

      const { data, error } = await query;

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
      alert('Shipping fee payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    }
  };

  const handleDownloadDocument = async (item: VirtualMailboxItem) => {
    try {
      if (!item.file_url) {
        alert('No file available for download');
        return;
      }

      // Update viewed/downloaded status
      const updates: any = {};
      if (!item.viewed_date) {
        updates.viewed_date = new Date().toISOString();
        updates.status = 'viewed';
      }
      if (!item.downloaded_date) {
        updates.downloaded_date = new Date().toISOString();
        updates.status = 'downloaded';
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('virtual_mailbox_items')
          .update(updates)
          .eq('id', item.id);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.document_name;
      link.click();

      await fetchMailboxItems();
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'downloaded': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'downloaded': return <Download className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredItems = mailboxItems.filter(item => {
    const matchesSearch = 
      item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || item.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Virtual Mailbox</h2>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {mailboxItems.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Document name, type, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="viewed">Viewed</option>
                <option value="downloaded">Downloaded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="waived">Waived</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-end pb-2">
              Showing {filteredItems.length} of {mailboxItems.length} items
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {mailboxItems.length === 0 ? 'No Mail Items' : 'No Items Found'}
              </h3>
              <p className="text-gray-600">
                {mailboxItems.length === 0 
                  ? 'No documents have been received in your virtual mailbox yet.'
                  : 'No items match your current filters.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <FileText className="h-6 w-6 text-orange-600" />
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                          {item.payment_status === 'unpaid' ? 'PAYMENT REQUIRED' :
                           item.payment_status === 'paid' ? 'PAID' : 'WAIVED'}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 mb-3">{item.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        {item.tracking_number && (
                          <div className="flex items-center space-x-1">
                            <Truck className="h-4 w-4" />
                            <span>Tracking: {item.tracking_number}</span>
                          </div>
                        )}
                        {item.shipping_fee > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Shipping: ${item.shipping_fee}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Received: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.file_size && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Size: {formatFileSize(item.file_size)}</span>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Received: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.sent_date && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Sent: {new Date(item.sent_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.delivered_date && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Delivered: {new Date(item.delivered_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowItemDetail(true);
                        }}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>

                      {item.file_url && (
                        <button
                          onClick={() => handleDownloadDocument(item)}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}

                      {item.payment_status === 'unpaid' && item.shipping_fee > 0 && userRole === 'client' && (
                        <button
                          onClick={() => handlePayShippingFee(item.id)}
                          className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Pay ${item.shipping_fee}</span>
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
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Mail Item Details</h2>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {selectedItem.tracking_number && (
                    <div>
                      <span className="text-sm text-gray-600">Tracking Number:</span>
                      <p className="font-medium font-mono">{selectedItem.tracking_number}</p>
                    </div>
                  )}
                  {selectedItem.shipping_fee > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Shipping Fee:</span>
                      <p className="font-medium">${selectedItem.shipping_fee}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedItem.shipping_address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedItem.shipping_address.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedItem.shipping_address.address_line_1}
                          {selectedItem.shipping_address.address_line_2 && `, ${selectedItem.shipping_address.address_line_2}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedItem.shipping_address.city}, {selectedItem.shipping_address.state_province} {selectedItem.shipping_address.postal_code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedItem.shipping_address.country}</span>
                      </div>
                      {selectedItem.shipping_address.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{selectedItem.shipping_address.phone}</span>
                        </div>
                      )}
                      {selectedItem.shipping_address.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{selectedItem.shipping_address.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Document Received</p>
                      <p className="text-sm text-gray-600">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedItem.sent_date && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Document Sent</p>
                        <p className="text-sm text-blue-700">{new Date(selectedItem.sent_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.delivered_date && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Document Delivered</p>
                        <p className="text-sm text-green-700">{new Date(selectedItem.delivered_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.viewed_date && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Document Viewed</p>
                        <p className="text-sm text-purple-700">{new Date(selectedItem.viewed_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.downloaded_date && (
                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <Download className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-medium text-indigo-900">Document Downloaded</p>
                        <p className="text-sm text-indigo-700">{new Date(selectedItem.downloaded_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedItem.file_url && (
                  <button
                    onClick={() => handleDownloadDocument(selectedItem)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Document</span>
                  </button>
                )}

                {selectedItem.payment_status === 'unpaid' && selectedItem.shipping_fee > 0 && userRole === 'client' && (
                  <button
                    onClick={() => {
                      setShowItemDetail(false);
                      handlePayShippingFee(selectedItem.id);
                    }}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Pay Shipping Fee (${selectedItem.shipping_fee})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default VirtualMailboxManager;