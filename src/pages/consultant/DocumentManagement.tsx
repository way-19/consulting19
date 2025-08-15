import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Save,
  X,
  Paperclip,
  Shield,
  Archive,
  Star,
  MessageSquare,
  Send,
  Bell
} from 'lucide-react';

interface DocumentWithDetails {
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
  totalSize: number;
}

const DocumentManagement = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithDetails[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithDetails | null>(null);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    client_id: '',
    name: '',
    type: '',
    category: 'other' as 'identity' | 'business' | 'financial' | 'medical' | 'other',
    description: '',
    due_date: ''
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
    { value: 'identity', label: 'Identity Documents', icon: User, color: 'bg-blue-100 text-blue-800' },
    { value: 'business', label: 'Business Documents', icon: FileText, color: 'bg-green-100 text-green-800' },
    { value: 'financial', label: 'Financial Documents', icon: Calculator, color: 'bg-purple-100 text-purple-800' },
    { value: 'medical', label: 'Medical Documents', icon: Shield, color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other Documents', icon: Archive, color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchData();
      createDemoDocumentRequests();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchClients()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoDocumentRequests = async () => {
    try {
      // Get client record first
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('assigned_consultant_id', profile?.id)
        .limit(1);

      if (!clientData || clientData.length === 0) return;

      const clientId = clientData[0].id;

      // Check if demo requests already exist
      const { data: existingRequests } = await supabase
        .from('documents')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_request', true)
        .eq('status', 'requested');

      if (existingRequests && existingRequests.length > 0) return;

      // Create demo document requests
      const demoRequests = [
        {
          client_id: clientId,
          name: 'Ağustos 2025 Banka Dökümü',
          type: 'Bank Statement',
          category: 'financial',
          status: 'requested',
          is_request: true,
          requested_by_consultant_id: profile?.id,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          notes: 'Lütfen Ağustos 2025 dönemi için tüm banka hesaplarınızın dökümünü PDF formatında yükleyin. Elektronik imzalı olması tercih edilir.',
          uploaded_at: new Date().toISOString()
        },
        {
          client_id: clientId,
          name: 'Şirket Gider Faturaları - Ağustos',
          type: 'Invoice',
          category: 'business',
          status: 'requested',
          is_request: true,
          requested_by_consultant_id: profile?.id,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          notes: 'Ağustos ayında şirket adına yapılan tüm harcamaların faturalarını yükleyin. Ofis kirası, elektrik, internet, malzeme alımları vb.',
          uploaded_at: new Date().toISOString()
        },
        {
          client_id: clientId,
          name: 'Çalışan Bordro Bilgileri',
          type: 'Payroll Document',
          category: 'business',
          status: 'requested',
          is_request: true,
          requested_by_consultant_id: profile?.id,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          notes: 'Ağustos ayı çalışan maaş bordroları ve SGK bildirgeleri. Tüm çalışanlar için eksiksiz olmalı.',
          uploaded_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('documents')
        .insert(demoRequests);

      if (error) {
        console.error('Error creating demo requests:', error);
      } else {
        console.log('✅ Demo document requests created successfully');
        
        // Create notifications for client
        for (const request of demoRequests) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: clientData[0].profile_id, // This should be the client's profile_id
              type: 'document_requested',
              title: 'Yeni Belge Talebi',
              message: `Danışmanınız "${request.name}" belgesini talep etti`,
              priority: 'normal',
              related_table: 'documents',
              action_url: '/client/documents'
            }]);
        }
      }
    } catch (error) {
      console.error('Error in createDemoDocumentRequests:', error);
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
      .in('client_id', 
        // Get client IDs assigned to this consultant
        await supabase
          .from('clients')
          .select('id')
          .eq('assigned_consultant_id', profile?.id)
          .then(({ data }) => data?.map(c => c.id) || [])
      )
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    
    const documentsData = data || [];
    setDocuments(documentsData);
    calculateStats(documentsData);
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

  const calculateStats = (documentsData: DocumentWithDetails[]) => {
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

  const handleReviewDocument = async () => {
    if (!selectedDocument) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: reviewDecision,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes
        })
        .eq('id', selectedDocument.id);

      if (error) throw error;

      // Send notification to client (in real implementation)
      console.log(`Belge ${reviewDecision} edildi:`, selectedDocument.name);

      await fetchDocuments();
      setShowReviewModal(false);
      setReviewNotes('');
      setSelectedDocument(null);
      
      alert(`Belge başarıyla ${
        reviewDecision === 'approved' ? 'onaylandı' :
        reviewDecision === 'rejected' ? 'reddedildi' :
        'revizyon için işaretlendi'
      }!`);
    } catch (error) {
      console.error('Error reviewing document:', error);
      alert('Belge incelemesi kaydedilemedi');
    }
  };

  const handleQuickReview = async (documentId: string, decision: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          status: decision,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
      await fetchDocuments();
    } catch (error) {
      console.error('Error in quick review:', error);
    }
  };

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('documents')
        .insert([{
          client_id: requestForm.client_id,
          name: requestForm.name,
          type: requestForm.type,
          category: requestForm.category,
          status: 'requested',
          is_request: true,
          requested_by_consultant_id: profile?.id,
          due_date: requestForm.due_date ? new Date(requestForm.due_date).toISOString() : null,
          notes: requestForm.description
        }]);

      if (error) throw error;

      // Send notification to client
      const { data: clientProfile } = await supabase
        .from('clients')
        .select('profile_id')
        .eq('id', requestForm.client_id)
        .single();

      if (clientProfile) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: clientProfile.profile_id,
            type: 'document_requested',
            title: 'Document Requested',
            message: `Your consultant has requested: ${requestForm.name}`,
            priority: 'normal',
            related_table: 'documents',
            action_url: '/client/documents'
          }]);
      }

      await fetchDocuments();
      resetRequestForm();
      alert('Document request sent to client successfully!');
    } catch (error) {
      console.error('Error requesting document:', error);
      alert('Failed to send document request');
    }
  };

  const resetRequestForm = () => {
    setRequestForm({
      client_id: '',
      name: '',
      type: '',
      category: 'other',
      description: '',
      due_date: ''
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
    
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    const matchesClient = clientFilter === 'all' || document.client_id === clientFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesClient;
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
              to="/consultant-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Belge Yönetimi</h1>
              <p className="text-gray-600 mt-1">Müşteri belgelerini inceleyin, onaylayın ve yönetin</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Yenile</span>
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Request Document</span>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Belge Ara</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Belge adı, türü, müşteri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tüm Kategoriler</option>
                {documentCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">İnceleme Bekleyen</option>
                <option value="approved">Onaylanan</option>
                <option value="rejected">Reddedilen</option>
                <option value="needs_revision">Revizyon Gerekli</option>
                <option value="requested">Talep Edilen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Müşteri</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tüm Müşteriler</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.company_name || client.profile?.full_name || client.profile?.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {documents.length} belgeden {filteredDocuments.length} tanesi gösteriliyor
            </div>
          </div>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belge Bulunamadı</h3>
            <p className="text-gray-600">
              {documents.length === 0 
                ? 'Müşterileriniz henüz belge yüklememiş.'
                : 'Mevcut filtrelerinizle eşleşen belge bulunamadı.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => {
              const categoryInfo = getCategoryInfo(document.category);
              
              return (
                <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`${categoryInfo.color} rounded-lg p-3 shadow-sm`}>
                          <categoryInfo.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                          <p className="text-sm text-gray-600">{document.type}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(document.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(document.status)}`}>
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
                          <User className="h-4 w-4" />
                          <span>{document.client?.company_name || document.client?.profile?.full_name || 'Bilinmeyen Müşteri'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Yüklendi: {new Date(document.uploaded_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Paperclip className="h-4 w-4" />
                          <span>Boyut: {document.file_size ? formatFileSize(document.file_size) : 'Bilinmiyor'}</span>
                        </div>
                        {document.reviewed_at && (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-4 w-4" />
                            <span>İncelendi: {new Date(document.reviewed_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                      </div>

                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium shadow-sm ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {document.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuickReview(document.id, 'approved')}
                            className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Onayla</span>
                          </button>
                          <button
                            onClick={() => handleQuickReview(document.id, 'rejected')}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reddet</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowReviewModal(true);
                            }}
                            className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <span>Detaylı İnceleme</span>
                          </button>
                        </>
                      )}

                      {document.status === 'requested' && (
                        <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                          <Bell className="h-4 w-4" />
                          <span>Müşteriden Bekleniyor</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowDocumentDetail(true);
                        }}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Görüntüle</span>
                      </button>

                      {document.file_url && (
                        <button
                          onClick={() => window.open(document.file_url, '_blank')}
                          className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-sm"
                        >
                          <Download className="h-4 w-4" />
                          <span>İndir</span>
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

      {/* Document Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Müşteriden Belge Talep Et</h2>
                <button
                  onClick={resetRequestForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestDocument} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müşteri Seç *
                </label>
                <select
                  required
                  value={requestForm.client_id}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Müşteri seçin...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.profile?.full_name || client.profile?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Belge Adı *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.name}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Örn: Ağustos 2025 Banka Dökümü"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Belge Türü *
                  </label>
                  <select
                    required
                    value={requestForm.type}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Belge türünü seçin...</option>
                    <option value="Bank Statement">Banka Ekstresi</option>
                    <option value="Invoice">Fatura</option>
                    <option value="Receipt">Makbuz</option>
                    <option value="Tax Return">Vergi Beyannamesi</option>
                    <option value="Financial Statement">Mali Tablo</option>
                    <option value="Passport">Pasaport</option>
                    <option value="National ID">Kimlik Kartı</option>
                    <option value="Proof of Address">İkametgah Belgesi</option>
                    <option value="Business License">İş Lisansı</option>
                    <option value="Other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    required
                    value={requestForm.category}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="identity">Kimlik Belgeleri</option>
                    <option value="business">İş Belgeleri</option>
                    <option value="financial">Mali Belgeler</option>
                    <option value="medical">Sağlık Belgeleri</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Son Tarih
                </label>
                <input
                  type="date"
                  value={requestForm.due_date}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama ve Gereksinimler *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Bu belge neden gerekli? Özel gereksinimler var mı? Elektronik imza gerekli mi?"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Elektronik İmza Rehberi</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Elektronik imza gerektiren belgeler için müşterinize dijital olarak imzalanmış PDF dosyaları yüklemesini söyleyin. 
                  E-imzanın bulunduğu ülkede yasal olarak geçerli olduğundan emin olun.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetRequestForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Belge Talep Et</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {showDocumentDetail && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Belge Detayları</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Belge Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Belge Adı:</span>
                      <p className="font-medium">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Belge Türü:</span>
                      <p className="font-medium">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Kategori:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getCategoryInfo(selectedDocument.category).color}`}>
                        {getCategoryInfo(selectedDocument.category).label}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status === 'pending' ? 'PENDING REVIEW' :
                         selectedDocument.status === 'approved' ? 'APPROVED' :
                         selectedDocument.status === 'rejected' ? 'REJECTED' :
                         selectedDocument.status === 'needs_revision' ? 'NEEDS REVISION' :
                         selectedDocument.status === 'requested' ? 'REQUESTED' :
                         selectedDocument.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Şirket:</span>
                      <p className="font-medium">{selectedDocument.client?.company_name || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">İletişim:</span>
                      <p className="font-medium">{selectedDocument.client?.profile?.full_name || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedDocument.client?.profile?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosya Bilgileri</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Dosya Boyutu:</span>
                      <p className="font-medium">{selectedDocument.file_size ? formatFileSize(selectedDocument.file_size) : 'Bilinmiyor'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Yükleme Tarihi:</span>
                      <p className="font-medium">{new Date(selectedDocument.uploaded_at).toLocaleString('tr-TR')}</p>
                    </div>
                    {selectedDocument.reviewed_at && (
                      <div>
                        <span className="text-sm text-gray-600">İnceleme Tarihi:</span>
                        <p className="font-medium">{new Date(selectedDocument.reviewed_at).toLocaleString('tr-TR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedDocument.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDocumentDetail(false);
                      setShowReviewModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Detaylı İnceleme</span>
                  </button>
                )}

                {selectedDocument.file_url && (
                  <button
                    onClick={() => window.open(selectedDocument.file_url, '_blank')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    <span>Dosyayı İndir</span>
                  </button>
                )}

                <button
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Müşteriyle İletişim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Belge İncelemesi</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedDocument.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Türü:</span> {selectedDocument.type}
                  </div>
                  <div>
                    <span className="font-medium">Kategorisi:</span> {getCategoryInfo(selectedDocument.category).label}
                  </div>
                  <div>
                    <span className="font-medium">Müşteri:</span> {selectedDocument.client?.company_name || selectedDocument.client?.profile?.full_name}
                  </div>
                  <div>
                    <span className="font-medium">Boyut:</span> {selectedDocument.file_size ? formatFileSize(selectedDocument.file_size) : 'Bilinmiyor'}
                  </div>
                </div>
              </div>

              {/* Review Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  İnceleme Kararı
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setReviewDecision('approved')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      reviewDecision === 'approved' 
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105' 
                        : 'border-gray-200 hover:border-green-300 hover:transform hover:scale-102'
                    }`}
                  >
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Onayla</div>
                  </button>
                  
                  <button
                    onClick={() => setReviewDecision('needs_revision')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      reviewDecision === 'needs_revision' 
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-md transform scale-105' 
                        : 'border-gray-200 hover:border-yellow-300 hover:transform hover:scale-102'
                    }`}
                  >
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Revizyon İste</div>
                  </button>
                  
                  <button
                    onClick={() => setReviewDecision('rejected')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      reviewDecision === 'rejected' 
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-md transform scale-105' 
                        : 'border-gray-200 hover:border-red-300 hover:transform hover:scale-102'
                    }`}
                  >
                    <XCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Reddet</div>
                  </button>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İnceleme Notları {reviewDecision !== 'approved' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={
                    reviewDecision === 'approved' ? 'Belge onaylandı. İsteğe bağlı notlar ekleyebilirsiniz...' :
                    reviewDecision === 'rejected' ? 'Belgenin neden reddedildiğini açıklayın...' :
                    'Hangi revizyonların yapılması gerektiğini belirtin...'
                  }
                  required={reviewDecision !== 'approved'}
                />
              </div>

              {/* Warning for rejection/revision */}
              {reviewDecision !== 'approved' && (
                <div className={`rounded-lg p-4 border ${
                  reviewDecision === 'rejected' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {reviewDecision === 'rejected' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    <h4 className={`font-medium ${
                      reviewDecision === 'rejected' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {reviewDecision === 'rejected' ? 'Belge Reddi' : 'Revizyon Talebi'}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    reviewDecision === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {reviewDecision === 'rejected' 
                      ? 'Bu belge reddedilecek ve müşteri bilgilendirilecektir. Lütfen red nedenini açıklayın.'
                      : 'Müşteriden belgeyi revize etmesi istenecektir. Lütfen gerekli değişiklikleri belirtin.'
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleReviewDocument}
                  disabled={reviewDecision !== 'approved' && !reviewNotes.trim()}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    reviewDecision === 'approved' ? 'bg-green-600 text-white hover:bg-green-700' :
                    reviewDecision === 'rejected' ? 'bg-red-600 text-white hover:bg-red-700' :
                    'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  <Save className="h-5 w-5" />
                  <span>
                    {reviewDecision === 'approved' ? 'Onayla' :
                     reviewDecision === 'rejected' ? 'Reddet' :
                     'Revizyon İste'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;