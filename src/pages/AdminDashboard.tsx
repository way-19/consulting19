import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import StatsCard from '../components/admin/StatsCard';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  UserPlus, 
  Building, 
  CheckCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Shield,
  BarChart3
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

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'consultant_assigned' | 'project_completed' | 'payment_received';
  description: string;
  timestamp: string;
  user?: string;
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
      fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    // Mock recent activity for now
    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'user_registered',
        description: 'New client registered from Turkey',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        user: 'client@example.com'
      },
      {
        id: '2',
        type: 'consultant_assigned',
        description: 'Georgia consultant assigned to new client',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        user: 'georgia@consulting19.com'
      },
      {
        id: '3',
        type: 'project_completed',
        description: 'Company formation completed in Estonia',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'estonia@consulting19.com'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'consultant_assigned': return <Users className="h-4 w-4 text-green-600" />;
      case 'project_completed': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'payment_received': return <DollarSign className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registered': return 'bg-blue-50 border-blue-200';
      case 'consultant_assigned': return 'bg-green-50 border-green-200';
      case 'project_completed': return 'bg-purple-50 border-purple-200';
      case 'payment_received': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email}
              </h2>
              <p className="text-red-100">
                Platform Administrator • Full System Access
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="text-red-200 text-sm">Total Platform Users</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            change="+12%"
            changeType="positive"
            description="All platform users"
          />
          <StatsCard
            title="Consultants"
            value={stats.totalConsultants}
            icon={UserPlus}
            color="bg-green-500"
            change="+8%"
            changeType="positive"
            description="Active consultants"
          />
          <StatsCard
            title="Clients"
            value={stats.totalClients}
            icon={Building}
            color="bg-purple-500"
            change="+15%"
            changeType="positive"
            description="Registered clients"
          />
          <StatsCard
            title="Countries"
            value={stats.totalCountries}
            icon={Globe}
            color="bg-indigo-500"
            change="+2"
            changeType="positive"
            description="Supported jurisdictions"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-600"
            change="+23%"
            changeType="positive"
            description="Total platform revenue"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={TrendingUp}
            color="bg-orange-500"
            change="+5%"
            changeType="positive"
            description="Projects in progress"
          />
          <StatsCard
            title="Completed"
            value={stats.completedProjects}
            icon={CheckCircle}
            color="bg-emerald-500"
            change="+18%"
            changeType="positive"
            description="Successfully completed"
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={Clock}
            color="bg-yellow-500"
            change="-3"
            changeType="positive"
            description="Tasks awaiting action"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button
                onClick={fetchRecentActivity}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
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

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;