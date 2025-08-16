import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl, deleteFileFromStorage } from '../../lib/supabase';
import FileManager from '../../components/common/FileManager';
import FileUpload, { UploadedFile } from '../../components/common/FileUpload';
import { useFileUpload } from '../../hooks/useFileUpload';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
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
  Send,
  Search,
  Filter,
  Edit,
  Trash2,
  MessageSquare
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
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
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
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

interface DocumentStats {
  totalDocuments: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  documentRequests: number;
}

const DocumentManagement = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithDetails[]>([]);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithDetails | null>(null);

  const { uploadFile, uploadState, clearUploadState } = useFileUpload({
    bucketName: 'documents',
    folder: 'consultant_documents',
    onUploadComplete: async (file, filePath) => {
      console.log('✅ File uploaded successfully:', file.name, filePath);
      await fetchData();
    },
    onUploadError: (file, error) => {
      console.error('❌ Upload error for', file.name, ':', error);
      alert(`Upload failed for ${file.name}: ${error}`);
    }
  });

  const [requestForm, setRequestForm] = useState({
    client_id: '',
    document_name: '',
    document_type: '',
    category: 'other' as 'identity' | 'business' | 'financial' | 'medical' | 'other',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
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
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchDocumentRequests(),
        fetchClients()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      // Get documents for all clients assigned to this consultant
      const { data, error } = await supabase
        .from('documents')
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
        .in('client_id', await getAssignedClientIds())
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const fetchDocumentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_requests')
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
        .eq('consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentRequests(data || []);
    } catch (error) {
      console.error('Error fetching document requests:', error);
      setDocumentRequests([]);
    }
  };

  const fetchClients = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const getAssignedClientIds = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('assigned_consultant_id', profile?.id);

      if (error) throw error;
      return (data || []).map(client => client.id);
    } catch (error) {
      console.error('Error getting client IDs:', error);
      return [];
    }
  };

  const calculateStats = (documentsData: DocumentWithDetails[]) => {
    const stats: DocumentStats = {
      totalDocuments: documentsData.length,
      pendingReview: documentsData.filter(d => d.status === 'pending').length,
      approved: documentsData.filter(d => d.status === 'approved').length,
      rejected: documentsData.filter(d => d.status === 'rejected').length,
      needsRevision: documentsData.filter(d => d.status === 'needs_revision').length,
      documentRequests: documentRequests.length
    };
    setStats(stats);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('document_requests')
        .insert([{
          ...requestForm,
          consultant_id: profile?.id,
          due_date: requestForm.due_date ? new Date(requestForm.due_date).toISOString() : null
        }]);

      if (error) throw error;

      // Notify client
      await supabase
        .from('notifications')
        .insert([{
          user_id: requestForm.client_id,
          type: 'document_requested',
          title: 'Document Requested',
          message: `Your consultant has requested: ${requestForm.document_name}`,
          priority: requestForm.priority,
          related_table: 'document_requests',
          action_url: '/client/documents'
        }]);

      await fetchData();
      resetRequestForm();
      alert('Document request sent successfully!');
    } catch (error) {
      console.error('Error creating document request:', error);
      alert('Failed to create document request');
    }
  };

  const handleDocumentStatusUpdate = async (documentId: string, newStatus: 'approved' | 'rejected' | 'needs_revision', notes?: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id
        })
        .eq('id', documentId);

      if (error) throw error;

      // Get document and client info for notification
      const document = documents.find(d => d.id === documentId);
      if (document?.client?.profile?.id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: document.client.profile.id,
            type: `document_${newStatus}`,
            title: `Document ${newStatus.replace('_', ' ')}`,
            message: `Your document "${document.name}" has been ${newStatus.replace('_', ' ')}`,
            priority: newStatus === 'rejected' ? 'high' : 'normal',
            related_table: 'documents',
            related_id: documentId,
            action_url: '/client/documents'
          }]);
      }

      await fetchData();
      alert(`Document ${newStatus.replace('_', ' ')} successfully!`);
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status');
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Delete from storage if file_url exists
      if (document.file_url) {
        try {
          const url = new URL(document.file_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/');
          await deleteFileFromStorage(filePath, 'documents');
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError);
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

  const resetRequestForm = () => {
    setRequestForm({
      client_id: '',
      document_name: '',
      document_type: '',
      category: 'other',
      description: '',
      due_date: '',
      priority: 'medium'
    });
    setShowRequestModal(false);
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Convert documents to UploadedFile format for FileManager
  const uploadedFiles: UploadedFile[] = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    url: doc.file_url || '',
    size: doc.file_size || 0,
    type: doc.type || 'application/octet-stream',
    uploadedAt: doc.uploaded_at
  }));

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
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600 mt-1">Review client documents and manage document requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Request Document</span>
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
                <p className="text-sm font-medium text-gray-600">Requests Sent</p>
                <p className="text-3xl font-bold text-purple-600">{stats.documentRequests}</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Documents</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Document name, client..."
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
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {documentCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </div>

        {/* Document Requests */}
        {documentRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Send className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Sent Document Requests</h2>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                {documentRequests.length} active
              </span>
            </div>
            
            <div className="space-y-4">
              {documentRequests.map((request) => {
                const categoryInfo = getCategoryInfo(request.category);
                
                return (
                  <div key={request.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {request.description && (
                          <p className="text-gray-700 mb-3 bg-white rounded p-3 border border-purple-200">
                            <strong>Description:</strong> {request.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Client: {request.client?.company_name || request.client?.profile?.full_name}</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-600 mb-6">
              {documents.length === 0 
                ? 'No documents have been uploaded by your clients yet.'
                : 'No documents match your current filters.'
              }
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Request First Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`${getCategoryInfo(document.category).color} rounded-lg p-2`}>
                        <getCategoryInfo(document.category).icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                        <p className="text-sm text-gray-600">{document.type}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(document.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{document.client?.company_name || document.client?.profile?.full_name || 'Unknown Client'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      {document.file_size && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>Size: {(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      )}
                      {document.reviewed_at && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Reviewed: {new Date(document.reviewed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {document.file_url && (
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </a>
                    )}

                    {document.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleDocumentStatusUpdate(document.id, 'approved')}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDocumentStatusUpdate(document.id, 'rejected')}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleDocumentStatusUpdate(document.id, 'needs_revision')}
                          className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-100 transition-colors flex items-center space-x-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span>Revision</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowDocumentDetail(true);
                      }}
                      className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDocumentDelete(document.id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Request Document from Client</h2>
                <button
                  onClick={resetRequestForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  required
                  value={requestForm.client_id}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, client_id: e.target.value }))}
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
                    value={requestForm.document_name}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, document_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Passport Copy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    required
                    value={requestForm.document_type}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    value={requestForm.category}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {documentCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what document is needed and any specific requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={requestForm.due_date}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetRequestForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {showDocumentDetail && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Document Details - {selectedDocument.name}</h2>
                <button
                  onClick={() => setShowDocumentDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <p className="font-medium">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryInfo(selectedDocument.category).color}`}>
                        {getCategoryInfo(selectedDocument.category).label}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Client:</span>
                      <p className="font-medium">{selectedDocument.client?.company_name || selectedDocument.client?.profile?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedDocument.client?.profile?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Uploaded:</span>
                      <p className="font-medium">{new Date(selectedDocument.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    {selectedDocument.file_size && (
                      <div>
                        <span className="text-sm text-gray-600">File Size:</span>
                        <p className="font-medium">{(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Actions */}
              {selectedDocument.status === 'pending' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Review Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        handleDocumentStatusUpdate(selectedDocument.id, 'approved');
                        setShowDocumentDetail(false);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve Document</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDocumentStatusUpdate(selectedDocument.id, 'needs_revision');
                        setShowDocumentDetail(false);
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Request Revision</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDocumentStatusUpdate(selectedDocument.id, 'rejected');
                        setShowDocumentDetail(false);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject Document</span>
                    </button>
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

export default DocumentManagement;