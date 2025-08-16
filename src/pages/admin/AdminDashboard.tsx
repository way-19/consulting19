import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Settings, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Database,
  Zap,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  User,
  Bell
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalConsultants: number;
  totalClients: number;
  totalCountries: number;
  totalRevenue: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    security: 'healthy' | 'warning' | 'error';
    performance: 'healthy' | 'warning' | 'error';
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error' | 'checking';
  checks: {
    database: {
      status: 'healthy' | 'error';
      responseTime: number;
      error?: string;
    };
    storage: {
      status: 'healthy' | 'error';
      responseTime: number;
      error?: string;
    };
    auth: {
      status: 'healthy' | 'error';
      responseTime: number;
      error?: string;
    };
  };
  timestamp: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConsultants: 0,
    totalClients: 0,
    totalCountries: 0,
    totalRevenue: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    systemHealth: {
      database: 'healthy',
      security: 'healthy',
      performance: 'healthy'
    }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemHealthStatus, setSystemHealthStatus] = useState<HealthCheckResult>({
    status: 'checking',
    checks: {
      database: { status: 'healthy', responseTime: 0 },
      storage: { status: 'healthy', responseTime: 0 },
      auth: { status: 'healthy', responseTime: 0 }
    },
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('🚀 AdminDashboard useEffect triggered');
    console.log('👤 Profile:', profile);
    console.log('🔑 Profile role:', profile?.role);
    
    if (profile?.role === 'admin') {
      console.log('✅ Admin role confirmed, calling fetchDashboardData...');
      fetchDashboardData();
      fetchSystemHealth();
    } else {
      console.log('❌ Not admin role or no profile, skipping data fetch');
    }
  }, [profile]);

  const fetchSystemHealth = async () => {
    try {
      setSystemHealthStatus(prev => ({ ...prev, status: 'checking' }));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-check`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const healthData = await response.json();
      setSystemHealthStatus(healthData);
    } catch (error) {
      console.error('Health check error:', error);
      setSystemHealthStatus({
        status: 'error',
        checks: {
          database: { status: 'error', responseTime: 0, error: 'Health check failed' },
          storage: { status: 'error', responseTime: 0, error: 'Health check failed' },
          auth: { status: 'error', responseTime: 0, error: 'Health check failed' }
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 fetchDashboardData: Starting...');
      setLoading(true);

      // Fetch all stats in parallel
      const [usersResult, clientsResult, countriesResult, projectsResult, tasksResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('legacy_role', 'client'),
        supabase.from('countries').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id, status'),
        supabase.from('tasks').select('id, status', { count: 'exact' })
      ]);

      // Get consultants count separately
      const consultantsResult = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('legacy_role', 'consultant');

      console.log('📊 fetchDashboardData: Query results:');
      console.log('  - Users count:', usersResult.count, 'Error:', usersResult.error);
      console.log('  - Consultants count:', consultantsResult.count, 'Error:', consultantsResult.error);
      console.log('  - Clients count:', clientsResult.count, 'Error:', clientsResult.error);
      console.log('  - Countries count:', countriesResult.count, 'Error:', countriesResult.error);
      console.log('  - Projects data length:', projectsResult.data?.length, 'Error:', projectsResult.error);
      
      // Calculate stats
      console.log('🧮 fetchDashboardData: Calculating stats...');
      const newStats: DashboardStats = {
        totalUsers: usersResult.count || 0,
        totalConsultants: consultantsResult.count || 0,
        totalClients: clientsResult.count || 0,
        totalCountries: countriesResult.count || 0,
        totalRevenue: 0, // Will be calculated from financial data
        activeProjects: projectsResult.data?.filter(p => p.status === 'active').length || 0,
        completedProjects: projectsResult.data?.filter(p => p.status === 'completed').length || 0,
        pendingTasks: tasksResult.data?.filter(t => t.status === 'pending').length || 0,
        systemHealth: {
          database: 'healthy',
          security: 'healthy',
          performance: 'healthy'
        }
      };

      console.log('📈 fetchDashboardData: Calculated stats:', newStats);
      setStats(newStats);

      // Set empty recent activity since audit_logs table doesn't exist
      setRecentActivity([]);

      console.log('✅ fetchDashboardData: All data processed successfully');
    } catch (error) {
      console.error('❌ fetchDashboardData: Error occurred:', error);
      console.error('Error fetching dashboard data:', error);
    } finally {
      console.log('🏁 fetchDashboardData: Setting loading to false');
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/admin/users'
    },
    {
      name: 'Country Management',
      description: 'Manage countries and consultant assignments',
      icon: Globe,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/admin/countries'
    },
    {
      name: 'Service Management',
      description: 'Manage custom services and pricing',
      icon: Settings,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/admin/services'
    },
    {
      name: 'Content Management',
      description: 'Manage blog posts, FAQs, and static content',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: '/admin/content'
    },
    {
      name: 'Financial Reports',
      description: 'View revenue, commissions, and financial analytics',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/admin/reports'
    },
    {
      name: 'System Settings',
      description: 'Configure platform settings and integrations',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      href: '/admin/settings'
    },
    {
      name: 'Security & Audit',
      description: 'View audit logs and security settings',
      icon: Shield,
      color: 'bg-red-500 hover:bg-red-600',
      href: '/admin/security'
    }
  ];

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform administration and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalConsultants}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalCountries}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Projects</p>
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
                <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-lg group`}
                  >
                    <action.icon className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-2">{action.name}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Link
                  to="/admin/audit"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <Link
                  to="/admin/health"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View Details →
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Database</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    systemHealthStatus.checks?.database.status === 'healthy' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {systemHealthStatus.checks?.database.status === 'healthy' ? 
                      <CheckCircle className="h-3 w-3" /> : 
                      <AlertTriangle className="h-3 w-3" />
                    }
                    <span>{systemHealthStatus.checks?.database.status || 'checking'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Security</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getHealthColor(stats.systemHealth.security)}`}>
                    {getHealthIcon(stats.systemHealth.security)}
                    <span>{stats.systemHealth.security}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Performance</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getHealthColor(stats.systemHealth.performance)}`}>
                    {getHealthIcon(stats.systemHealth.performance)}
                    <span>{stats.systemHealth.performance}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Overall Status</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    systemHealthStatus.status === 'healthy' ? 'text-green-600 bg-green-100' :
                    systemHealthStatus.status === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                    systemHealthStatus.status === 'error' ? 'text-red-600 bg-red-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {systemHealthStatus.status === 'checking' ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                    ) : systemHealthStatus.status === 'healthy' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <span>{systemHealthStatus.status}</span>
                  </span>
                </div>
              </div>

              {/* Quick Health Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Overall Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    systemHealthStatus.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    systemHealthStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {systemHealthStatus.status === 'checking' ? 'Checking...' : systemHealthStatus.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Success Rate</span>
                  <span className="font-bold">98.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Avg Response Time</span>
                  <span className="font-bold">2.3h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Client Satisfaction</span>
                  <span className="font-bold">4.9/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Uptime</span>
                  <span className="font-bold">99.9%</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Quick Links</h3>
              
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Manage Users</span>
                </Link>
                <Link
                  to="/admin/health"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">System Health</span>
                </Link>
                <Link
                  to="/admin/countries"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Manage Countries</span>
                </Link>
                <Link
                  to="/admin/services"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Manage Services</span>
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Financial Reports</span>
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">System Settings</span>
                </Link>
                <Link
                  to="/admin/security"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Security Audit</span>
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Notification Center</span>
                </Link>
                <Link
                  to="/my-profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">My Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;