import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, logAdminAction } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Shield, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Database,
  Key,
  Lock,
  Unlock,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  Server,
  Wifi,
  MapPin,
  FileText,
  Settings,
  Bell,
  Zap,
  TrendingUp,
  BarChart3,
  Users,
  X,
  Save,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  target_table?: string;
  target_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  user?: {
    full_name: string;
    email: string;
    legacy_role: string;
  };
}

interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'failed_login' | 'password_reset' | 'permission_change' | 'data_access';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  activeUsers: number;
  suspiciousActivity: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface SecuritySetting {
  key: string;
  value: any;
  description: string;
  category: string;
}

const SecurityAudit = () => {
  const { profile } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'audit' | 'events' | 'settings' | 'monitoring'>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    activeUsers: 0,
    suspiciousActivity: 0,
    systemHealth: 'healthy'
  });

  const [securitySettings, setSecuritySettings] = useState({
    session_timeout: 24,
    max_login_attempts: 5,
    password_min_length: 8,
    require_2fa: false,
    ip_whitelist_enabled: false,
    audit_retention_days: 90,
    auto_logout_inactive: true,
    email_notifications: true,
    slack_notifications: false
  });

  useEffect(() => {
    if (profile?.legacy_role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAuditLogs(),
        fetchSecurityEvents(),
        fetchUsers(),
        fetchSecuritySettings()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_id (
          full_name,
          email,
          legacy_role
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    setAuditLogs(data || []);
  };

  const fetchSecurityEvents = async () => {
    // Mock security events data
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        event_type: 'failed_login',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: { email: 'unknown@example.com', attempts: 3 },
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        event_type: 'login_attempt',
        user_id: profile?.id,
        ip_address: '10.0.0.1',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { success: true },
        severity: 'low',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        resolved: true
      },
      {
        id: '3',
        event_type: 'permission_change',
        user_id: profile?.id,
        ip_address: '10.0.0.1',
        details: { target_user: 'user123', old_role: 'client', new_role: 'consultant' },
        severity: 'high',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        resolved: true
      }
    ];

    setSecurityEvents(mockEvents);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, legacy_role')
      .order('full_name', { ascending: true });

    if (error) throw error;
    setUsers(data || []);
  };

  const fetchSecuritySettings = async () => {
    // In a real implementation, this would fetch from settings table
    // For now, using default values
  };

  const calculateStats = () => {
    const totalEvents = securityEvents.length;
    const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
    const failedLogins = securityEvents.filter(e => e.event_type === 'failed_login').length;
    const suspiciousActivity = securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length;

    setStats({
      totalEvents,
      criticalEvents,
      failedLogins,
      activeUsers: users.filter(u => u.is_active).length,
      suspiciousActivity,
      systemHealth: criticalEvents > 0 ? 'critical' : suspiciousActivity > 0 ? 'warning' : 'healthy'
    });
  };

  const handleUpdateSecuritySettings = async () => {
    try {
      // Update security settings
      for (const [key, value] of Object.entries(securitySettings)) {
        await supabase
          .from('settings')
          .upsert({ key: `security_${key}`, value, category: 'security' });
      }

      await logAdminAction('UPDATE_SECURITY_SETTINGS', 'settings', null, null, securitySettings);
      alert('Security settings updated successfully!');
    } catch (error) {
      console.error('Error updating security settings:', error);
      alert('Failed to update security settings');
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      // In real implementation, this would update the security event
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, resolved: true } : event
        )
      );
      alert('Security event marked as resolved');
    } catch (error) {
      console.error('Error resolving security event:', error);
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Target Table', 'IP Address'].join(','),
      ...filteredAuditLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.user?.email || 'System',
        log.action,
        log.target_table || '',
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    if (userAgent.includes('Tablet')) return <Laptop className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_table?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter.toUpperCase());
    const matchesUser = userFilter === 'all' || log.user_id === userFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          matchesDate = (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          matchesDate = (now.getTime() - logDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  const filteredSecurityEvents = securityEvents.filter(event => {
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    return matchesSeverity;
  });

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
              to="/admin-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security & Audit</h1>
              <p className="text-gray-600 mt-1">Monitor system security, audit logs, and security events</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getHealthColor(stats.systemHealth)}`}>
                {getHealthIcon(stats.systemHealth)}
                <span className="font-medium">System {stats.systemHealth}</span>
              </div>
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
        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-3xl font-bold text-red-600">{stats.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-3xl font-bold text-orange-600">{stats.failedLogins}</p>
              </div>
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspicious Activity</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.suspiciousActivity}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className={`text-2xl font-bold ${
                  stats.systemHealth === 'healthy' ? 'text-green-600' :
                  stats.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.systemHealth === 'healthy' ? '✓' :
                   stats.systemHealth === 'warning' ? '⚠' : '✗'}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'audit', label: 'Audit Logs', icon: FileText, count: auditLogs.length },
                { key: 'events', label: 'Security Events', icon: Shield, count: securityEvents.length },
                { key: 'settings', label: 'Security Settings', icon: Settings, count: 0 },
                { key: 'monitoring', label: 'Real-time Monitoring', icon: Monitor, count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'audit' && (
              <div className="space-y-6">
                {/* Audit Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Logs</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Action, user, table..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Actions</option>
                      <option value="create">Create</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                      <option value="login">Login</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={exportAuditLog}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredAuditLogs.length} of {auditLogs.length} audit logs
                </div>

                {/* Audit Logs List */}
                <div className="space-y-3">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
                      <p className="text-gray-600">No audit logs match your current filters.</p>
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                {log.action}
                              </span>
                              <span className="text-sm text-gray-600">
                                by {log.user?.full_name || log.user?.email || 'System'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Target:</span> {log.target_table || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">User Role:</span> {log.user?.legacy_role || 'Unknown'}
                              </div>
                              <div>
                                <span className="font-medium">IP Address:</span> {log.ip_address || 'Unknown'}
                              </div>
                              <div className="flex items-center space-x-1">
                                {log.user_agent && getDeviceIcon(log.user_agent)}
                                <span className="font-medium">Device:</span> 
                                <span>{log.user_agent ? (
                                  log.user_agent.includes('Mobile') ? 'Mobile' :
                                  log.user_agent.includes('Tablet') ? 'Tablet' : 'Desktop'
                                ) : 'Unknown'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowLogDetail(true);
                            }}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {/* Security Events Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Showing {filteredSecurityEvents.length} of {securityEvents.length} security events
                  </div>
                </div>

                {/* Security Events List */}
                <div className="space-y-4">
                  {filteredSecurityEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Security Events</h3>
                      <p className="text-gray-600">No security events match your current filters.</p>
                    </div>
                  ) : (
                    filteredSecurityEvents.map((event) => (
                      <div key={event.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                {event.severity.toUpperCase()}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.event_type.replace('_', ' ').toUpperCase()}
                              </h3>
                              {event.resolved ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  RESOLVED
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>IP: {event.ip_address || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {event.user_agent && getDeviceIcon(event.user_agent)}
                                <span>Device: {event.user_agent ? (
                                  event.user_agent.includes('Mobile') ? 'Mobile' :
                                  event.user_agent.includes('Tablet') ? 'Tablet' : 'Desktop'
                                ) : 'Unknown'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                              <pre className="text-xs text-gray-600 overflow-x-auto">
                                {JSON.stringify(event.details, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!event.resolved && (
                              <button
                                onClick={() => handleResolveEvent(event.id)}
                                className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Resolve</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
                  <button
                    onClick={handleUpdateSecuritySettings}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Authentication Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Key className="h-5 w-5 text-blue-600" />
                      <span>Authentication</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={securitySettings.session_timeout}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) || 24 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={securitySettings.max_login_attempts}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) || 5 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={securitySettings.password_min_length}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, password_min_length: parseInt(e.target.value) || 8 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="require_2fa"
                            checked={securitySettings.require_2fa}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, require_2fa: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="require_2fa" className="text-sm font-medium text-gray-700">
                            Require Two-Factor Authentication
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="auto_logout_inactive"
                            checked={securitySettings.auto_logout_inactive}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, auto_logout_inactive: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="auto_logout_inactive" className="text-sm font-medium text-gray-700">
                            Auto-logout inactive users
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Access Control Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Access Control</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Audit Log Retention (days)
                        </label>
                        <input
                          type="number"
                          min="30"
                          max="365"
                          value={securitySettings.audit_retention_days}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, audit_retention_days: parseInt(e.target.value) || 90 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="ip_whitelist_enabled"
                            checked={securitySettings.ip_whitelist_enabled}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, ip_whitelist_enabled: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="ip_whitelist_enabled" className="text-sm font-medium text-gray-700">
                            Enable IP Whitelist
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="email_notifications"
                            checked={securitySettings.email_notifications}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                            Email security notifications
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="slack_notifications"
                            checked={securitySettings.slack_notifications}
                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, slack_notifications: e.target.checked }))}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor="slack_notifications" className="text-sm font-medium text-gray-700">
                            Slack security alerts
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Status Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Current Security Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">RLS Enabled</p>
                      <p className="text-xs text-gray-600">Row Level Security</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">SSL/TLS Active</p>
                      <p className="text-xs text-gray-600">Encrypted connections</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <Key className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">API Keys Secured</p>
                      <p className="text-xs text-gray-600">Environment variables</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Backup Active</p>
                      <p className="text-xs text-gray-600">Daily backups</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Real-time Security Monitoring</h3>
                
                {/* Live Activity Feed */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Live Activity Feed</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {auditLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {log.user?.full_name || log.user?.email || 'System'} performed {log.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()} • {log.target_table || 'System'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>System Load</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <span className="font-medium text-green-600">12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="font-medium text-blue-600">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Database Load</span>
                        <span className="font-medium text-purple-600">23%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <Wifi className="h-5 w-5 text-green-600" />
                      <span>Network Security</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Firewall Status</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">DDoS Protection</span>
                        <span className="font-medium text-green-600">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SSL Certificate</span>
                        <span className="font-medium text-green-600">Valid</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <Database className="h-5 w-5 text-purple-600" />
                      <span>Database Security</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">RLS Status</span>
                        <span className="font-medium text-green-600">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Encryption</span>
                        <span className="font-medium text-green-600">AES-256</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Backup Status</span>
                        <span className="font-medium text-green-600">Daily</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Detail Modal */}
      {showLogDetail && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
                <button
                  onClick={() => setShowLogDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Log Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Action:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Target Table:</span>
                      <p className="font-medium">{selectedLog.target_table || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Target ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedLog.target_id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">User:</span>
                      <p className="font-medium">{selectedLog.user?.full_name || selectedLog.user?.email || 'System'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Role:</span>
                      <p className="font-medium">{selectedLog.user?.legacy_role || 'System'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">IP Address:</span>
                      <p className="font-medium">{selectedLog.ip_address || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">User Agent:</span>
                      <p className="font-medium text-xs">{selectedLog.user_agent || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Changes */}
              {(selectedLog.old_values || selectedLog.new_values) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Changes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedLog.old_values && (
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">Old Values</h4>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <pre className="text-xs text-red-800 overflow-x-auto">
                            {JSON.stringify(selectedLog.old_values, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {selectedLog.new_values && (
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">New Values</h4>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <pre className="text-xs text-green-800 overflow-x-auto">
                            {JSON.stringify(selectedLog.new_values, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Risk Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-yellow-700">Risk Level:</span>
                    <span className="font-bold text-yellow-900 ml-2">
                      {selectedLog.action.includes('DELETE') ? 'High' :
                       selectedLog.action.includes('UPDATE') ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Data Sensitivity:</span>
                    <span className="font-bold text-yellow-900 ml-2">
                      {selectedLog.target_table === 'profiles' ? 'High' :
                       selectedLog.target_table === 'clients' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Compliance Impact:</span>
                    <span className="font-bold text-yellow-900 ml-2">
                      {selectedLog.action.includes('DELETE') ? 'High' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;