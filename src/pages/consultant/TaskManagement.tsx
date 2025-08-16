import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import useAdvancedSearch from '../../hooks/useAdvancedSearch';
import { 
  ArrowLeft, 
  CheckCircle, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building,
  RefreshCw,
  Save,
  X,
  Play,
  Pause,
  Square,
  Timer,
  Target,
  FileText,
  MessageSquare,
  Bell,
  TrendingUp
} from 'lucide-react';

interface TaskWithDetails {
  id: string;
  client_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
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

interface TimeEntry {
  id: string;
  task_id: string;
  duration_minutes: number;
  description: string;
  date: string;
  billable: boolean;
}

const TaskManagement = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    client_id: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'overdue',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    estimated_hours: 0
  });

  // Advanced search configuration
  const searchConfig = {
    searchFields: ['title', 'description'] as (keyof TaskWithDetails)[],
    filterFields: [
      {
        key: 'status' as keyof TaskWithDetails,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'overdue', label: 'Overdue' }
        ]
      },
      {
        key: 'priority' as keyof TaskWithDetails,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Priority' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' }
        ]
      }
    ],
    sortFields: [
      { key: 'created_at' as keyof TaskWithDetails, label: 'Date Created', defaultOrder: 'desc' as const },
      { key: 'due_date' as keyof TaskWithDetails, label: 'Due Date', defaultOrder: 'asc' as const },
      { key: 'priority' as keyof TaskWithDetails, label: 'Priority', defaultOrder: 'desc' as const },
      { key: 'title' as keyof TaskWithDetails, label: 'Task Title', defaultOrder: 'asc' as const }
    ]
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData: filteredTasks,
    totalCount,
    filteredCount
  } = useAdvancedSearch({
    data: tasks,
    config: searchConfig,
    initialSortBy: 'created_at',
    initialFilters: { status: 'all', priority: 'all' }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timerStart) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - timerStart.getTime()) / 1000);
        setTimerDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerStart]);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchClients()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
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
    setTasks(data || []);
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

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskData = {
        ...taskForm,
        consultant_id: profile?.id,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
        estimated_hours: taskForm.estimated_hours || null
      };

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);
        
        if (error) throw error;
      }

      await fetchTasks();
      resetForm();
      alert('Görev başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Görev kaydedilemedi: ' + (error as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
      alert('Görev başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Görev silinemedi');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'overdue') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const startTimer = (taskId: string) => {
    setActiveTimer(taskId);
    setTimerStart(new Date());
    setTimerDuration(0);
  };

  const stopTimer = async (taskId: string) => {
    if (!timerStart) return;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - timerStart.getTime()) / 60000);

    try {
      // Update task actual hours
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newActualHours = task.actual_hours + (durationMinutes / 60);
        await supabase
          .from('tasks')
          .update({ actual_hours: newActualHours })
          .eq('id', taskId);
      }

      setActiveTimer(null);
      setTimerStart(null);
      setTimerDuration(0);
      await fetchTasks();
      alert(`Zaman kaydedildi: ${Math.floor(durationMinutes / 60)}s ${durationMinutes % 60}d`);
    } catch (error) {
      console.error('Error logging time:', error);
      alert('Zaman kaydedilemedi');
    }
  };

  const handleEdit = (task: TaskWithDetails) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      client_id: task.client_id,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      estimated_hours: task.estimated_hours || 0
    });
    setShowTaskModal(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      client_id: '',
      status: 'pending',
      priority: 'medium',
      due_date: '',
      estimated_hours: 0
    });
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.due_date && new Date(t.due_date) < new Date())).length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalHours = tasks.reduce((sum, t) => sum + t.actual_hours, 0);
  const estimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

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
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600 mt-1">Manage client tasks, track time and monitor progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Task</span>
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
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geciken</p>
                <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Saat</p>
                <p className="text-3xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
              </div>
              <Timer className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verimlilik</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {estimatedHours > 0 ? Math.round((totalHours / estimatedHours) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Active Timer Display */}
        {activeTimer && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Timer className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Aktif Zaman Takibi</h3>
                  <p className="text-blue-700">
                    {tasks.find(t => t.id === activeTimer)?.title || 'Bilinmeyen Görev'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600 font-mono">
                  {formatTime(timerDuration)}
                </div>
                <button
                  onClick={() => stopTimer(activeTimer)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Square className="h-5 w-5" />
                  <span>Durdur</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Görev başlığı, açıklama veya müşteri ara..."
          filters={[
            {
              key: 'status',
              label: 'Durum',
              value: filters.status || 'all',
              options: searchConfig.filterFields[0].options!,
              onChange: (value) => setFilter('status', value),
              icon: CheckCircle
            },
            {
              key: 'priority',
              label: 'Öncelik',
              value: filters.priority || 'all',
              options: searchConfig.filterFields[1].options!,
              onChange: (value) => setFilter('priority', value),
              icon: AlertTriangle
            }
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortOptions={searchConfig.sortFields.map(field => ({
            value: field.key as string,
            label: field.label
          }))}
          onSortChange={setSortBy}
          onSortOrderChange={setSortOrder}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onClearFilters={clearFilters}
          className="mb-8"
        />

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Görev Bulunamadı</h3>
            <p className="text-gray-600 mb-6">Başlamak için ilk görevinizi oluşturun.</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              İlk Görevi Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(task.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'pending' ? 'BEKLEYEN' :
                           task.status === 'in_progress' ? 'DEVAM EDEN' :
                           task.status === 'completed' ? 'TAMAMLANAN' :
                           task.status === 'overdue' ? 'GECİKEN' : task.status.toUpperCase()}
                        </span>
                      </div>
                      {activeTimer === task.id && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>ZAMİR ÇALIŞIYOR</span>
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{task.client?.company_name || task.client?.profile?.full_name || 'Unknown Client'}</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                            Son Tarih: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Harcanan: {task.actual_hours.toFixed(1)}h / Tahmini: {task.estimated_hours || 0}h
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>Öncelik: {
                          task.priority === 'urgent' ? 'Urgent' :
                          task.priority === 'high' ? 'High' :
                          task.priority === 'medium' ? 'Medium' : 'Low'
                        }</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {task.estimated_hours && task.estimated_hours > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">İlerleme</span>
                          <span className="text-sm text-gray-600">
                            {Math.min(100, Math.round((task.actual_hours / task.estimated_hours) * 100))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div 
                            className={`h-2 rounded-full ${
                              task.actual_hours >= task.estimated_hours ? 'bg-red-500 shadow-sm' :
                              task.actual_hours >= task.estimated_hours * 0.8 ? 'bg-yellow-500 shadow-sm' :
                              'bg-blue-500 shadow-sm'
                            } transition-all duration-500`}
                            style={{ width: `${Math.min(100, (task.actual_hours / task.estimated_hours) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {task.actual_hours >= task.estimated_hours ? 'Tahmini süre aşıldı' :
                           task.actual_hours >= task.estimated_hours * 0.8 ? 'Neredeyse tamamlandı' :
                           task.actual_hours >= task.estimated_hours * 0.5 ? 'Yarı yolda' : 'İyi gidiyor'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Time Tracking */}
                    {activeTimer === task.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-mono text-sm">
                          {formatTime(timerDuration)}
                        </div>
                        <button
                          onClick={() => stopTimer(task.id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                        >
                          <Square className="h-4 w-4" />
                          <span>Durdur</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startTimer(task.id)}
                        disabled={!!activeTimer}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="h-4 w-4" />
                        <span>Başlat</span>
                      </button>
                    )}

                    {/* Status Update */}
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="pending">Beklemede</option>
                      <option value="in_progress">Devam Ediyor</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="overdue">Gecikti</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetail(true);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
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

      {/* Task Form Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTask} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görev Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Örn: Müşteri belgelerini incele"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detaylı görev açıklaması..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müşteri *
                  </label>
                  <select
                    required
                    value={taskForm.client_id}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, client_id: e.target.value }))}
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
                    Durum
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="overdue">Gecikti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Son Tarih
                  </label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahmini Saat
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskForm.estimated_hours}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Bu görevin tamamlanması için tahmini süre</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingTask ? 'Güncelle' : 'Oluştur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Görev Detayları</h2>
                <button
                  onClick={() => setShowTaskDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Başlık:</span>
                      <p className="font-medium">{selectedTask.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Durum:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status === 'pending' ? 'PENDING' :
                         selectedTask.status === 'in_progress' ? 'IN PROGRESS' :
                         selectedTask.status === 'completed' ? 'COMPLETED' :
                         selectedTask.status === 'overdue' ? 'OVERDUE' : selectedTask.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Öncelik:</span>
                      <div className="inline-flex items-center space-x-2 ml-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                        <span className="font-medium">
                          {selectedTask.priority === 'urgent' ? 'Urgent' :
                           selectedTask.priority === 'high' ? 'High' :
                           selectedTask.priority === 'medium' ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Müşteri:</span>
                      <p className="font-medium">{selectedTask.client?.company_name || selectedTask.client?.profile?.full_name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Zaman Takibi</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Tahmini Süre:</span>
                      <p className="font-medium">{selectedTask.estimated_hours || 0} saat</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Harcanan Zaman:</span>
                      <p className="font-medium">{selectedTask.actual_hours.toFixed(1)} saat</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Verimlilik:</span>
                      <p className="font-medium">
                        {selectedTask.estimated_hours && selectedTask.estimated_hours > 0 
                          ? `${Math.round((selectedTask.actual_hours / selectedTask.estimated_hours) * 100)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    {selectedTask.due_date && (
                      <div>
                        <span className="text-sm text-gray-600">Son Tarih:</span>
                        <p className={`font-medium ${new Date(selectedTask.due_date) < new Date() ? 'text-red-600' : ''}`}>
                          {new Date(selectedTask.due_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedTask.description}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Zaman Çizelgesi</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Görev Oluşturuldu</p>
                      <p className="text-sm text-blue-700">{new Date(selectedTask.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                  
                  {selectedTask.status !== 'pending' && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Görev Başladı</p>
                        <p className="text-sm text-green-700">{new Date(selectedTask.updated_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedTask.status === 'completed' && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Görev Tamamlandı</p>
                        <p className="text-sm text-purple-700">{new Date(selectedTask.updated_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTaskDetail(false);
                    handleEdit(selectedTask);
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Düzenle</span>
                </button>
                
                {selectedTask.status !== 'completed' && (
                  <button
                    onClick={() => {
                      handleUpdateTaskStatus(selectedTask.id, 'completed');
                      setShowTaskDetail(false);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Tamamla</span>
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

export default TaskManagement;