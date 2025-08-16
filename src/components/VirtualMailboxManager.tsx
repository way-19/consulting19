import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, uploadFileToStorage } from '../lib/supabase';
import FileUpload, { UploadedFile } from './common/FileUpload';
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

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({
  isOpen,
  onClose,
  clientId
}) => {
  const { profile } = useAuth();
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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
        
        // Upload file to storage
        const { path, publicUrl } = await uploadFileToStorage('documents', file, {
          pathPrefix: 'mailbox'
        });
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        
        // Create database record
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
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
                <p className="text-gray-600">View and manage documents</p>
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
          {profile?.role === 'consultant' && clientId && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Upload New Documents</h3>
                  <p className="text-sm text-green-700">Upload documents to client's virtual mailbox</p>
                </div>
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

          {/* Mailbox Items */}
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

                      {/* Status */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {item.file_size && (
                          <div className="text-sm text-gray-600">
                            Size: {formatFileSize(item.file_size)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Added: {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-6">
                      {item.file_url && (
                        <>
                          <button
                            onClick={() => handleViewDocument(item)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(item)}
                            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </>
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
  );
};

export default VirtualMailboxManager;