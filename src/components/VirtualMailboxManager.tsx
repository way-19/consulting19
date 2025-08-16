import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadFileToStorage } from '../lib/supabase';
import FileUpload, { UploadedFile } from './common/FileUpload';
import StripeCheckout from './StripeCheckout';
import { 
  Mail, 
  Package, 
  Eye, 
  Download, 
  Send, 
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  RefreshCw,
  Upload,
  Plus,
  Save
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
}

interface ShippingAddress {
  full_name: string;
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
  isOpen,
  onClose,
  clientId
}) => {
  const { profile } = useAuth();
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: '',
    email: ''
  });
  const [selectedShippingOption, setSelectedShippingOption] = useState<'normal' | 'express'>('normal');

  const shippingOptions = [
    {
      value: 'normal',
      label: 'Normal Shipping',
      price: 15,
      description: '7-14 business days',
      icon: Package
    },
    {
      value: 'express',
      label: 'Express Shipping',
      price: 25,
      description: '3-5 business days',
      icon: Truck
    }
  ];

  useEffect(() => {
    if (isOpen && (profile?.id || clientId)) {
      fetchMailboxItems();
    }
  }, [isOpen, profile, clientId]);

  const fetchMailboxItems = async () => {
    try {
      setLoading(true);
      
      let targetClientId = clientId;
      
      if (!targetClientId && profile?.role === 'client') {
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        
        if (!clientData) {
          setLoading(false);
          return;
        }
        targetClientId = clientData.id;
      }

      if (!targetClientId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('virtual_mailbox_items')
        .select('*')
        .eq('client_id', targetClientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMailboxItems(data || []);
    } catch (error) {
      console.error('Error fetching mailbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (item: VirtualMailboxItem) => {
    if (item.file_url) {
      await supabase
        .from('virtual_mailbox_items')
        .update({ 
          status: 'viewed',
          viewed_date: new Date().toISOString()
        })
        .eq('id', item.id);
      
      window.open(item.file_url, '_blank');
      await fetchMailboxItems();
    }
  };

  const handleDownloadDocument = async (item: VirtualMailboxItem) => {
    if (item.file_url) {
      await supabase
        .from('virtual_mailbox_items')
        .update({ 
          status: 'downloaded',
          downloaded_date: new Date().toISOString()
        })
        .eq('id', item.id);
      
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.document_name;
      link.click();
      
      await fetchMailboxItems();
    }
  };

  const handleRequestForwarding = (item: VirtualMailboxItem) => {
    setSelectedItem(item);
    setShippingAddress(prev => ({
      ...prev,
      email: profile?.email || '',
      full_name: profile?.full_name || ''
    }));
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedItem) return;

    try {
      await supabase
        .from('virtual_mailbox_items')
        .update({
          payment_status: 'paid',
          shipping_fee: shippingOptions.find(opt => opt.value === selectedShippingOption)?.price || 15,
          shipping_option: selectedShippingOption,
          shipping_address: shippingAddress,
          status: 'pending'
        })
        .eq('id', selectedItem.id);

      setShowPaymentModal(false);
      setSelectedItem(null);
      await fetchMailboxItems();
      
      alert('Payment successful! Your forwarding request has been submitted to the consultant.');
    } catch (error) {
      console.error('Error updating mailbox item:', error);
      alert('Payment successful but failed to update forwarding request. Please contact support.');
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!clientId) {
      alert('Cannot upload documents: No client selected');
      return;
    }

    try {
      setUploadingFiles(true);
      
      for (const file of selectedFiles) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const { path, publicUrl } = await uploadFileToStorage('documents', file, {
          pathPrefix: 'mailbox'
        });
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        
        const { error } = await supabase
          .from('virtual_mailbox_items')
          .insert([{
            client_id: clientId,
            consultant_id: profile?.id,
            document_type: file.type,
            document_name: file.name,
            description: `Document uploaded by consultant`,
            file_url: publicUrl,
            file_size: file.size,
            status: 'pending',
            payment_status: 'unpaid',
            shipping_fee: 0
          }]);

        if (error) throw error;
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      setSelectedFiles([]);
      setUploadProgress({});
      
      await fetchMailboxItems();
      
      alert(`${selectedFiles.length} document(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents: ' + (error as Error).message);
    } finally {
      setUploadingFiles(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'downloaded': return <Download className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Virtual Mailbox</h2>
                  <p className="text-gray-600">View and manage your documents</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchMailboxItems}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
                {profile?.role === 'consultant' && clientId && (
                  <button
                    onClick={() => setShowUploadSection(!showUploadSection)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      showUploadSection 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>{showUploadSection ? 'Hide Upload' : 'Upload Documents'}</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Document Upload Section (Consultant Only) */}
            {profile?.role === 'consultant' && showUploadSection && clientId && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Upload className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Upload New Documents</h3>
                      <p className="text-sm text-green-700">Upload documents to client's virtual mailbox</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadSection(false)}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-green-600" />
                  </button>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['application/pdf', '.pdf', '.doc', '.docx', 'image/*']}
                  maxFileSize={50}
                  maxFiles={10}
                  multiple={true}
                  showPreview={true}
                  uploadProgress={uploadProgress}
                  dragDropText="Drag and drop documents here, or click to browse"
                  browseText="Select Documents"
                  className="mb-4"
                />

                {selectedFiles.length > 0 && (
                  <div className="flex items-center space-x-4 pt-4 border-t border-green-200">
                    <button
                      onClick={() => {
                        setSelectedFiles([]);
                        setUploadProgress({});
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear Files
                    </button>
                    <button
                      onClick={handleUploadDocuments}
                      disabled={uploadingFiles}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      {uploadingFiles ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Upload {selectedFiles.length} Document(s)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">Loading mailbox items...</span>
              </div>
            ) : mailboxItems.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Documents in Mailbox</h3>
                <p className="text-gray-600">Your virtual mailbox is empty. Documents uploaded by your consultant will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mailboxItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Document Info */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-blue-100 rounded-lg p-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.document_name}</h3>
                            <p className="text-sm text-gray-600">{item.document_type}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Status and Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(item.status)}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPaymentStatusColor(item.payment_status)}`}>
                              Payment: {item.payment_status.toUpperCase()}
                            </div>
                          </div>

                          <div>
                            {item.file_size && (
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Size:</span> {formatFileSize(item.file_size)}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Added:</span> {new Date(item.created_at).toLocaleDateString()}
                            </div>
                            {item.shipping_fee > 0 && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Shipping:</span> ${item.shipping_fee}
                              </div>
                            )}
                          </div>

                          <div>
                            {item.tracking_number && (
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Tracking:</span> 
                                <span className="font-mono text-blue-600 ml-1">{item.tracking_number}</span>
                              </div>
                            )}
                            {item.sent_date && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Sent:</span> {new Date(item.sent_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address (if paid) */}
                        {item.payment_status === 'paid' && item.shipping_address && (
                          <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-900">Shipping Address</span>
                            </div>
                            <div className="text-sm text-green-800">
                              <p>{item.shipping_address.full_name}</p>
                              <p>{item.shipping_address.address_line_1}</p>
                              {item.shipping_address.address_line_2 && <p>{item.shipping_address.address_line_2}</p>}
                              <p>{item.shipping_address.city}, {item.shipping_address.state_province} {item.shipping_address.postal_code}</p>
                              <p>{item.shipping_address.country}</p>
                              <p>Phone: {item.shipping_address.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-6">
                        {/* View Document */}
                        {item.file_url && (
                          <button
                            onClick={() => handleViewDocument(item)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        )}

                        {/* Download Document */}
                        {item.file_url && (
                          <button
                            onClick={() => handleDownloadDocument(item)}
                            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        )}

                        {/* Request Forwarding (only if not already paid/sent) */}
                        {item.payment_status === 'unpaid' && item.status === 'pending' && (
                          <button
                            onClick={() => handleRequestForwarding(item)}
                            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Request Forwarding</span>
                          </button>
                        )}

                        {/* Tracking Info */}
                        {item.tracking_number && (
                          <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-center">
                            <div className="flex items-center space-x-2">
                              <Truck className="h-4 w-4" />
                              <span className="text-sm font-medium">Tracking Available</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Added: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.viewed_date && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>Viewed: {new Date(item.viewed_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.sent_date && (
                          <div className="flex items-center space-x-1">
                            <Send className="h-3 w-3" />
                            <span>Sent: {new Date(item.sent_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.delivered_date && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Delivered: {new Date(item.delivered_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {mailboxItems.length} document{mailboxItems.length !== 1 ? 's' : ''} in mailbox
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Sent</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal for Forwarding */}
      {showPaymentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Request Document Forwarding</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Document to Forward</h4>
                <p className="text-blue-800">{selectedItem.document_name}</p>
                <p className="text-sm text-blue-700">{selectedItem.document_type}</p>
              </div>

              {/* Shipping Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shipping Option
                </label>
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedShippingOption === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.value}
                        checked={selectedShippingOption === option.value}
                        onChange={(e) => setSelectedShippingOption(e.target.value as 'normal' | 'express')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <option.icon className="h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{option.label}</span>
                          <span className="font-bold text-green-600">${option.price}</span>
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shipping Address Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Shipping Address
                </label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={shippingAddress.full_name}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Full Name *"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Phone Number *"
                      />
                    </div>
                  </div>

                  <input
                    type="email"
                    required
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Email Address *"
                  />

                  <input
                    type="text"
                    required
                    value={shippingAddress.address_line_1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Address Line 1 *"
                  />

                  <input
                    type="text"
                    value={shippingAddress.address_line_2 || ''}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Address Line 2 (Optional)"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="City *"
                    />
                    <input
                      type="text"
                      required
                      value={shippingAddress.state_province}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state_province: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="State/Province *"
                    />
                    <input
                      type="text"
                      required
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Postal Code *"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Country *"
                  />
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Shipping Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${shippingOptions.find(opt => opt.value === selectedShippingOption)?.price}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <StripeCheckout
                  isOpen={false}
                  onClose={() => {}}
                  amount={shippingOptions.find(opt => opt.value === selectedShippingOption)?.price || 15}
                  currency="USD"
                  orderId={selectedItem.id}
                  orderDetails={{
                    serviceName: `Document Forwarding - ${selectedItem.document_name}`,
                    consultantName: 'Document Forwarding Service',
                    deliveryTime: selectedShippingOption === 'express' ? 5 : 14
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    alert('Payment failed: ' + error);
                  }}
                  shippingAddress={shippingAddress}
                  onAddressChange={setShippingAddress}
                  showAddressForm={false}
                />
                <button
                  onClick={() => {
                    // Trigger Stripe payment here
                    alert('Payment integration will be implemented here');
                  }}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pay & Request Forwarding</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualMailboxManager;