import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Settings, 
  ArrowLeft,
  Eye,
  X,
  Clock,
  AlertTriangle,
  Star,
  Calendar,
  User,
  FileText,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Download,
  Archive,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useNotifications from '../hooks/useNotifications';
import NotificationSettings from '../components/notifications/NotificationSettings';
import { formatNotificationContent, groupNotificationsByType } from '../components/notifications/NotificationTemplates';

const NotificationCenter = () => {
  const { profile } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification,
    bulkMarkAsRead,
    cleanupOldNotifications,
    getNotificationsByType,
    getUnreadNotificationsByPriority,
    refreshNotifications
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [groupByType, setGroupByType] = useState(false);

  const notificationTypes = [
    { value: 'document_uploaded', label: 'Document Uploads', icon: '📄' },
    { value: 'document_approved', label: 'Document Approvals', icon: '✅' },
    { value: 'document_rejected', label: 'Document Issues', icon: '⚠️' },
    { value: 'task_assigned', label: 'Task Assignments', icon: '📋' },
    { value: 'payment_received', label: 'Payments', icon: '💰' },
    { value: 'new_message', label: 'Messages', icon: '💬' },
    { value: 'deadline_reminder', label: 'Reminders', icon: '⏰' },
    { value: 'system_maintenance', label: 'System Updates', icon: '🔧' }
  ];

  const priorityLevels = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', count: getUnreadNotificationsByPriority('urgent').length },
    { value: 'high', label: 'High', color: 'text-orange-600', count: getUnreadNotificationsByPriority('high').length },
    { value: 'normal', label: 'Normal', color: 'text-blue-600', count: getUnreadNotificationsByPriority('normal').length },
    { value: 'low', label: 'Low', color: 'text-gray-600', count: getUnreadNotificationsByPriority('low').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unread' && !notification.is_read) ||
      (statusFilter === 'read' && notification.is_read);
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkAction = async (action: 'read' | 'delete' | 'archive') => {
    if (selectedNotifications.length === 0) return;

    try {
      switch (action) {
        case 'read':
          await bulkMarkAsRead(selectedNotifications);
          break;
        case 'delete':
          if (confirm(`Delete ${selectedNotifications.length} notifications?`)) {
            await Promise.all(selectedNotifications.map(id => dismissNotification(id)));
          }
          break;
        case 'archive':
          // Archive functionality would be implemented here
          alert('Archive functionality coming soon!');
          break;
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const getNotificationIcon = (type: string) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo?.icon || '🔔';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const groupedNotifications = groupByType ? groupNotificationsByType(filteredNotifications) : null;

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
              to={
                profile?.role === 'admin' ? '/admin-dashboard' :
                profile?.role === 'consultant' ? '/consultant-dashboard' :
                '/client-accounting'
              }
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-gray-600 mt-1">Manage all your notifications and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={refreshNotifications}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">
                  {getUnreadNotificationsByPriority('high').length + getUnreadNotificationsByPriority('urgent').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-blue-600">
                  {notifications.filter(n => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(n.created_at) > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Priority Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {priorityLevels.map((level) => (
              <div key={level.value} className={`p-4 rounded-lg border-l-4 ${
                level.value === 'urgent' ? 'border-l-red-500 bg-red-50' :
                level.value === 'high' ? 'border-l-orange-500 bg-orange-50' :
                level.value === 'normal' ? 'border-l-blue-500 bg-blue-50' :
                'border-l-gray-500 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${level.color}`}>{level.label}</p>
                    <p className="text-sm text-gray-600">{level.count} unread</p>
                  </div>
                  <div className={`text-2xl font-bold ${level.color}`}>
                    {level.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Notifications</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="normal">🔵 Normal</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setGroupByType(!groupByType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  groupByType 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Group by Type
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedNotifications.length} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('read')}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark as Read</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredNotifications.length} of {notifications.length} notifications</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={markAllAsRead}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Mark All as Read
              </button>
              <button
                onClick={() => cleanupOldNotifications(30)}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Clean Up Old
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                {notifications.length === 0 
                  ? "You don't have any notifications yet."
                  : "No notifications match your current filters."
                }
              </p>
            </div>
          ) : groupByType && groupedNotifications ? (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedNotifications).map(([type, typeNotifications]) => {
                const typeInfo = notificationTypes.find(t => t.value === type);
                
                return (
                  <div key={type} className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{typeInfo?.icon || '🔔'}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {typeInfo?.label || type} ({typeNotifications.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {typeNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                            getPriorityColor(notification.priority)
                          } ${!notification.is_read ? 'shadow-sm' : ''}`}
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowNotificationDetail(true);
                            if (!notification.is_read) markAsRead(notification.id);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                              <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification.id);
                              }}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                    !notification.is_read ? getPriorityColor(notification.priority) : 'border-l-gray-200 bg-white'
                  }`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    setShowNotificationDetail(true);
                    if (!notification.is_read) markAsRead(notification.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectNotification(notification.id);
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                        />
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${
                          !notification.is_read ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                          {notification.action_url && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600">Has action</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.action_url && (
                        <Link
                          to={notification.action_url}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg font-medium hover:bg-purple-100 transition-colors text-sm"
                        >
                          View
                        </Link>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 text-white p-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Mark All as Read</span>
            </button>
            <button
              onClick={() => cleanupOldNotifications(30)}
              className="bg-gray-600 text-white p-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Archive className="h-5 w-5" />
              <span>Clean Up Old</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-purple-600 text-white p-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Notification Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Notification Detail Modal */}
      {showNotificationDetail && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                <button
                  onClick={() => setShowNotificationDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <span className="text-3xl">{getNotificationIcon(selectedNotification.type)}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{selectedNotification.message}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">{selectedNotification.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedNotification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        selectedNotification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedNotification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedNotification.priority.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium">{selectedNotification.is_read ? 'Read' : 'Unread'}</p>
                    </div>
                  </div>

                  {selectedNotification.data && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Data</h4>
                      <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-auto">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedNotification.action_url && (
                  <Link
                    to={selectedNotification.action_url}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Take Action</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    dismissNotification(selectedNotification.id);
                    setShowNotificationDetail(false);
                  }}
                  className="bg-red-50 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;