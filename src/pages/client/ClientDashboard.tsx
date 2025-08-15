import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  User, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Eye,
  Download,
  Upload,
  Star,
  Globe,
  Building
} from 'lucide-react';

interface UpcomingInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'sent' | 'overdue';
}

interface ClientStats {
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  totalSpent: number;
  documentsUploaded: number;
  averageRating: number;
}

interface ClientProject {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  consultant: {
    full_name: string;
    email: string;
  };
  created_at: string;
  estimated_completion: string;
}

const ClientDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    totalSpent: 0,
    documentsUploaded: 0,
    averageRating: 0
  });
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [upcomingInvoices, setUpcomingInvoices] = useState<UpcomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.legacy_role === 'client') {
      fetchClientData();
    }
  }, [profile]);

  const fetchClientData = async () => {
    try {
      // Get client record
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!clientData) {
        console.log('No client record found');
        setLoading(false);
        return;
      }

      setClientId(clientData.id);

      // Fetch upcoming invoices
      await fetchUpcomingInvoices(clientData.id);

      // Fetch projects
      const { data: projectsData } = await supabase
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

      setProjects(projectsData || []);

      // Calculate stats
      const activeProjects = projectsData?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;

      // Get tasks count
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('client_id', clientData.id);

      const pendingTasks = tasksData?.filter(t => t.status === 'pending').length || 0;

      // Get documents count
      const { data: documentsData } = await supabase
        .from('documents')
        .select('id')
        .eq('client_id', clientData.id);

      setStats({
        activeProjects,
        completedProjects,
        pendingTasks,
        totalSpent: 0, // Will be calculated from orders/invoices
        documentsUploaded: documentsData?.length || 0,
        averageRating: 4.8 // Mock data
      });

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingInvoices = async (clientId: string) => {
    try {
      // Get accounting client record
      const { data: accountingClientData } = await supabase
        .from('accounting_clients')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (!accountingClientData) return;

      // Get upcoming invoices (due within next 30 days or overdue)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('accounting_invoices')
        .select('id, invoice_number, amount, currency, due_date, status')
        .eq('client_id', accountingClientData.id)
        .in('status', ['sent', 'overdue'])
        .lte('due_date', thirtyDaysFromNow.toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingInvoices(data || []);
    } catch (error) {
      console.error('Error fetching upcoming invoices:', error);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'border-l-red-500 bg-red-50';
    if (daysUntilDue <= 3) return 'border-l-orange-500 bg-orange-50';
    if (daysUntilDue <= 7) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-blue-500 bg-blue-50';
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
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || profile?.email}
              </h1>
              <p className="text-gray-600 mt-1">Track your projects and manage your business journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Client ID</p>
                <p className="font-mono text-xs text-gray-500">{profile?.id.slice(0, 8)}...</p>
              </div>
              <Link
                to="/client/documents"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>My Documents</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-3xl font-bold text-purple-600">{stats.documentsUploaded}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
                <Link
                  to="/client/projects"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
              
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 mb-6">Start your business journey by creating your first project.</p>
                    <Link
                      to="/services"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{project.consultant.full_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${project.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{project.progress || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Payments Warning */}
            {upcomingInvoices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Ödemelerim</h2>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {upcomingInvoices.length} ödeme
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {upcomingInvoices.map((invoice) => {
                      const daysUntilDue = getDaysUntilDue(invoice.due_date);
                      
                      return (
                        <div
                          key={invoice.id}
                          className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                            getUrgencyColor(daysUntilDue)
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{invoice.invoice_number}</h4>
                            <span className="font-bold text-gray-900">${invoice.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Son Ödeme: {new Date(invoice.due_date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className={`text-sm font-medium ${
                            daysUntilDue < 0 ? 'text-red-600' : 
                            daysUntilDue <= 3 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} gün gecikti` :
                             daysUntilDue === 0 ? 'Bugün vadesi doluyor' :
                             daysUntilDue === 1 ? 'Yarın vadesi doluyor' :
                             `${daysUntilDue} gün kaldı`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      to="/client-accounting"
                      className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <DollarSign className="h-5 w-5" />
                      <span>Ödemelerimi Görüntüle</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/client/projects"
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Building className="h-5 w-5" />
                  <span>View Projects</span>
                </Link>
                
                <Link
                  to="/client-accounting"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Accounting</span>
                </Link>
                
                <Link
                  to="/client/documents"
                  className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Documents</span>
                </Link>
                
                <Link
                  to="/client/services"
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Globe className="h-5 w-5" />
                  <span>Additional Services</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Document approved</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New message from consultant</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Project milestone completed</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New project created</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              
              <p className="text-purple-100 text-sm mb-4">
                Our support team is here to help you with any questions or concerns.
              </p>
              
              <div className="space-y-2">
                <Link
                  to="/contact"
                  className="w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Support</span>
                </Link>
                
                <button className="w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Help Center</span>
                </button>
                
                <Link
                  to="/client/projects"
                  className="w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>View All Projects</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;