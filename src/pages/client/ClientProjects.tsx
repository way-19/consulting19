import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project, Task } from '../../lib/supabase';
import { 
  ArrowLeft,
  Building, 
  Calendar, 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Phone,
  Mail,
  Globe,
  Award,
  Clock as ClockIcon,
  Download,
  Upload,
  Bell,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Star
} from 'lucide-react';

interface ProjectWithDetails extends Project {
  consultant?: {
    full_name: string;
    email: string;
  };
  tasks?: Task[];
  completed_tasks_count?: number;
  total_tasks_count?: number;
  time_logged?: number;
}

const ClientProjects = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'progress' | 'due_date'>('created_at');

  useEffect(() => {
    if (profile?.id) {
      fetchProjects();
    }
  }, [profile]);

  const fetchProjects = async () => {
    try {
      // First get client record
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!clientData) {
        setLoading(false);
        return;
      }

      // Get projects with consultant info
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          consultant:consultant_id (
            full_name,
            email
          )
        `)
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with task data
      const enrichedProjects = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', project.id);

          const { data: timeEntries } = await supabase
            .from('time_entries')
            .select('duration_minutes')
            .in('task_id', (tasks || []).map(t => t.id));

          const completedTasksCount = tasks?.filter(t => t.status === 'completed').length || 0;
          const totalTasksCount = tasks?.length || 0;
          const timeLogged = (timeEntries || []).reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;

          return {
            ...project,
            tasks: tasks || [],
            completed_tasks_count: completedTasksCount,
            total_tasks_count: totalTasksCount,
            time_logged: timeLogged
          } as ProjectWithDetails;
        })
      );

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length : 0;

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.consultant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'due_date':
        if (!a.end_date && !b.end_date) return 0;
        if (!a.end_date) return 1;
        if (!b.end_date) return -1;
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
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
          {/* Back Button */}
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
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Track your business projects and their progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchProjects}
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
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{activeProjects}</p>
                <p className="text-xs text-gray-500 mt-1">Currently in progress</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-3xl font-bold text-green-600">${totalBudget.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Project budgets</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-3xl font-bold text-purple-600">{avgProgress.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall completion</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Proje Ara</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Proje adı, açıklama, danışman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="planning">Planlama</option>
                <option value="active">Aktif</option>
                <option value="on_hold">Beklemede</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="created_at">Oluşturulma Tarihi</option>
                <option value="name">Proje Adı</option>
                <option value="progress">İlerleme</option>
                <option value="due_date">Bitiş Tarihi</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {projects.length} projeden {filteredProjects.length} tanesi gösteriliyor
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {projects.length === 0 ? 'Henüz Proje Yok' : 'Proje Bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'İş süreciniz ilerledikçe danışmanınız projeler oluşturacaktır.'
                : 'Mevcut filtrelerinizle eşleşen proje bulunamadı.'
              }
            </p>
            {projects.length === 0 && (
              <Link
                to="/services"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Hizmetleri İncele
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-gray-600 mb-4">{project.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{project.consultant?.full_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{project.completed_tasks_count || 0} / {project.total_tasks_count || 0} görev tamamlandı</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{(project.time_logged || 0).toFixed(1)}h kaydedildi</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Bütçe: ${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Proje İlerlemesi</span>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                        <div 
                          className={`h-4 rounded-full ${getProgressColor(project.progress)} transition-all duration-500 shadow-sm`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {project.progress === 100 ? 'Proje tamamlandı!' :
                         project.progress >= 75 ? 'Neredeyse bitti' :
                         project.progress >= 50 ? 'Yarı yolda' :
                         project.progress >= 25 ? 'İyi gidiyor' : 'Yeni başladı'}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      {project.start_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Başlangıç: {new Date(project.start_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={new Date(project.end_date) < new Date() && project.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                            Bitiş: {new Date(project.end_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Güncelleme: {new Date(project.updated_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {project.consultant && (
                      <button
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Mesaj Gönder</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDetail(true);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Detayları Görüntüle</span>
                    </button>
                  </div>
                </div>
                
                {/* Project Status Banner */}
                {project.status === 'on_hold' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800 font-medium">
                        Proje şu anda beklemede. Daha fazla bilgi için danışmanınızla iletişime geçin.
                      </span>
                    </div>
                  </div>
                )}
                
                {project.end_date && new Date(project.end_date) < new Date() && project.status !== 'completed' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800 font-medium">
                        Proje süresi geçti. Lütfen danışmanınızla iletişime geçin.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Proje Detayları - {selectedProject.name}</h2>
                <button
                  onClick={() => setShowProjectDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Proje Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Öncelik:</span>
                      <div className="inline-flex items-center space-x-2 ml-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedProject.priority)}`}></div>
                        <span className="font-medium">{selectedProject.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Danışman:</span>
                      <p className="font-medium">{selectedProject.consultant?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">E-posta:</span>
                      <p className="font-medium">{selectedProject.consultant?.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Oluşturulma:</span>
                      <p className="font-medium">{new Date(selectedProject.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">İlerleme ve Zaman Çizelgesi</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">İlerleme:</span>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{selectedProject.progress}%</span>
                          <span className="text-xs text-gray-500">
                            {selectedProject.progress === 100 ? 'Tamamlandı' :
                             selectedProject.progress >= 75 ? 'Neredeyse bitti' :
                             selectedProject.progress >= 50 ? 'Yarı yolda' :
                             selectedProject.progress >= 25 ? 'İyi gidiyor' : 'Yeni başladı'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div 
                            className={`h-3 rounded-full ${getProgressColor(selectedProject.progress)} shadow-sm transition-all duration-500`}
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Görevler:</span>
                      <p className="font-medium">{selectedProject.completed_tasks_count} / {selectedProject.total_tasks_count} tamamlandı</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Harcanan Zaman:</span>
                      <p className="font-medium">{(selectedProject.time_logged || 0).toFixed(1)} saat</p>
                    </div>
                    {selectedProject.budget && (
                      <div>
                        <span className="text-sm text-gray-600">Bütçe:</span>
                        <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedProject.estimated_hours && (
                      <div>
                        <span className="text-sm text-gray-600">Tahmini Süre:</span>
                        <p className="font-medium">{selectedProject.estimated_hours} saat</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultant Information */}
              {selectedProject.consultant && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Danışmanınız</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedProject.consultant.full_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{selectedProject.consultant.full_name}</h4>
                      <p className="text-gray-600">{selectedProject.consultant.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">4.9 Puan</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-600">Uzman Seviye</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Mesaj</span>
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Görüşme Planla</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Description */}
              {selectedProject.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedProject.description}</p>
                </div>
              )}

              {/* Tasks List */}
              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Proje Görevleri</h3>
                  <div className="space-y-3">
                    {selectedProject.tasks.map((task) => (
                      <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {task.due_date && (
                                <span>Son Tarih: {new Date(task.due_date).toLocaleDateString('tr-TR')}</span>
                              )}
                              <span>Saat: {task.actual_hours} / {task.estimated_hours || 0}</span>
                              <span>Oluşturulma: {new Date(task.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Zaman Çizelgesi</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Proje Oluşturuldu</p>
                      <p className="text-sm text-blue-700">{new Date(selectedProject.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                  
                  {selectedProject.start_date && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Proje Başladı</p>
                        <p className="text-sm text-green-700">{new Date(selectedProject.start_date).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProject.status === 'completed' && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Proje Tamamlandı</p>
                        <p className="text-sm text-purple-700">{new Date(selectedProject.updated_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProject.end_date && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">
                          {selectedProject.status === 'completed' ? 'Tamamlanma Tarihi' : 'Beklenen Tamamlanma'}
                        </p>
                        <p className="text-sm text-purple-700">{new Date(selectedProject.end_date).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Mevcut İşlemler</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Danışmanla İletişim</span>
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Belgeleri Görüntüle</span>
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Rapor İndir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProjects;