import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, getPublicImageUrl } from '../../lib/supabase';
import { 
  ArrowLeft,
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Paperclip,
  Search,
  Filter,
  RefreshCw,
  Plus,
  X,
  Save,
  File,
  Image,
  FileCheck,
  Shield,
  Archive,
  Camera,
  Folder
} from 'lucide-react';

interface ClientDocument {
  id: string;
  client_id: string;
  name: string;
  type: string;
  category: 'identity' | 'business' | 'financial' | 'medical' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  file_url?: string;
  file_size?: number;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  reviewer?: {
    full_name: string;
    email: string;
  };
}

interface DocumentStats {
  totalDocuments: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  needsRevision: number;
  totalSize: number;
}

const ClientDocuments = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<ClientDocument | null>(null);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    category: 'other' as 'identity' | 'business' | 'financial' | 'medical' | 'other',
    file: null as File | null
  });

  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    needsRevision: 0,
    totalSize: 0
  });

  const documentCategories = [
    { value: 'identity', label: 'Identity Documents', icon: User, color: 'bg-blue-100 text-blue-800', description: 'Passport, ID cards, driver license' },
    { value: 'business', label: 'Business Documents', icon: FileText, color: 'bg-green-100 text-green-800', description: 'Articles, certificates, licenses' },
    { value: 'financial', label: 'Financial Documents', icon: FileCheck, color: 'bg-purple-100 text-purple-800', description: 'Bank statements, tax records' },
    { value: 'medical', label: 'Medical Documents', icon: Shield, color: 'bg-red-100 text-red-800', description: 'Health certificates, medical reports' },
    { value: 'other', label: 'Other Documents', icon: Archive, color: 'bg-gray-100 text-gray-800', description: 'Miscellaneous documents' }
  ];

  const documentTypes = [
    'Passport',
    'National ID Card',
    'Driver License',
    'Birth Certificate',
    'Marriage Certificate',
    'Educational Certificate',
    'Bank Statement',
    'Tax Return',
    'Proof of Address',
    'Employment Letter',
    'Business License',
    'Articles of Incorporation',
    'Medical Certificate',
    'Insurance Document',
    'Other Document'
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchClientId();
    }
  }, [profile]);

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  const fetchClientId = async () => {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (clientData) {
        setClientId(clientData.id);
      }
    } catch (error) {
      console.error('Error fetching client ID:', error);
    }
  };

  const fetchDocuments = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          reviewer:reviewed_by (
            full_name,
            email
          )
        `)
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      const documentsData = data || [];
      setDocuments(documentsData);
      calculateStats(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (documentsData: ClientDocument[]) => {
    const stats: DocumentStats = {
      totalDocuments: documentsData.length,
      pendingReview: documentsData.filter(d => d.status === 'pending').length,
      approved: documentsData.filter(d => d.status === 'approved').length,
      rejected: documentsData.filter(d => d.status === 'rejected').length,
      needsRevision: documentsData.filter(d => d.status === 'needs_revision').length,
      totalSize: documentsData.reduce((sum, d) => sum + (d.file_size || 0), 0)
    };
    setStats(stats);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !clientId) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // In a real implementation, you would upload to Supabase Storage
      // For demo purposes, we'll simulate the upload
      const mockFileUrl = `https://example.com/documents/${uploadForm.file.name}`;

      const documentData = {
        client_id: clientId,
        name: uploadForm.name || uploadForm.file.name,
        type: uploadForm.type,
        category: uploadForm.category,
        status: 'pending' as const,
        file_url: mockFileUrl,
        file_size: uploadForm.file.size,
        uploaded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('documents')
        .insert([documentData]);

      if (error) throw error;

      await fetchDocuments();
      resetUploadForm();
      alert('Document uploaded successfully! Your consultant will review it shortly.');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      await fetchDocuments();
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      type: '',
      category: 'other',
      file: null
    });
    setShowUploadModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_revision': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <File className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = 
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
              to="/client-dashboard"
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
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={fetchDocuments}
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
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-purple-600">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Archive className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Upload Guidelines */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Document Upload Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Accepted Formats:</h4>
                  <ul className="space-y-1">
                    <li>• PDF documents (.pdf)</li>
                    <li>• Images (.jpg, .jpeg, .png)</li>
                    <li>• Word documents (.doc, .docx)</li>
                    <li>• Excel files (.xls, .xlsx)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    <li>• Maximum file size: 50MB</li>
                    <li>• Clear, readable documents</li>
                    <li>• Original or certified copies</li>
                    <li>• English translation if needed</li>
                  </ul>
                </div>
              </div>
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
                  placeholder="Document name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
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

            <div className="text-sm text-gray-600">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'No Documents Uploaded' : 'No Documents Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {documents.length === 0 
                ? 'Upload your first document to get started with the verification process.'
                : 'No documents match your current filters.'
              }
            </p>
            {documents.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => {
              const categoryInfo = getCategoryInfo(document.category);
              
              return (
                <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`${categoryInfo.color} rounded-lg p-2`}>
                          {getFileIcon(document.name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                          <p className="text-sm text-gray-600">{document.type}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(document.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status === 'pending' ? 'PENDING REVIEW' :
                             document.status === 'approved' ? 'APPROVED' :
                             document.status === 'rejected' ? 'REJECTED' :
                             document.status === 'needs_revision' ? 'NEEDS REVISION' :
                             document.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Paperclip className="h-4 w-4" />
                          <span>Size: {document.file_size ? formatFileSize(document.file_size) : 'Unknown'}</span>
                        </div>
                        {document.reviewed_at && (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4" />
                            <span>Reviewed: {new Date(document.reviewed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {document.reviewer && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>By: {document.reviewer.full_name}</span>
                          </div>
                        )}
                      </div>

                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </div>

                      {/* Review Notes */}
                      {document.notes && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          document.status === 'rejected' ? 'bg-red-50 border-red-200' :
                          document.status === 'needs_revision' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}>
                          <h4 className={`font-medium text-sm mb-1 ${
                            document.status === 'rejected' ? 'text-red-900' :
                            document.status === 'needs_revision' ? 'text-yellow-900' :
                            'text-green-900'
                          }`}>
                            Consultant Notes:
                          </h4>
                          <p className={`text-sm ${
                            document.status === 'rejected' ? 'text-red-800' :
                            document.status === 'needs_revision' ? 'text-yellow-800' :
                            'text-green-800'
                          }`}>
                            {document.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowDocumentDetail(true);
                        }}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>

                      {document.file_url && (
                        <button
                          onClick={() => window.open(document.file_url, '_blank')}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}

                      {document.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload New Document</h2>
                <button
                  onClick={resetUploadForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (50MB limit)
                        if (file.size > 50 * 1024 * 1024) {
                          console.log('ClientDocuments: File size exceeds 50MB limit. Rejecting upload.');
                          alert('File size must be less than 50MB. Please compress your file and try again.');
                          e.target.value = '';
                          return;
                        }
                        console.log('ClientDocuments: File passed size check, setting upload form...');
                        setUploadForm(prev => ({ 
                          ...prev, 
                          file,
                          name: prev.name || file.name.split('.')[0]
                        }));
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {uploadForm.file ? uploadForm.file.name : 'Choose a file to upload'}
                    </p>
                    <p className="text-sm text-gray-600">
                      PDF, DOC, DOCX, JPG, PNG, XLS, XLSX up to 50MB
                    </p>
                  </label>
                </div>
                {uploadForm.file && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(uploadForm.file.name)}
                      <div>
                        <p className="font-medium text-green-900">{uploadForm.file.name}</p>
                        <p className="text-sm text-green-700">Size: {formatFileSize(uploadForm.file.size)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select document type...</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Document Category *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documentCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, category: category.value }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        uploadForm.category === category.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <category.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Notice */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Important Notice</h4>
                </div>
                <p className="text-sm text-yellow-800">
                  Your consultant will review all uploaded documents. You'll receive notifications 
                  about the review status. Please ensure documents are clear and readable.
                </p>
              </div>

              {/* Actions */}
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
                  disabled={uploading || !uploadForm.file}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Upload Document</span>
                    </>
                  )}
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
                <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
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
                      <span className="text-sm text-gray-600">Document Name:</span>
                      <p className="font-medium">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Document Type:</span>
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
                        {selectedDocument.status === 'pending' ? 'PENDING REVIEW' :
                         selectedDocument.status === 'approved' ? 'APPROVED' :
                         selectedDocument.status === 'rejected' ? 'REJECTED' :
                         selectedDocument.status === 'needs_revision' ? 'NEEDS REVISION' :
                         selectedDocument.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">File Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">File Size:</span>
                      <p className="font-medium">{selectedDocument.file_size ? formatFileSize(selectedDocument.file_size) : 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Upload Date:</span>
                      <p className="font-medium">{new Date(selectedDocument.uploaded_at).toLocaleString()}</p>
                    </div>
                    {selectedDocument.reviewed_at && (
                      <div>
                        <span className="text-sm text-gray-600">Review Date:</span>
                        <p className="font-medium">{new Date(selectedDocument.reviewed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedDocument.reviewer && (
                      <div>
                        <span className="text-sm text-gray-600">Reviewed By:</span>
                        <p className="font-medium">{selectedDocument.reviewer.full_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              {selectedDocument.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                  <div className={`p-4 rounded-lg border ${
                    selectedDocument.status === 'rejected' ? 'bg-red-50 border-red-200' :
                    selectedDocument.status === 'needs_revision' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <p className={`${
                      selectedDocument.status === 'rejected' ? 'text-red-800' :
                      selectedDocument.status === 'needs_revision' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {selectedDocument.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Document Uploaded</p>
                      <p className="text-sm text-blue-700">{new Date(selectedDocument.uploaded_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedDocument.reviewed_at && (
                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                      selectedDocument.status === 'approved' ? 'bg-green-50' :
                      selectedDocument.status === 'rejected' ? 'bg-red-50' :
                      'bg-yellow-50'
                    }`}>
                      {selectedDocument.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : selectedDocument.status === 'rejected' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          selectedDocument.status === 'approved' ? 'text-green-900' :
                          selectedDocument.status === 'rejected' ? 'text-red-900' :
                          'text-yellow-900'
                        }`}>
                          Document {selectedDocument.status === 'approved' ? 'Approved' :
                                   selectedDocument.status === 'rejected' ? 'Rejected' :
                                   'Needs Revision'}
                        </p>
                        <p className={`text-sm ${
                          selectedDocument.status === 'approved' ? 'text-green-700' :
                          selectedDocument.status === 'rejected' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {new Date(selectedDocument.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedDocument.file_url && (
                  <button
                    onClick={() => window.open(selectedDocument.file_url, '_blank')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download File</span>
                  </button>
                )}

                {selectedDocument.status === 'needs_revision' && (
                  <button
                    onClick={() => {
                      setShowDocumentDetail(false);
                      setShowUploadModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Upload Revised Version</span>
                  </button>
                )}

                {selectedDocument.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDocumentDetail(false);
                      handleDeleteDocument(selectedDocument.id);
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Document</span>
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

export default ClientDocuments