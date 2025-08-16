import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, logAdminAction } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  Users,
  Database,
  Lock,
  Activity,
  Globe,
  FileText,
  Settings,
  Zap,
  Bell,
  Key,
  Monitor,
  Wifi,
  Server
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

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  activeUsers: number;
  suspiciousActivity: number;
  dataBreaches: number;
  lastSecurityScan: string;
  systemUptime: number;
  encryptionStatus: 'active' | 'warning' | 'error';
}

const SecurityAudit = () => {
  const { profile } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('last_7_days');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    activeUsers: 0,
    suspiciousActivity: 0,
    dataBreaches: 0,
    lastSecurityScan: '',
    systemUptime: 99.9,
    encryptionStatus: 'active'
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchSecurityData();
    }
  }, [profile, dateFilter]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAuditLogs(),
        fetchSecurityMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_id (
          full_name,
          email,
          legacy_role,
          ip_address,
          user_agent
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    // Apply date filter
    if (dateFilter !== 'all_time') {
      const days = {
        'last_24_hours': 1,
        'last_7_days': 7,
        'last_30_days': 30,
        'last_90_days': 90
      }[dateFilter] || 7;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.gte('timestamp', cutoffDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    setAuditLogs(data || []);
  };

  const fetchSecurityMetrics = async () => {
    // Mock security metrics - in production these would come from actual monitoring
    const mockMetrics: SecurityMetrics = {
      totalLogins: 1247,
      failedLogins: 23,
      activeUsers: 89,
      suspiciousActivity: 2,
      dataBreaches: 0,
      lastSecurityScan: new Date(Date.now() - 86400000).toISOString(),
      systemUptime: 99.9,
      encryptionStatus: 'active'
    };

    setMetrics(mockMetrics);
  };

  const exportAuditLogs = async () => {
    try {
      const csv = [
        'Timestamp,User,Action,Table,Target ID,IP Address',
        ...auditLogs.map(log => 
          `"${log.timestamp}","${log.user?.email || 'System'}","${log.action}","${log.target_table || ''}","${log.target_id || ''}","${log.ip_address || ''}"`
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      await logAdminAction('EXPORT_AUDIT_LOGS', 'audit_logs', null, null, { dateFilter, recordCount: auditLogs.length });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      alert('Failed to export audit logs');
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('DELETE')) return <AlertTriangle className="h-4 w-4" />;
    if (action.includes('CREATE')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('UPDATE')) return <Edit className="h-4 w-4" />;
    if (action.includes('LOGIN')) return <Key className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_table?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter.toUpperCase());
    const matchesUser = userFilter === 'all' || log.user_id === userFilter;
    
    return matchesSearch && matchesAction && matchesUser;
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
              <p className="text-gray-600 mt-1">Monitor system security and audit user activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportAuditLogs}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Export Logs</span>
              </button>
              <button
                onClick={fetchSecurityData}
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
        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-3xl font-bold text-green-600">{metrics.systemUptime}%</p>
              </div>
              <Server className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics.failedLogins}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Breaches</p>
                <p className="text-3xl font-bold text-green-600">{metrics.dataBreaches}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Encryption</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Database Encryption</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">API Encryption</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">File Storage</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <Database className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Database Security</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Row Level Security</span>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Backup Encryption</span>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Access Control</span>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <Monitor className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Monitoring</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800">Real-time Alerts</span>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800">Audit Logging</span>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800">Performance Monitoring</span>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="create">Create Actions</option>
                <option value="update">Update Actions</option>
                <option value="delete">Delete Actions</option>
                <option value="login">Login Actions</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="last_24_hours">Last 24 Hours</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="all_time">All Time</option>
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
                {/* This would be populated with actual users */}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {auditLogs.length} logs
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs</h3>
              <p className="text-gray-600">No audit logs match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Timestamp</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-2">Action</div>
                  <div className="col-span-2">Target</div>
                  <div className="col-span-2">IP Address</div>
                  <div className="col-span-2">Details</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">
                          {log.user?.full_name || log.user?.email || 'System'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.user?.legacy_role || 'System'}
                        </p>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">{log.target_table || 'N/A'}</p>
                        {log.target_id && (
                          <p className="text-xs text-gray-500 font-mono">{log.target_id.slice(0, 8)}...</p>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">{log.ip_address || 'Unknown'}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowLogDetail(true);
                          }}
                          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span className="text-xs">View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {showLogDetail && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
                <button
                  onClick={() => setShowLogDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
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
                      <p className="font-medium font-mono text-sm">{selectedLog.target_id || 'N/A'}</p>
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
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedLog.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Role:</span>
                      <p className="font-medium">{selectedLog.user?.legacy_role || 'System'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">IP Address:</span>
                      <p className="font-medium">{selectedLog.ip_address || 'Unknown'}</p>
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
                        <h4 className="font-medium text-gray-900 mb-2">Old Values</h4>
                        <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs overflow-auto">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {selectedLog.new_values && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">New Values</h4>
                        <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs overflow-auto">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.user_agent && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 font-mono">{selectedLog.user_agent}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;