import React, { useState } from 'react';
import { Bell, Mail, Clock, Volume2, VolumeX, Save, RefreshCw } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updateNotificationPreferences } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const notificationTypes = [
    { 
      type: 'document_uploaded', 
      label: 'Document Uploads', 
      description: 'When clients upload new documents',
      icon: '📄'
    },
    { 
      type: 'document_approved', 
      label: 'Document Approvals', 
      description: 'When your documents are approved',
      icon: '✅'
    },
    { 
      type: 'task_assigned', 
      label: 'Task Assignments', 
      description: 'When new tasks are assigned to you',
      icon: '📋'
    },
    { 
      type: 'payment_received', 
      label: 'Payment Notifications', 
      description: 'When payments are received',
      icon: '💰'
    },
    { 
      type: 'new_message', 
      label: 'New Messages', 
      description: 'When you receive new messages',
      icon: '💬'
    },
    { 
      type: 'deadline_reminder', 
      label: 'Deadline Reminders', 
      description: 'Reminders for upcoming deadlines',
      icon: '⏰'
    },
    { 
      type: 'system_maintenance', 
      label: 'System Updates', 
      description: 'System maintenance and updates',
      icon: '🔧'
    }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(localPreferences);
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationType = (type: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      disabled_types: prev.disabled_types.includes(type)
        ? prev.disabled_types.filter(t => t !== type)
        : [...prev.disabled_types, type]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.email_enabled}
                  onChange={(e) => setLocalPreferences(prev => ({ ...prev, email_enabled: e.target.checked }))}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localPreferences.push_enabled}
                  onChange={(e) => setLocalPreferences(prev => ({ ...prev, push_enabled: e.target.checked }))}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Frequency Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Frequency</h3>
            
            <div className="space-y-3">
              {[
                { value: 'all', label: 'All Notifications', description: 'Receive all notifications immediately' },
                { value: 'important', label: 'Important Only', description: 'Only high priority and urgent notifications' },
                { value: 'minimal', label: 'Minimal', description: 'Only critical notifications' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={localPreferences.frequency === option.value}
                    onChange={(e) => setLocalPreferences(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="quiet_hours_enabled"
                  checked={localPreferences.quiet_hours.enabled}
                  onChange={(e) => setLocalPreferences(prev => ({ 
                    ...prev, 
                    quiet_hours: { ...prev.quiet_hours, enabled: e.target.checked }
                  }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="quiet_hours_enabled" className="text-sm font-medium text-gray-700">
                  Enable quiet hours (no notifications during specified times)
                </label>
              </div>

              {localPreferences.quiet_hours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <select
                      value={localPreferences.quiet_hours.start}
                      onChange={(e) => setLocalPreferences(prev => ({ 
                        ...prev, 
                        quiet_hours: { ...prev.quiet_hours, start: parseInt(e.target.value) }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <select
                      value={localPreferences.quiet_hours.end}
                      onChange={(e) => setLocalPreferences(prev => ({ 
                        ...prev, 
                        quiet_hours: { ...prev.quiet_hours, end: parseInt(e.target.value) }
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
            
            <div className="space-y-3">
              {notificationTypes.map((notificationType) => (
                <div key={notificationType.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{notificationType.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{notificationType.label}</p>
                      <p className="text-sm text-gray-600">{notificationType.description}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!localPreferences.disabled_types.includes(notificationType.type)}
                    onChange={() => toggleNotificationType(notificationType.type)}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;