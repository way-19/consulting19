import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl } from '../lib/supabase';
import { useFileUpload } from '../hooks/useFileUpload';
import { 
  Mail, 
  Package, 
  Plus, 
  Eye, 
  Download, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Upload,
  X,
  Save,
  RefreshCw,
  Truck,
  MapPin,
  CreditCard,
  DollarSign
} from 'lucide-react';
import StripeCheckout from './StripeCheckout';

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
  clientId?: string;
  viewMode: 'consultant' | 'client';
}

interface ShippingAddress {
  full_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({ 
  clientId, 
  viewMode 
}) => {
  const { profile } = useAuth();
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    company_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: '',
    email: ''
  });

  const { uploadFile, uploadState, clearUploadState } = useFileUpload({
    bucketName: 'public_images',
    folder: 'consultant_uploads',
    onUploadComplete: (file, filePath) => {
      setDocumentForm(prev => ({ ...prev, file_url: getPublicImageUrl(filePath, 'public_images'), file_size: file.size }));
      alert('File uploaded successfully! Remember to save the mailbox item.');
    },
    onUploadError: (file, error) => {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error}`);
    }
  });

  const [documentForm, setDocumentForm] = useState({
    document_type: '',
    document_name: '',
    description: '',
    file_url: '',
    file_size: 0,
    shipping_fee: 0,
    shipping_option: 'standard'
  });

  useEffect(() => {
    fetchMailboxItems();
  }, [clientId, profile]);

  const fetchMailboxItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('virtual_mailbox_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (viewMode === 'consultant') {
        query = query.eq('consultant_id', profile?.id);
      } else if (clientId) {
        query = query.eq('client_id', clientId);
      } else if (profile?.id) {
        // For client view, get client record first
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (clientData) {
          query = query.eq('client_id', clientData.id);
        }
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentForm.file_url) {
      alert('Please upload a file first');
      return;
    }

    try {
      let targetClientId = clientId;

      if (!targetClientId && viewMode === 'consultant') {
        // For consultant view, we need to select a client
        alert('Please specify which client this document is for');
        return;
      }

      if (!targetClientId && viewMode === 'client') {
        // Get client ID from profile
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (!clientData) {
          alert('Client record not found');
          return;
        }
        targetClientId = clientData.id;
      }

      const { error } = await supabase
        .from('virtual_mailbox_items')
        .insert([{
          client_id: targetClientId,
          consultant_id: profile?.id,
          document_type: documentForm.document_type,
          document_name: documentForm.document_name,
          description: documentForm.description,
          file_url: documentForm.file_url,
          file_size: documentForm.file_size,
          shipping_fee: documentForm.shipping_fee,
          shipping_option: documentForm.shipping_option,
          status: 'pending',
          payment_status: documentForm.shipping_fee > 0 ? 'unpaid' : 'waived'
        }]);

      if (error) throw error;

      await fetchMailboxItems();
      resetForm();
      alert('Document added to virtual mailbox successfully!');
    } catch (error) {
      console.error('Error adding mailbox item:', error);
      alert('Failed to add document to mailbox');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    try {
      const filePath = await uploadFile(file);
      const fileUrl = getPublicImageUrl(filePath, 'public_images');
      
      setDocumentForm(prev => ({
        ...prev,
        file_url: fileUrl,
        file_size: file.size,
        document_name: prev.document_name || file.name
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  const handleShipDocument = async (item: VirtualMailboxItem) => {
    if (item.shipping_fee > 0 && item.payment_status !== 'paid') {
      // Need payment first
      setSelectedItem(item);
      setShowPaymentModal(true);
      return;
    }

    // Proceed with shipping
    setSelectedItem(item);
    setShowShippingModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedItem) return;

    try {
      // Update payment status
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ 
          payment_status: 'paid',
          shipping_address: shippingAddress
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setShowPaymentModal(false);
      setSelectedItem(null);
      await fetchMailboxItems();
      alert('Payment successful! Document is ready for shipping.');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleShipConfirm = async () => {
    if (!selectedItem) return;

    try {
      const trackingNumber = `TRK${Date.now()}`;
      
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({ 
          status: 'sent',
          tracking_number: trackingNumber,
          sent_date: new Date().toISOString(),
          shipping_address: shippingAddress
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      // Notify client
      await supabase
        .from('notifications')
        .insert([{
          user_id: selectedItem.client_id,
          type: 'mailbox_document_ready',
          title: 'Document Shipped',
          message: `${selectedItem.document_name} has been shipped. Tracking: ${trackingNumber}`,
          priority: 'normal',
          related_table: 'virtual_mailbox_items',
          related_id: selectedItem.id,
          action_url: '/client/documents'
        }]);

      setShowShippingModal(false);
      setSelectedItem(null);
      await fetchMailboxItems();
      alert(`Document shipped successfully! Tracking number: ${trackingNumber}`);
    } catch (error) {
      console.error('Error shipping document:', error);
      alert('Failed to ship document');
    }
  };

  const resetForm = () => {
    setDocumentForm({
      document_type: '',
      document_name: '',
      description: '',
      file_url: '',
      file_size: 0,
      shipping_fee: 0,
      shipping_option: 'standard'
    });
    setShowAddModal(false);
    clearUploadState();
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'waived': return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Virtual Mailbox</h2>
          <p className="text-gray-600">
            {viewMode === 'consultant' 
              ? 'Manage documents for client delivery' 
              : 'Receive official documents from your consultant'
            }
          </p>
        </div>
        {viewMode === 'consultant' && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Document</span>
            </button>
            <button
              onClick={fetchMailboxItems}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>

      {/* Mailbox Items */}
      {mailboxItems.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {viewMode === 'consultant' ? 'No Documents Added' : 'No Documents Received'}
          </h3>
          <p className="text-gray-600">
            {viewMode === 'consultant' 
              ? 'Add documents to send to your clients via virtual mailbox.'
              : 'Documents from your consultant will appear here.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mailboxItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.document_name}</h3>
                      <p className="text-sm text-gray-600">{item.document_type}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(item.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    {item.shipping_fee > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                        {item.payment_status === 'paid' ? 'PAID' : 
                         item.payment_status === 'unpaid' ? 'PAYMENT REQUIRED' : 'FREE'}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-gray-700 mb-3">{item.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Added: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {item.file_size && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>Size: {formatFileSize(item.file_size)}</span>
                      </div>
                    )}
                    {item.shipping_fee > 0 && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Shipping: ${item.shipping_fee}</span>
                      </div>
                    )}
                    {item.tracking_number && (
                      <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {item.tracking_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {item.sent_date && (
                      <span>Sent: {new Date(item.sent_date).toLocaleDateString()}</span>
                    )}
                    {item.delivered_date && (
                      <span>Delivered: {new Date(item.delivered_date).toLocaleDateString()}</span>
                    )}
                    {item.viewed_date && (
                      <span>Viewed: {new Date(item.viewed_date).toLocaleDateString()}</span>
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

                  {viewMode === 'consultant' && item.status === 'pending' && (
                    <button
                      onClick={() => handleShipDocument(item)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Ship</span>
                    </button>
                  )}

                  {viewMode === 'client' && item.status === 'sent' && item.shipping_fee > 0 && item.payment_status === 'unpaid' && (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowPaymentModal(true);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
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

      {/* Add Document Modal (Consultant Only) */}
      {showAddModal && viewMode === 'consultant' && (
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

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="Company Certificate">Company Certificate</option>
                    <option value="Tax Certificate">Tax Certificate</option>
                    <option value="Bank Documents">Bank Documents</option>
                    <option value="Legal Documents">Legal Documents</option>
                    <option value="Government Forms">Government Forms</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

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
                    placeholder="e.g., Company Registration Certificate"
                  />
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
                  placeholder="Brief description of the document..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (max 50MB)</p>
                  </label>
                  
                  {uploadState.uploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Object.values(uploadState.progress)[0] || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                    </div>
                  )}
                  
                  {documentForm.file_url && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">File uploaded successfully</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Size: {formatFileSize(documentForm.file_size)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Option
                  </label>
                  <select
                    value={documentForm.shipping_option}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, shipping_option: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="standard">Standard Delivery (Free)</option>
                    <option value="express">Express Delivery (+$25)</option>
                    <option value="overnight">Overnight Delivery (+$50)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={documentForm.shipping_fee}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, shipping_fee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
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
                  disabled={!documentForm.file_url}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>Add to Mailbox</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ship Document</h2>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Document Details</h3>
                <p className="text-blue-800">{selectedItem.document_name}</p>
                <p className="text-sm text-blue-700">{selectedItem.document_type}</p>
              </div>

              {/* Shipping Address Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.full_name}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Recipient name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address_line_1}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state_province}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state_province: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleShipConfirm}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Confirm Shipping</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedItem && (
        <StripeCheckout
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedItem.shipping_fee}
          currency="USD"
          orderId={selectedItem.id}
          orderDetails={{
            serviceName: `Shipping: ${selectedItem.document_name}`,
            consultantName: 'Consulting19',
            deliveryTime: 3
          }}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error('Payment error:', error);
            alert('Payment failed: ' + error);
          }}
          shippingAddress={shippingAddress}
          onAddressChange={setShippingAddress}
          showAddressForm={true}
        />
      )}
    </div>
  );
};

export default VirtualMailboxManager;