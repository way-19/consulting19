import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MultilingualChat from '../components/MultilingualChat';
import AssignedClientsList from '../components/consultant/dashboard/AssignedClientsList';
import { Users, TrendingUp, Clock, CheckCircle, Calendar, FileText, MessageSquare, Settings, Star, Award, Target, Zap, Calculator, CreditCard, Globe, Globe2, BarChart3, Shield, User, Bell } from 'lucide-react';

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
  const { profile } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState<'admin-consultant' | 'consultant-client'>('admin-consultant');
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchAssignedClients();
    }
  }, [profile]);

  const fetchAssignedClients = async () => {
    try {
      console.log('🔍 Fetching clients for consultant:', profile?.id, profile?.email);
      
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
        console.error('❌ Error fetching assigned clients:', error);
      } else {
        console.log('✅ Fetched clients:', data?.length || 0, 'clients found');
        console.log('📊 Client data:', data);
        setAssignedClients(data || []);
      }
    } catch (error) {
      console.error('💥 Error in fetchAssignedClients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Active Clients',
      value: '24',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
      description: 'Currently active clients'
    },
    {
      name: 'Completed Projects',
      value: '156',
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
      description: 'Successfully completed'
    },
    {
      name: 'Success Rate',
      value: '98.5%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+2.1%',
      changeType: 'positive',
      description: 'Project success rate'
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

  const recentClients = [
    { 
      id: 1, 
      name: 'Tech Startup LLC', 
      country: 'Georgia', 
      status: 'In Progress', 
      priority: 'High',
      lastContact: '2 hours ago',
      progress: 75,
      revenue: '$15,000'
    },
    { 
      id: 2, 
      name: 'Global Trading Co.', 
      country: 'Estonia', 
      status: 'Completed', 
      priority: 'Medium',
      lastContact: '1 day ago',
      progress: 100,
      revenue: '$8,500'
    },
    { 
      id: 3, 
      name: 'Investment Fund', 
      country: 'UAE', 
      status: 'Review', 
      priority: 'High',
      lastContact: '3 hours ago',
      progress: 45,
      revenue: '$25,000'
    },
    { 
      id: 4, 
      name: 'E-commerce Ltd.', 
      country: 'Malta', 
      status: 'In Progress', 
      priority: 'Low',
      lastContact: '5 hours ago',
      progress: 30,
      revenue: '$5,200'
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
    { name: 'Customers', icon: Users, color: 'bg-blue-500 hover:bg-blue-600', description: 'Manage clients', href: '/customers-management' },
    { name: 'Tasks', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600', description: 'Task management', href: '/consultant/tasks' },
    { name: 'Documents', icon: FileText, color: 'bg-purple-500 hover:bg-purple-600', description: 'Document review', href: '/consultant/documents' },
    { name: 'Projects', icon: Target, color: 'bg-indigo-500 hover:bg-indigo-600', description: 'Project tracking', href: '/consultant/projects' },
    { name: 'Payments', icon: CreditCard, color: 'bg-orange-500 hover:bg-orange-600', description: 'Financial reports', href: '/consultant/payments' },
    { name: 'Services', icon: Settings, color: 'bg-gray-500 hover:bg-gray-600', description: 'My services', href: '/consultant-services' }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar Layout */}
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/image.png" 
                  alt="Consulting19 Logo" 
                  className="h-12 w-24"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Globe2 className="h-12 w-24 text-purple-600 hidden" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{profile.full_name || profile.email}</h3>
                <p className="text-sm text-gray-500">Georgia Specialist</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">4.9</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg border border-purple-200">
                    <Users className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                  <Link 
                    to="/customers-management"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Customer Management</span>
                  </Link>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Services</h4>
                <div className="space-y-1">
                  <Link 
                    to="/consultant-services"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>My Services</span>
                  </Link>
                  <Link 
                    to="/legacy-orders"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Legacy Orders</span>
                  </Link>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</h4>
                <div className="space-y-1">
                  <Link 
                    to="/accounting-management"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Accounting</span>
                  </Link>
                  <Link 
                    to="/consultant/tasks"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Tasks</span>
                  </Link>
                  <Link 
                    to="/consultant/documents"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documents</span>
                  </Link>
                  <Link 
                    to="/consultant/projects"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Target className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Financial</h4>
                <div className="space-y-1">
                  <Link 
                    to="/consultant/payments"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Financial Reports</span>
                  </Link>
                </div>
              </div>

              {/* Admin Access - Only for admin users */}
              {profile.role === 'admin' && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</h4>
                  <div className="space-y-1">
                    <Link 
                      to="/admin-dashboard"
                      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content Control</h4>
                <div className="space-y-1">
                  <Link 
                    to="/consultant/country-management"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Country & Services</span>
                  </Link>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</h4>
                <div className="space-y-1">
                  <Link 
                    to="/my-profile"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Link 
                    to="/my-profile"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notifications</h4>
                <div className="space-y-1">
                  <Link 
                    to="/notifications"
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notification Center</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

            </nav>

          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {profile.full_name || profile.email}
                  </h1>
                  <p className="text-gray-600 mt-1">Manage your clients and track your performance</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Online</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Georgia Specialist
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
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
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View All
                    </button>
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
                        {assignedClients.map((client) => (
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
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setChatType('consultant-client');
                          setIsChatOpen(true);
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Client Chat</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setChatType('admin-consultant');
                          setIsChatOpen(true);
                        }}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Admin Chat</span>
                      </button>
                      
                      <button 
                        className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Calendar className="h-5 w-5" />
                        <span>AI Agent Appointments</span>
                      </button>
                    </div>
                  </div>

                  {/* Today's Appointments */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                          <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-red-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Client Consultation Call</p>
                            <p className="text-xs text-gray-500 mt-1">Tech Startup LLC - Company Formation</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-purple-600 font-medium">10:00 AM - 11:00 AM</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                Video Call
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                          <div className="flex-shrink-0 w-3 h-3 rounded-full mt-2 bg-yellow-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Document Review</p>
                            <p className="text-xs text-gray-500 mt-1">Global Trading Co. - Legal Documents</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-purple-600 font-medium">2:30 PM - 3:30 PM</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                Review
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debug Info */}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Debug Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Consultant ID:</span>
                        <p className="text-blue-600 font-mono text-xs">{profile?.id}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Email:</span>
                        <p className="text-blue-600">{profile?.email}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Role:</span>
                        <p className="text-blue-600">{profile?.role}</p>
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
                      Refresh Data
                    </button>
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
                        <span className="font-bold">8</span>
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
    </>
  );
};

export default ConsultantDashboard;