import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Task, Project } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
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
  Square
} from 'lucide-react';

interface TaskWithDetails extends Task {
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
  project?: {
    name: string;
  };
  assigned_user?: {
    full_name: string;
    email: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project_id: '',
    client_id: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: '',
    estimated_hours: 0,
    assigned_to: ''
  });

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
        fetchProjects(),
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
        ),
        project:project_id (
          name
        ),
        assigned_user:assigned_to (
          full_name,
          email
        )
      `)
      .eq('consultant_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setTasks(data || []);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('consultant_id', profile?.id)
      .eq('status', 'active');

    if (error) throw error;
    setProjects(data || []);
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
        estimated_hours: taskForm.estimated_hours || null,
        assigned_to: taskForm.assigned_to || null
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
      alert('Task saved successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task: ' + (error as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
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
  };

  const stopTimer = async (taskId: string) => {
    if (!timerStart) return;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - timerStart.getTime()) / 60000);

    try {
      // Add time entry
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          task_id: taskId,
          user_id: profile?.id,
          duration_minutes: durationMinutes,
          description: 'Time tracking session',
          date: new Date().toISOString().split('T')[0],
          billable: true
        }]);

      if (error) throw error;

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
      await fetchTasks();
      alert(`Time logged: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`);
    } catch (error) {
      console.error('Error logging time:', error);
      alert('Failed to log time');
    }
  };

  const handleEdit = (task: TaskWithDetails) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id || '',
      client_id: task.client_id,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      estimated_hours: task.estimated_hours || 0,
      assigned_to: task.assigned_to || ''
    });
    setShowTaskModal(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      project_id: '',
      client_id: '',
      status: 'pending',
      priority: 'medium',
      due_date: '',
      estimated_hours: 0,
      assigned_to: ''
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
      case 'cancelled': return 'bg-gray-100 text-gray-800';
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
      case 'cancelled': return <Square className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.due_date && new Date(t.due_date) < new Date())).length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

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
              <p className="text-gray-600 mt-1">Manage tasks, track time, and monitor progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Task</span>
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
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Title, description, client..."
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-600 mb-6">Create your first task to get started.</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create First Task
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
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{task.client?.company_name || task.client?.profile?.full_name || 'Unknown Client'}</span>
                      </div>
                      {task.project && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{task.project.name}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={new Date(task.due_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {task.actual_hours}h / {task.estimated_hours || 0}h
                        </span>
                      </div>
                    </div>

                    {task.assigned_user && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {task.assigned_user.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Time Tracking */}
                    {activeTimer === task.id ? (
                      <button
                        onClick={() => stopTimer(task.id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                      >
                        <Square className="h-4 w-4" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(task.id)}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start</span>
                      </button>
                    )}

                    {/* Status Update */}
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
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
                  {editingTask ? 'Edit Task' : 'Create New Task'}
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
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Review client documents"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of the task..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    required
                    value={taskForm.client_id}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, client_id: e.target.value }))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project (Optional)
                  </label>
                  <select
                    value={taskForm.project_id}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">No project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
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
                </div>
              </div>

              {/* Actions */}
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
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingTask ? 'Update' : 'Create'} Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;