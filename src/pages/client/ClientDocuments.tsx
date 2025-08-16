import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl, deleteFileFromStorage } from '../../lib/supabase';
import VirtualMailboxManager from '../../components/VirtualMailboxManager';
import FileUpload, { UploadedFile } from '../../components/common/FileUpload';
import FileManager from '../../components/common/FileManager';
import { useFileUpload } from '../../hooks/useFileUpload';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Bell,
  Shield,
  User,
  Calendar,
  Paperclip,
  RefreshCw,
  X,
  Send
} from 'lucide-react';

interface DocumentRequest {
  id: string;
  consultant_id: string;
  client_id: string;
  document_name: string;
  document_type: string;
  category: 'identity' | 'business' | 'financial' | 'medical' | 'other';
  description?: string;
  due_date?: string;
  status: 'requested' | 'uploaded' | 'approved' | 'rejected' | 'needs_revision';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  created_at: string;
  updated_at: string;
  consultant?: {
    full_name: string;
    email: string;
  };
}

interface DocumentWithDetails {
  id: string;
  client_id: string;
  name: string;
  type: string;
  category: 'identity' | 'business' | 'financial' | 'medical' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision' | 'requested';
  file_url?: string;
  file_size?: number;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface DocumentStats {
  totalDocuments: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  documentRequests: number;
}

const ClientDocuments = () => {
  const { profile } = useAuth();
  
  // IMMEDIATE DEBUG - This should show when component renders
  console.log('🎯 ClientDocuments component is RENDERING!');
  console.log('👤 Profile in component:', profile);
  console.log('🆔 Profile ID in component:', profile?.id);
  console.log('📧 Profile Email in component:', profile?.email);
  console.log('🔑 Profile Role in component:', profile?.legacy_role);
  console.log('📍 Component URL check:', window.location.pathname);

  const [documents, setDocuments] = useState<DocumentWithDetails[]>([]);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const { uploadFile, uploadState, clearUploadState } = useFileUpload({
    bucketName: 'documents',
    folder: 'client_documents',
    onUploadComplete: async (file, filePath) => {
      console.log('✅ File uploaded successfully:', file.name, filePath);
      await fetchData();
    },
    onUploadError: (file, error) => {
      console.error('❌ Upload error for', file.name, ':', error);
      alert(`Upload failed for ${file.name}: ${error}`);
    }
  });

  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    category: 'other' as 'identity' | 'business' | 'financial' | 'medical' | 'other',
    description: '',
    file: null as File | null
  });

  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
    documentRequests: 0
  });

  const documentCategories = [
    { value: 'identity', label: 'Identity Documents', icon: User, color: 'bg-blue-100 text-blue-800' },
    { value: 'business', label: 'Business Documents', icon: FileText, color: 'bg-green-100 text-green-800' },
    { value: 'financial', label: 'Financial Documents', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
    { value: 'medical', label: 'Medical Documents', icon: Shield, color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other Documents', icon: Paperclip, color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    console.log('🚀 ClientDocuments component mounted');
    console.log('👤 Profile:', profile);
    console.log('🆔 Profile ID:', profile?.id);
    console.log('📧 Profile Email:', profile?.email);
    console.log('🔑 Profile Legacy Role:', profile?.legacy_role);
    
    if (profile?.id) {
      console.log('✅ Profile exists, calling fetchData...');
      fetchData();
    } else {
      console.log('❌ No profile, skipping fetchData');
      setLoading(false);
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      console.log('🔄 fetchData: Starting...');
      setLoading(true);
      console.log('🔍 fetchData: Fetching client data for profile:', profile?.id);
      
      await Promise.all([
        fetchDocuments(),
        fetchDocumentRequests()
      ]);
      console.log('✅ fetchData: All data fetched successfully');
    } catch (error) {
      console.error('❌ fetchData: Error:', error);
    } finally {
      console.log('🏁 fetchData: Setting loading to false');
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log('📄 fetchDocuments: Starting...');
      // Get client ID first
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      console.log('🔍 fetchDocuments: Client data:', clientData);

      if (!clientData) {
        console.log('❌ fetchDocuments: No client record found for profile:', profile?.id);
        setDocuments([]);
        return;
      }

      // Set client ID for virtual mailbox
      setClientId(clientData.id);

      // Get documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', clientData.id)
        .order('uploaded_at', { ascending: false });

      console.log('📄 fetchDocuments: Documents query result:', { data, error });

      if (error) throw error;
      
      console.log('📁 fetchDocuments: Found', data?.length || 0, 'documents');
      console.log('📋 fetchDocuments: Setting documents state with:', data);
      setDocuments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('❌ fetchDocuments: Error:', error);
      setDocuments([]);
    }
  };

  const fetchDocumentRequests = async () => {
    try {
      console.log('📋 fetchDocumentRequests: Starting...');
      // Get client ID first
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      console.log('🔍 fetchDocumentRequests: Client data:', clientData);

      if (!clientData) {
        console.log('❌ fetchDocumentRequests: No client record found for profile:', profile?.id);
        setDocumentRequests([]);
        return;
      }

      // Get document requests
      const { data, error } = await supabase
        .from('document_requests')
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          )
        `)
        .eq('client_id', clientData.id)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      console.log('📋 fetchDocumentRequests: Requests query result:', { data, error });

      if (error) throw error;
      
      console.log('📋 fetchDocumentRequests: Found', data?.length || 0, 'requests');
      console.log('📋 fetchDocumentRequests: Setting requests state with:', data);
      setDocumentRequests(data || []);
      
      // Update stats with request count
      setStats(prev => ({
        ...prev,
        documentRequests: data?.length || 0
      }));
    } catch (error) {
      console.error('❌ fetchDocumentRequests: Error:', error);
      setDocumentRequests([]);
    }
  };

  const calculateStats = (documentsData: DocumentWithDetails[]) => {
    const stats: DocumentStats = {
      totalDocuments: documentsData.length,
      pendingReview: documentsData.filter(d => d.status === 'pending').length,
      approved: documentsData.filter(d => d.status === 'approved').length,
      rejected: documentsData.filter(d => d.status === 'rejected').length,
      needsRevision: documentsData.filter(d => d.status === 'needs_revision').length,
      documentRequests: 0 // Will be updated separately
    };
    setStats(stats);
  };

  const handleUploadForRequest = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setUploadForm({
      name: request.document_name,
      type: request.document_type,
      category: request.category,
      description: request.description || '',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploadingFile(true);

      // Upload file using the enhanced upload system
      const filePath = await uploadFile(uploadForm.file);
      
      // Track document upload
      trackBusinessEvent.documentUpload(uploadForm.type, uploadForm.file.size);
      
      // Get public URL for the uploaded file
      const fileUrl = getPublicImageUrl(filePath, 'documents');
      const fileSize = uploadForm.file.size;
      
      console.log('🔗 File accessible at:', fileUrl);

      if (selectedRequest) {
        // Update existing request
        const { error } = await supabase
          .from('document_requests')
          .update({
            status: 'uploaded'
          })
          .eq('id', selectedRequest.id);

        if (error) throw error;

        // Create actual document record
        const { data: clientData } = await supabase
          .from('clients')
          .select('id, assigned_consultant_id')
          .eq('profile_id', profile?.id)
          .single();

        if (clientData) {
          await supabase
            .from('documents')
            .insert([{
              client_id: clientData.id,
              name: uploadForm.name,
              type: uploadForm.type,
              category: uploadForm.category,
              status: 'pending',
              file_url: fileUrl,
              file_size: fileSize,
              uploaded_at: new Date().toISOString()
            }]);
        }

        // Notify consultant
        if (selectedRequest.consultant_id) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: selectedRequest.consultant_id,
              type: 'document_uploaded',
              title: 'Document Uploaded',
              message: `${uploadForm.name} has been uploaded by client`,
              priority: 'normal',
              related_table: 'documents',
              action_url: '/consultant/documents'
            }]);
        }
      } else {
        // Create new document
        const { data: clientData } = await supabase
          .from('clients')
          .select('id, assigned_consultant_id')
          .eq('profile_id', profile?.id)
          .single();

        if (!clientData) throw new Error('Client record not found');

        const { error } = await supabase
          .from('documents')
          .insert([{
            client_id: clientData.id,
            name: uploadForm.name,
            type: uploadForm.type,
            category: uploadForm.category,
            status: 'pending',
            file_url: fileUrl,
            file_size: fileSize,
            uploaded_at: new Date().toISOString()
          }]);

        if (error) throw error;

        // Notify assigned consultant
        if (clientData.assigned_consultant_id) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: clientData.assigned_consultant_id,
              type: 'document_uploaded',
              title: 'New Document Uploaded',
              message: `${uploadForm.name} has been uploaded by client`,
              priority: 'normal',
              related_table: 'documents',
              action_url: '/consultant/documents'
            }]);
        }
      }

      await fetchData();
      resetUploadForm();
      clearUploadState();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload document';
      if (error instanceof Error) {
        if (error.message.includes('File size must be less than')) {
          errorMessage = error.message;
        } else if (error.message.includes('storage')) {
          errorMessage = 'Storage error: Please check if the documents bucket exists in Supabase Storage';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0]; // Take first file for single upload
    setUploadForm(prev => ({ ...prev, file }));
    
    // Auto-fill form if possible
    if (!uploadForm.name) {
      setUploadForm(prev => ({ ...prev, name: file.name.split('.')[0] }));
    }
  };

  const handleFileDelete = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Delete from storage if file_url exists
      if (document.file_url) {
        try {
          // Extract file path from URL
          const url = new URL(document.file_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/'); // Get last two parts (folder/filename)
          await deleteFileFromStorage(filePath, 'documents');
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      await fetchData();
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  // Convert documents to UploadedFile format for FileManager
  const uploadedFiles: UploadedFile[] = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    url: doc.file_url || '',
    size: doc.file_size || 0,
    type: doc.type || 'application/octet-stream',
    uploadedAt: doc.uploaded_at
  }));
  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      type: '',
      category: 'other',
      description: '',
      file: null
    });
    setSelectedRequest(null);
    setShowUploadModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'requested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_revision': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'requested': return <Bell className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryInfo = (category: string) => {
    return documentCategories.find(cat => cat.value === category) || documentCategories[4];
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link 
              to="/client-accounting"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
              <p className="text-gray-600 mt-1">Upload and manage your business documents</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Document</span>
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
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Revision</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.needsRevision}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requested</p>
                <p className="text-3xl font-bold text-purple-600">{stats.documentRequests}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Document Requests from Consultant */}
        {documentRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Bell className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Documents Requested by Your Consultant</h2>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                {documentRequests.length} pending
              </span>
            </div>
            
            <div className="space-y-4">
              {documentRequests.map((request) => {
                const categoryInfo = getCategoryInfo(request.category);
                
                return (
                  <div key={request.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`${categoryInfo.color} rounded-lg p-2`}>
                            <categoryInfo.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.document_name}</h3>
                            <p className="text-sm text-gray-600">{request.document_type}</p>
                          </div>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            REQUESTED
                          </span>
                        </div>

                        {request.description && (
                          <p className="text-gray-700 mb-3 bg-white rounded p-3 border border-purple-200">
                            <strong>Requirements:</strong> {request.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Requested by: {request.consultant?.full_name}</span>
                          </div>
                          {request.due_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span className={new Date(request.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                Due: {new Date(request.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUploadForRequest(request)}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg animate-pulse"
                      >
                        <Upload className="h-5 w-5" />
                        <span>🚨 Upload Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Debug Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">🔄 Real Database Integration</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Document Requests:</strong> {documentRequests.length} from consultant</p>
            <p><strong>Uploaded Documents:</strong> {documents.length} in database</p>
            <p><strong>Status:</strong> Using real database data</p>
            <p className="text-xs text-blue-700 mt-2">
              💡 Run the migration to see sample document requests from Nino
            </p>
          </div>
        </div>

        {/* My Documents */}
        <FileManager
          files={uploadedFiles}
          onFileUpload={async (files) => {
            // Handle multiple file upload
            for (const file of files) {
              try {
                const filePath = await uploadFile(file);
                
                // Create document record
                const { data: clientData } = await supabase
                  .from('clients')
                  .select('id, assigned_consultant_id')
                  .eq('profile_id', profile?.id)
                  .single();

                if (clientData) {
                  const fileUrl = getPublicImageUrl(filePath, 'documents');
                  
                  await supabase
                    .from('documents')
                    .insert([{
                      client_id: clientData.id,
                      name: file.name,
                      type: file.type,
                      category: 'other',
                      status: 'pending',
                      file_url: fileUrl,
                      file_size: file.size,
                      uploaded_at: new Date().toISOString()
                    }]);

                  // Notify consultant
                  if (clientData.assigned_consultant_id) {
                    await supabase
                      .from('notifications')
                      .insert([{
                        user_id: clientData.assigned_consultant_id,
                        type: 'document_uploaded',
                        title: 'New Document Uploaded',
                        message: `${file.name} has been uploaded by client`,
                        priority: 'normal',
                        related_table: 'documents',
                        action_url: '/consultant/documents'
                      }]);
                  }
                }
              } catch (error) {
                console.error('Error uploading file:', file.name, error);
              }
            }
            await fetchData();
          }}
          onFileDelete={handleFileDelete}
          onRefresh={fetchData}
          allowUpload={true}
          allowDelete={true}
          bucketName="documents"
          folder="client_documents"
          title="My Uploaded Documents"
          emptyStateText="Upload your first document to get started"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        />
      </div>

      {/* Virtual Mailbox Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Virtual Mailbox</h2>
            <p className="text-gray-600">Receive official documents from your consultant</p>
          </div>
          
          {clientId ? (
            <VirtualMailboxManager 
              clientId={clientId} 
              viewMode="client" 
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading virtual mailbox...</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRequest ? 'Upload Requested Document' : 'Upload New Document'}
                </h2>
                <button
                  onClick={resetUploadForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              {selectedRequest && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-purple-800 text-sm">
                    <strong>Consultant Request:</strong> {selectedRequest.consultant?.full_name} has requested this document.
                  </p>
                  {selectedRequest.due_date && (
                    <p className="text-purple-700 text-sm mt-1">
                      <strong>Due Date:</strong> {new Date(selectedRequest.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Passport Copy"
                  disabled={!!selectedRequest}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!selectedRequest}
                  >
                    <option value="">Select document type...</option>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Bank Statement">Bank Statement</option>
                    <option value="Tax Return">Tax Return</option>
                    <option value="Proof of Address">Proof of Address</option>
                    <option value="Business License">Business License</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!selectedRequest}
                  >
                    <option value="identity">Identity Documents</option>
                    <option value="business">Business Documents</option>
                    <option value="financial">Financial Documents</option>
                    <option value="medical">Medical Documents</option>
                    <option value="other">Other Documents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Additional notes about this document..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                  maxFileSize={50}
                  maxFiles={1}
                  multiple={false}
                  showPreview={true}
                  dragDropText="Drop your document here or click to browse"
                  browseText="Choose Document"
                  uploadProgress={uploadState.progress}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Electronic Signature Guide</h4>
                </div>
                <p className="text-sm text-blue-800">
                  For documents requiring electronic signatures, please upload digitally signed PDF files. 
                  Ensure your e-signature is legally valid in your jurisdiction.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || !uploadForm.file}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {uploadingFile || uploadState.uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>{selectedRequest ? 'Upload Requested Document' : 'Upload Document'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;