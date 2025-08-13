import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MultilingualChat from '../components/MultilingualChat';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings, 
  Star, 
  Award, 
  Calculator, 
  CreditCard, 
  Globe, 
  Globe2 
} from 'lucide-react';

interface AssignedClient {
  id: string;
  profile_id: string;
  company_name?: string;
  status: string;
  priority: string;
  progress: number;
  created_at: string;
  profile?: {
    email: string;
    full_name?: string;
    country?: string;
  };
}

const ConsultantDashboard = () => {
  const { user, profile } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState<'admin-consultant' | 'consultant-client'>('admin-consultant');
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchAssignedClients();
    }
  }, [profile]);

  const fetchAssignedClients = async () => {
    try {
      setLoadingClients(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id,
          assigned_consultant_id,
          company_name,
          status,
          priority,
          progress,
          created_at,
          profile:profile_id (
            id,
            email,
            full_name,
            country
          )
        `)
        .eq('assigned_consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assigned clients:', error);
      } else {
        setAssignedClients(data || []);
      }
    } catch (error) {
      console.error('Error in fetchAssignedClients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const stats = [
    {
      name: 'Active Clients',
      value: assignedClients.filter(c => c.status === 'in_progress').length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
      description: 'Currently active clients'
    },
    {
      name: 'Completed Projects',
      value: assignedClients.filter(c => c.status === 'completed').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
      description: 'Successfully completed'
    },
    {
      name: 'Total Clients',
      value: assignedClients.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+2.1%',
      changeType: 'positive',
      description: 'All assigned clients'
    },
    {
      name: 'Avg Response Time',
      value: '2.3h',
      icon: Clock,
      color: 'bg-orange-500',
      change: '-15min',
      changeType: 'positive',
      description: 'Average response time'
    }
  ];

  const upcomingTasks = [
    { 
      id: 1, 
      task: 'Client consultation call', 
      time: '10:00 AM', 
      client: 'Tech Startup LLC',
      type: 'meeting',
      priority: 'high'
    },
    { 
      id: 2, 
      task: 'Document review', 
      time: '2:30 PM', 
      client: 'Global Trading Co.',
      type: 'review',
      priority: 'medium'
    },
    { 
      id: 3, 
      task: 'Bank account setup', 
      time: '4:00 PM', 
      client: 'Investment Fund',
      type: 'setup',
      priority: 'high'
    },
    { 
      id: 4, 
      task: 'Follow-up email', 
      time: '5:30 PM', 
      client: 'E-commerce Ltd.',
      type: 'communication',
      priority: 'low'
    }
  ];

  const quickActions = [
    { name: 'Schedule Meeting', icon: Calendar, color: 'bg-green-500 hover:bg-green-600', description: 'Book consultation' },
    { name: 'Generate Report', icon: FileText, color: 'bg-purple-500 hover:bg-purple-600', description: 'Create client report' },
    { name: 'Admin Chat', icon: MessageSquare, color: 'bg-blue-500 hover:bg-blue-600', description: 'Message with admin' },
    { name: 'Client Messages', icon: Users, color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Messages from clients' },
    { name: 'View Analytics', icon: TrendingUp, color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Performance metrics' },
    { name: 'Settings', icon: Settings, color: 'bg-gray-500 hover:bg-gray-600', description: 'Account settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/image.png" 
                alt="Consulting19 Logo" 
                className="h-16 w-32"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe2 className="h-16 w-32 text-purple-600 hidden" />
              <div>
                <p className="text-sm text-gray-500">Professional Consultant Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                {profile?.role || 'consultant'} • Georgia Specialist
              </span>
            </div>
          </div>
          
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.full_name || profile?.email || user?.email || 'Consultant'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg border border-purple-200">
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <Link 
              to="/consultant-services"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>My Services</span>
            </Link>
            <Link 
              to="/legacy-orders"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Legacy Orders</span>
            </Link>
            <Link 
              to="/accounting-management"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Calculator className="h-4 w-4" />
              <span>Accounting Management</span>
            </Link>
            <Link 
              to="/customers-management"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Customer Management</span>
            </Link>
            <Link 
              to="/consultant-payments"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </Link>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Globe className="h-4 w-4" />
              <Link to="/site-management">Site Management</Link>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Recent Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Clients</h2>
              <Link 
                to="/customers-management"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {loadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : assignedClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Clients</h3>
                  <p className="text-gray-600">No clients have been assigned to you yet.</p>
                  <button 
                    onClick={fetchAssignedClients}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedClients.slice(0, 5).map((client) => (
                    <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {client.company_name || client.profile?.full_name || client.profile?.email}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              client.priority === 'high' ? 'bg-red-100 text-red-700' :
                              client.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {client.priority} Priority
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Email: {client.profile?.email}</p>
                            <p>Country: {client.profile?.country || 'Georgia'}</p>
                            <p>Status: {client.status}</p>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    client.progress === 100 ? 'bg-green-500' :
                                    client.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${client.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{client.progress}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            client.status === 'completed' ? 'bg-green-100 text-green-800' :
                            client.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Debug Info */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">System Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">User:</span>
                  <p className="text-blue-600">{user?.email || 'No user'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Profile:</span>
                  <p className="text-blue-600">{profile ? `${profile.email} (${profile.role})` : 'No profile'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Assigned Clients:</span>
                  <p className="text-blue-600">{assignedClients.length}</p>
                </div>
              </div>
              <button 
                onClick={fetchAssignedClients}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Clients
              </button>
            </div>

            {/* Enhanced Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.task}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.client}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-purple-600 font-medium">{task.time}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                            task.type === 'review' ? 'bg-green-100 text-green-700' :
                            task.type === 'setup' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index} 
                      onClick={() => {
                        if (action.name === 'Admin Chat') {
                          setChatType('admin-consultant');
                          setIsChatOpen(true);
                        } else if (action.name === 'Client Messages') {
                          setChatType('consultant-client');
                          setIsChatOpen(true);
                        }
                      }}
                      className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group cursor-pointer`}
                    >
                      <action.icon className="h-5 w-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-medium">{action.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">This Month</h3>
                <Award className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">New Clients</span>
                  <span className="font-bold">{assignedClients.filter(c => c.status === 'new').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Revenue</span>
                  <span className="font-bold">$47,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    <span className="font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Chat Modal */}
      <MultilingualChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatType={chatType}
        currentUserId={profile?.id || 'consultant-1'}
        currentUserRole="consultant"
      />
    </div>
  );
};

export default ConsultantDashboard;