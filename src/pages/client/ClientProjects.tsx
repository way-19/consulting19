import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project, Task } from '../../lib/supabase';
import { 
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
  BarChart3
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Track your business projects and their progress</p>
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
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-3xl font-bold text-green-600">${totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-3xl font-bold text-purple-600">{avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Your consultant will create projects as your business journey progresses.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
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
                        <span>{project.completed_tasks_count || 0} / {project.total_tasks_count || 0} tasks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{(project.time_logged || 0).toFixed(1)}h logged</span>
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
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Project Progress</span>
                        <span className="text-sm text-gray-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getProgressColor(project.progress)} transition-all duration-300`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      {project.start_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className={new Date(project.end_date) < new Date() && project.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                            Due: {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDetail(true);
                      }}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
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
                <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Priority:</span>
                      <div className="inline-flex items-center space-x-2 ml-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedProject.priority)}`}></div>
                        <span className="font-medium">{selectedProject.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Consultant:</span>
                      <p className="font-medium">{selectedProject.consultant?.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedProject.consultant?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress & Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Progress:</span>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{selectedProject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(selectedProject.progress)}`}
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tasks:</span>
                      <p className="font-medium">{selectedProject.completed_tasks_count} / {selectedProject.total_tasks_count} completed</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Time Logged:</span>
                      <p className="font-medium">{(selectedProject.time_logged || 0).toFixed(1)} hours</p>
                    </div>
                    {selectedProject.budget && (
                      <div>
                        <span className="text-sm text-gray-600">Budget:</span>
                        <p className="font-medium">${selectedProject.budget.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              {selectedProject.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedProject.description}</p>
                </div>
              )}

              {/* Tasks List */}
              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Tasks</h3>
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
                                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                              )}
                              <span>Hours: {task.actual_hours} / {task.estimated_hours || 0}</span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Project Created</p>
                      <p className="text-sm text-blue-700">{new Date(selectedProject.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedProject.start_date && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Project Started</p>
                        <p className="text-sm text-green-700">{new Date(selectedProject.start_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedProject.end_date && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Expected Completion</p>
                        <p className="text-sm text-purple-700">{new Date(selectedProject.end_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
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