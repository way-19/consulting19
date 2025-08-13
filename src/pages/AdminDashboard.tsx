import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Settings, 
  UserPlus, 
  Building, 
  FileText,
  MessageSquare,
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalConsultants: number;
  totalClients: number;
  totalCountries: number;
  totalRevenue: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalConsultants: 0,
    totalClients: 0,
    totalCountries: 0,
    totalRevenue: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      // Fetch user counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      const totalUsers = profiles?.length || 0;
      const totalConsultants = profiles?.filter(p => p.role === 'consultant').length || 0;
      const totalClients = profiles?.filter(p => p.role === 'client').length || 0;

      // Fetch countries count
      const { data: countries } = await supabase
        .from('countries')
        .select('id');

      const totalCountries = countries?.length || 0;

      // Fetch project stats
      const { data: clients } = await supabase
        .from('clients')
        .select('status');

      const activeProjects = clients?.filter(c => c.status === 'in_progress').length || 0;
      const completedProjects = clients?.filter(c => c.status === 'completed').length || 0;

      // Mock revenue and tasks for now
      const totalRevenue = 125000;
      const pendingTasks = 23;

      setStats({
        totalUsers,
        totalConsultants,
        totalClients,
        totalCountries,
        totalRevenue,
        activeProjects,
        completedProjects,
        pendingTasks
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Consultants',
      value: stats.totalConsultants.toString(),
      icon: UserPlus,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Clients',
      value: stats.totalClients.toString(),
      icon: Building,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Countries',
      value: stats.totalCountries.toString(),
      icon: Globe,
      color: 'bg-indigo-500',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-600',
      change: '+23%',
      changeType: 'positive'
    },
    {
      name: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Completed',
      value: stats.completedProjects.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      change: '+18%',
      changeType: 'positive'
    },
    {
      name: 'Pending Tasks',
      value: stats.pendingTasks.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3',
      changeType: 'positive'
    }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Platform overview and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Administrator</span>
              </div>
              <button
                onClick={fetchStats}
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email}
              </h2>
              <p className="text-purple-100">
                Platform Administrator • Full System Access
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-purple-200 text-sm">Total Platform Users</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
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
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Platform Management</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group">
                  <Users className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">User Management</div>
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group">
                  <Globe className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Country Management</div>
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group">
                  <FileText className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Content Management</div>
                </button>
                <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group">
                  <Settings className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">System Settings</div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New client registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Consultant assigned</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System maintenance scheduled</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Security</p>
              <p className="text-sm text-green-600">All Systems Secure</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Performance</p>
              <p className="text-sm text-green-600">Optimal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;