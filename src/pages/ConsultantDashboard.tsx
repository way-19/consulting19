import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ConsultantLayout from '../components/consultant/ConsultantLayout';
import StatsCard from '../components/consultant/StatsCard';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Star,
  CheckCircle,
  AlertTriangle,
  Package,
  MessageSquare,
  Eye,
  ArrowRight,
  RefreshCw,
  Calendar,
  Globe
} from 'lucide-react';

interface ConsultantStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  responseTime: string;
}

interface AssignedClient {
  id: string;
  profile_id: string;
  company_name?: string;
  status: 'new' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  created_at: string;
  profile?: {
    full_name?: string;
    email: string;
    country?: string;
  };
}

const ConsultantDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<ConsultantStats>({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    responseTime: '< 2 hours'
  });
  const [recentClients, setRecentClients] = useState<AssignedClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
      fetchRecentClients();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      // Fetch assigned clients
      const { data: clients } = await supabase
        .from('clients')
        .select('status')
        .eq('assigned_consultant_id', profile?.id);

      const totalClients = clients?.length || 0;
      const activeProjects = clients?.filter(c => c.status === 'in_progress').length || 0;
      const completedProjects = clients?.filter(c => c.status === 'completed').length || 0;

      // Mock other stats for now
      const pendingTasks = 8;
      const totalEarnings = 47250;
      const monthlyEarnings = 8420;
      const averageRating = 4.9;

      setStats({
        totalClients,
        activeProjects,
        completedProjects,
        pendingTasks,
        totalEarnings,
        monthlyEarnings,
        averageRating,
        responseTime: '< 2 hours'
      });
    } catch (error) {
      console.error('Error fetching consultant stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profile:profile_id (
            full_name,
            email,
            country
          )
        `)
        .eq('assigned_consultant_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentClients(data || []);
    } catch (error) {
      console.error('Error fetching recent clients:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
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
      <ConsultantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ConsultantLayout>
    );
  }

  return (
    <ConsultantLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email}
              </h2>
              <p className="text-green-100">
                {profile?.country || 'Global'} Business Consultant • Expert Services
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.totalClients}</div>
              <div className="text-green-200 text-sm">Assigned Clients</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients}
            icon={Users}
            color="bg-blue-500"
            change="+3"
            changeType="positive"
            description="Assigned to you"
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={TrendingUp}
            color="bg-green-500"
            change="+2"
            changeType="positive"
            description="In progress"
          />
          <StatsCard
            title="Monthly Earnings"
            value={`$${stats.monthlyEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="bg-purple-500"
            change="+15%"
            changeType="positive"
            description="This month"
          />
          <StatsCard
            title="Avg Rating"
            value={stats.averageRating}
            icon={Star}
            color="bg-yellow-500"
            description="Client satisfaction"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Clients</h3>
              <Link
                to="/consultant/clients"
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-6">
              {recentClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No clients assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(client.company_name || client.profile?.full_name || client.profile?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {client.company_name || client.profile?.full_name || 'Unnamed Client'}
                          </p>
                          <p className="text-xs text-gray-600">{client.profile?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(client.priority)}`}></div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/consultant/clients"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group text-center"
                >
                  <Users className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Manage Clients</div>
                </Link>
                <Link
                  to="/consultant/services"
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group text-center"
                >
                  <Settings className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">My Services</div>
                </Link>
                <Link
                  to="/consultant/orders"
                  className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group text-center"
                >
                  <Package className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Legacy Orders</div>
                </Link>
                <Link
                  to="/consultant/payments"
                  className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group text-center"
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Payments</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Summary</h3>
            <div className="flex items-center space-x-2 text-green-700">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold">{stats.averageRating}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{stats.totalClients}</div>
              <div className="text-sm text-green-600">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.completedProjects}</div>
              <div className="text-sm text-blue-600">Completed Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">${stats.totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-purple-600">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">{stats.responseTime}</div>
              <div className="text-sm text-orange-600">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </ConsultantLayout>
  );
};

export default ConsultantDashboard;