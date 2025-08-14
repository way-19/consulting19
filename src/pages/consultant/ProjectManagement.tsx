import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project, Task } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Building, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  X,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';

interface ProjectWithDetails extends Project {
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
  tasks_count?: number;
  completed_tasks?: number;
  total_time_logged?: number;
}

const ProjectManagement = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    end_date: '',
    estimated_hours: 0,
    budget: 0
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
        fetchProjects(),
        fetchClients()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
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

    // Enrich with task statistics
    const enrichedProjects = await Promise.all(
      (data || []).map(async (project) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status, actual_hours')
          .eq('project_id', project.id);

        const { data: timeEntries } = await supabase
          .from('time_entries')
          .select('duration_minutes')
          .in('task_id', (tasks || []).map(t => t.id));

        const tasksCount = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const totalTimeLogged = (timeEntries || []).reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60;

        return {
          ...project,
          tasks_count: tasksCount,
          completed_tasks: completedTasks,
          total_time_logged: totalTimeLogged
        } as ProjectWithDetails;
      })
    );

    setProjects(enrichedProjects);
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

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...projectForm,
        consultant_id: profile?.id,
        start_date: projectForm.start_date ? new Date(projectForm.start_date).toISOString() : null,
        end_date: projectForm.end_date ? new Date(projectForm.end_date).toISOString() : null,
        estimated_hours: projectForm.estimated_hours || null,
        budget: projectForm.budget || null
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        
        if (error) throw error;
      }

      await fetchProjects();
      resetForm();
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project: ' + (error as Error).message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      await fetchProjects();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      await fetchProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleEdit = (project: ProjectWithDetails) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      estimated_hours: project.estimated_hours || 0,
      budget: project.budget || 0
    });
    setShowProjectModal(true);
  };

  const resetForm = () => {
    setProjectForm({
      name: '',
      description: '',
      client_id: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      estimated_hours: 0,
      budget: 0
    });
    setEditingProject(null);
    setShowProjectModal(false);
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalTimeLogged = projects.reduce((sum, p) => sum + (p.total_time_logged || 0), 0);

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
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-1">Manage client projects and track progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProjectModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>New Project</span>
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
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <Building className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{activeProjects}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-green-600">${totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, description, client..."
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
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
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

            <div className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started.</p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-gray-600 mb-3">{project.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{project.client?.company_name || project.client?.profile?.full_name || 'Unknown Client'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{project.completed_tasks || 0} / {project.tasks_count || 0} tasks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{(project.total_time_logged || 0).toFixed(1)}h logged</span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {project.start_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={new Date(project.end_date) < new Date() ? 'text-red-600 font-medium' : ''}>
                            Due: {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/consultant/tasks?project=${project.id}`}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Tasks</span>
                    </Link>

                    <select
                      value={project.status}
                      onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value as Project['status'])}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleEdit(project)}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
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

      {/* Project Form Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitProject} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Georgia LLC Formation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Project description and objectives..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    required
                    value={projectForm.client_id}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, client_id: e.target.value }))}
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
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
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
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={projectForm.estimated_hours}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.end_date}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
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
                  <span>{editingProject ? 'Update' : 'Create'} Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;