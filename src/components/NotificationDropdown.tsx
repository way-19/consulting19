import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, MessageSquare, FileText, Calendar, Eye, Upload, Settings, Archive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../contexts/LanguageContext';
import { formatNotificationContent } from './notifications/NotificationTemplates';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  related_table?: string;
  related_id?: string;
  action_url?: string;
  expires_at?: string;
  created_at: string;
  data?: any;
  read_at?: string;
  dismissed_at?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    if (isOpen && profile?.id) {
      fetchNotifications();
    }
  }, [isOpen, profile]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', profile?.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          dismissed_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_requested':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'document_uploaded':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'message':
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'document_status':
      case 'document_approved':
      case 'document_rejected':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'task_assigned':
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'payment_received':
      case 'payment_confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deadline_reminder':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
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

    if (diffInSeconds < 60) return 'Şimdi';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quick Actions"
              >
                <Settings className="h-4 w-4 text-gray-500" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {t('notifications.markAllAsRead')}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {t(`notifications.unreadCount_${unreadCount === 1 ? 'one' : 'other'}`, { count: unreadCount })}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={() => {
                  // Navigate to notification center
                  window.location.href = '/notifications';
                }}
                className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>View All</span>
              </button>
              <button
                onClick={() => {
                  // Clean up old notifications
                  const oldNotifications = notifications.filter(n => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return n.is_read && new Date(n.created_at) < weekAgo;
                  });
                  
                  if (oldNotifications.length > 0) {
                    Promise.all(oldNotifications.map(n => dismissNotification(n.id)));
                  }
                }}
                className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors flex items-center space-x-1"
              >
                <Archive className="h-3 w-3" />
                <span>Clean Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                    !notification.is_read ? getPriorityColor(notification.priority) : 'border-l-gray-200 bg-white'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.is_read ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                        {notification.read_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Read: {formatTimeAgo(notification.read_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {notification.action_url && (
                        <div className="bg-purple-100 rounded-full p-1">
                          <Eye className="h-3 w-3 text-purple-600" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Dismiss notification"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => window.location.href = '/notifications'}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('notifications.viewAll')}
              </button>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{notifications.length} total</span>
                <span>•</span>
                <span>{unreadCount} unread</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;