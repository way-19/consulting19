import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getNotificationTemplate, formatNotificationContent, getNotificationPriorityScore } from '../components/notifications/NotificationTemplates';

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

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  frequency: 'all' | 'important' | 'minimal';
  quiet_hours: {
    enabled: boolean;
    start: number;
    end: number;
  };
  disabled_types: string[];
}

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    frequency: 'all',
    quiet_hours: { enabled: false, start: 22, end: 8 },
    disabled_types: []
  });

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${profile.id}`
          }, 
          (payload) => {
            console.log('Notification change received:', payload);
            fetchNotifications();
          }
        )
        .subscribe();

      // Fetch user preferences
      fetchNotificationPreferences();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile]);

  const fetchNotificationPreferences = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('Error fetching notification preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data.preferences || preferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Sort notifications by priority and date
      const sortedNotifications = (data || []).sort((a, b) => {
        const priorityDiff = getNotificationPriorityScore(b.priority) - getNotificationPriorityScore(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setNotifications(sortedNotifications);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
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
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const bulkMarkAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error);
    }
  };

  const updateNotificationPreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: profile?.id,
          preferences: updatedPreferences
        });

      if (error) throw error;
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };

  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    relatedTable?: string,
    relatedId?: string,
    actionUrl?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          priority,
          related_table: relatedTable,
          related_id: relatedId,
          action_url: actionUrl,
          is_read: false,
          data: null
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const createEnhancedNotification = async (
    userId: string,
    type: string,
    data: any,
    sendEmail: boolean = false
  ) => {
    try {
      const template = getNotificationTemplate(type);
      if (!template) {
        console.error('Unknown notification type:', type);
        return;
      }

      const content = formatNotificationContent(type, data);
      if (!content) return;

      // Create notification in database
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title: content.title,
          message: content.message,
          priority: content.priority,
          action_url: content.actionUrl,
          data,
          is_read: false
        }]);

      if (error) throw error;

      // Send email if enabled and template exists
      if (sendEmail && template.emailTemplate && preferences.email_enabled) {
        await sendEmailNotification(userId, type, data);
      }
    } catch (error) {
      console.error('Error creating enhanced notification:', error);
    }
  };

  const sendEmailNotification = async (userId: string, type: string, data: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          notification_type: type,
          data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  const getUnreadNotificationsByPriority = (priority: string) => {
    return notifications.filter(n => !n.is_read && n.priority === priority);
  };

  const cleanupOldNotifications = async (daysOld: number = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', profile?.id)
        .eq('is_read', true)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    bulkMarkAsRead,
    createNotification,
    createEnhancedNotification,
    updateNotificationPreferences,
    getNotificationsByType,
    getUnreadNotificationsByPriority,
    cleanupOldNotifications,
    refreshNotifications: fetchNotifications
  };
};

export default useNotifications;