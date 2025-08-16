import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import VirtualMailboxManager from '../../components/VirtualMailboxManager';
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
  Mail
} from 'lucide-react';

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
  notes?: string;
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
}

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

const DocumentManagement = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithDetails[]>([]);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithDetails | null>(null);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'requests' | 'mailbox'>('documents');

  const [requestForm, setRequestForm] = useState({
    client_id: '',
    document_name: '',
    document_type: '',
    category: 'other' as 'identity' | 'business' | 'financial' | 'medical' | 'other',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const documentCategories = [
    { value: 'identity', label: 'Identity Documents', icon: User, color: 'bg-blue-100 text-blue-800' },
    { value: 'business', label: 'Business Documents', icon: FileText, color: 'bg-green-100 text-green-800' },
    { value: 'financial', label: 'Financial Documents', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
    { value: 'medical', label: 'Medical Documents', icon: Shield, color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other Documents', icon: Paperclip, color: 'bg-gray-100 text-gray-800' }
  ];

  const documentTypes = [
    'Passport', 'National ID', 'Driver License', 'Birth Certificate',
    'Bank Statement', 'Tax Return', 'Proof of Address', 'Business License',
    'Company Registration', 'Tax Certificate', 'Other'
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
      .in('client_id', await getConsultantClientIds())
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    setDocuments(data || []);
  };

  const fetchDocumentRequests = async () => {
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

  const getConsultantClientIds = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('assigned_consultant_id', profile?.id);

    return (data || []).map(client => client.id);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
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

      await fetchDocumentRequests();
      resetForm();
      alert('Document request sent successfully!');
    } catch (error) {
      console.error('Error creating document request:', error);
      alert('Failed to send document request');
    }
  };

  const handleUpdateDocumentStatus = async (documentId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
          notes: notes
        })
        .eq('id', documentId);

      if (error) throw error;

      // Notify client about status change
      const document = documents.find(d => d.id === documentId);
      if (document?.client_id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: document.client_id,
            type: 'document_status',
            title: 'Document Status Updated',
            message: `Your document "${document.name}" has been ${newStatus}`,
            priority: newStatus === 'rejected' ? 'high' : 'normal',
            related_table: 'documents',
            related_id: documentId,
            action_url: '/client/documents'
          }]);
      }

      await fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const resetForm = () => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = 
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    const matchesClient = clientFilter === 'all' || document.client_id === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filteredRequests = documentRequests.filter(request => {
    const matchesSearch = 
      request.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesClient = clientFilter === 'all' || request.client_id === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const pendingDocuments = documents.filter(d => d.status === 'pending').length;
  const pendingRequests = documentRequests.filter(r => r.status === 'requested').length;
  const approvedDocuments = documents.filter(d => d.status === 'approved').length;
  const rejectedDocuments = documents.filter(d => d.status === 'rejected').length;

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
              <p className="text-gray-600 mt-1">Manage client documents and requests</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-blue-600">{pendingDocuments}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-purple-600">{pendingRequests}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedDocuments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedDocuments}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'documents', label: 'Client Documents', icon: FileText, count: documents.length },
                { key: 'requests', label: 'Document Requests', icon: Bell, count: documentRequests.length },
                { key: 'mailbox', label: 'Virtual Mailbox', icon: Mail, count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'mailbox' ? (
              <VirtualMailboxManager 
                viewMode="consultant" 
              />
            ) : (
              <>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Document name, type, client..."
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
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_revision">Needs Revision</option>
                      <option value="requested">Requested</option>
                    </select>
                  </div>

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

                  <div className="text-sm text-gray-600">
                    {activeTab === 'documents' 
                      ? `Showing ${filteredDocuments.length} of ${documents.length} documents`
                      : `Showing ${filteredRequests.length} of ${documentRequests.length} requests`
                    }
                  </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'documents' ? (
                  <div className="space-y-4">
                    {filteredDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
                        <p className="text-gray-600">No client documents match your current filters.</p>
                      </div>
                    ) : (
                      filteredDocuments.map((document) => {
                        const categoryInfo = getCategoryInfo(document.category);
                        
                        return (
                          <div key={document.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className={`${categoryInfo.color} rounded-lg p-3`}>
                                    <categoryInfo.icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                                    <p className="text-sm text-gray-600">{document.type}</p>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(document.status)}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                                      {document.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center space-x-1">
                                    <Building className="h-4 w-4" />
                                    <span>{document.client?.company_name || document.client?.profile?.full_name || 'Unknown Client'}</span>
                                  </div>
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
                                </div>

                                {document.notes && (
                                  <div className="bg-white rounded p-3 border border-gray-200 mb-3">
                                    <p className="text-sm text-gray-700"><strong>Notes:</strong> {document.notes}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {document.file_url && (
                                  <button
                                    onClick={() => window.open(document.file_url, '_blank')}
                                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>View</span>
                                  </button>
                                )}

                                {document.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateDocumentStatus(document.id, 'approved')}
                                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleUpdateDocumentStatus(document.id, 'rejected')}
                                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setShowDocumentDetail(true);
                                  }}
                                  className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Requests</h3>
                        <p className="text-gray-600 mb-6">Create your first document request to get started.</p>
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Create First Request
                        </button>
                      </div>
                    ) : (
                      filteredRequests.map((request) => {
                        const categoryInfo = getCategoryInfo(request.category);
                        
                        return (
                          <div key={request.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className={`${categoryInfo.color} rounded-lg p-3`}>
                                    <categoryInfo.icon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{request.document_name}</h3>
                                    <p className="text-sm text-gray-600">{request.document_type}</p>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(request.status)}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                      {request.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {request.description && (
                                  <p className="text-gray-700 mb-3 bg-white rounded p-3 border border-gray-200">
                                    <strong>Requirements:</strong> {request.description}
                                  </p>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Building className="h-4 w-4" />
                                    <span>{request.client?.company_name || request.client?.profile?.full_name || 'Unknown Client'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {request.due_date && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span className={new Date(request.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                                        Due: {new Date(request.due_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Priority: {request.priority.toUpperCase()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Request Document from Client</h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  required
                  value={requestForm.client_id}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
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
                    placeholder="e.g., Updated Passport Copy"
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
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
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
                  placeholder="Explain what document is needed and any specific requirements..."
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
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
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
              {/* Document Info */}
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
                      <p className="font-medium">{getCategoryInfo(selectedDocument.category).label}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status.toUpperCase()}
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
                      <p className="font-medium">{new Date(selectedDocument.uploaded_at).toLocaleString()}</p>
                    </div>
                    {selectedDocument.file_size && (
                      <div>
                        <span className="text-sm text-gray-600">File Size:</span>
                        <p className="font-medium">{formatFileSize(selectedDocument.file_size)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedDocument.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedDocument.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedDocument.file_url && (
                  <button
                    onClick={() => window.open(selectedDocument.file_url, '_blank')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View Document</span>
                  </button>
                )}
                
                {selectedDocument.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateDocumentStatus(selectedDocument.id, 'approved');
                        setShowDocumentDetail(false);
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleUpdateDocumentStatus(selectedDocument.id, 'rejected');
                        setShowDocumentDetail(false);
                      }}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;