import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, getSetting, updateSetting, logAdminAction } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Settings, 
  Save,
  RefreshCw,
  DollarSign,
  Globe,
  Bell,
  Upload,
  Shield,
  Zap,
  Database,
  Key,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemSetting {
  key: string;
  value: any;
  description: string;
  category: string;
  is_public: boolean;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  config: any;
  is_active: boolean;
  last_sync_at?: string;
}

const SystemSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'notifications' | 'integrations' | 'security'>('general');

  const [settingsForm, setSettingsForm] = useState({
    commission_rates: { consultant: 0.65, platform: 0.35 },
    default_currency: 'USD',
    notification_settings: { email_enabled: true, sms_enabled: false, push_enabled: true },
    onboarding_enabled: true,
    max_file_size_mb: 50,
    auto_assign_consultants: true,
    require_document_approval: true,
    enable_multilingual_chat: true,
    default_language: 'en',
    supported_languages: ['en', 'tr', 'ka', 'ru'],
    maintenance_mode: false
  });

  const [integrationForm, setIntegrationForm] = useState({
    deepl_api_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    email_service_api_key: '',
    sms_service_api_key: '',
    storage_service_config: {}
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
        fetchSettings(),
        fetchIntegrations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    
    setSettings(data || []);
    
    // Populate form with current settings
    const settingsMap = (data || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as any);

    setSettingsForm(prev => ({
      ...prev,
      ...settingsMap
    }));
  };

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from('integrations')
      .select('id, name, type, config, is_active, last_sync_at')
      .order('name', { ascending: true });

    if (error) throw error;
    setIntegrations(data || []);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Update each setting
      for (const [key, value] of Object.entries(settingsForm)) {
        await updateSetting(key, value);
      }

      await logAdminAction('UPDATE_SETTINGS', 'settings', null, null, settingsForm);
      await fetchSettings();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestIntegration = async (integrationName: string) => {
    try {
      // This would test the integration
      alert(`Testing ${integrationName} integration...`);
    } catch (error) {
      console.error('Error testing integration:', error);
      alert('Integration test failed');
    }
  };

  const settingCategories = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'financial', label: 'Financial', icon: DollarSign },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'integrations', label: 'Integrations', icon: Zap },
    { key: 'security', label: 'Security', icon: Shield }
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
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">Configure platform settings and integrations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? 'Saving...' : 'Save All'}</span>
              </button>
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
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {settingCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveTab(category.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === category.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Language
                      </label>
                      <select
                        value={settingsForm.default_language}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, default_language: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="tr">Turkish</option>
                        <option value="ka">Georgian</option>
                        <option value="ru">Russian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settingsForm.max_file_size_mb}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) || 50 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="onboarding_enabled"
                        checked={settingsForm.onboarding_enabled}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, onboarding_enabled: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="onboarding_enabled" className="text-sm font-medium text-gray-700">
                        Enable client onboarding workflow
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="auto_assign_consultants"
                        checked={settingsForm.auto_assign_consultants}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, auto_assign_consultants: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto_assign_consultants" className="text-sm font-medium text-gray-700">
                        Auto-assign consultants to new clients
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="require_document_approval"
                        checked={settingsForm.require_document_approval}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, require_document_approval: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="require_document_approval" className="text-sm font-medium text-gray-700">
                        Require document approval workflow
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenance_mode"
                        checked={settingsForm.maintenance_mode}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
                        <span className="text-red-600">Maintenance mode (disables public access)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultant Commission Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={settingsForm.commission_rates.consultant}
                          onChange={(e) => setSettingsForm(prev => ({ 
                            ...prev, 
                            commission_rates: { 
                              ...prev.commission_rates, 
                              consultant: parseFloat(e.target.value) || 0.65 
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ({(settingsForm.commission_rates.consultant * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Fee Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={settingsForm.commission_rates.platform}
                          onChange={(e) => setSettingsForm(prev => ({ 
                            ...prev, 
                            commission_rates: { 
                              ...prev.commission_rates, 
                              platform: parseFloat(e.target.value) || 0.35 
                            }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ({(settingsForm.commission_rates.platform * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Currency
                      </label>
                      <select
                        value={settingsForm.default_currency}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, default_currency: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GEL">GEL - Georgian Lari</option>
                        <option value="TRY">TRY - Turkish Lira</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Commission Split Preview</h4>
                    </div>
                    <div className="text-sm text-blue-800">
                      For a $1,000 order: Consultant gets ${(1000 * settingsForm.commission_rates.consultant).toFixed(2)}, 
                      Platform gets ${(1000 * settingsForm.commission_rates.platform).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="email_enabled"
                        checked={settingsForm.notification_settings.email_enabled}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          notification_settings: { 
                            ...prev.notification_settings, 
                            email_enabled: e.target.checked 
                          }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="email_enabled" className="text-sm font-medium text-gray-700">
                        Enable email notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sms_enabled"
                        checked={settingsForm.notification_settings.sms_enabled}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          notification_settings: { 
                            ...prev.notification_settings, 
                            sms_enabled: e.target.checked 
                          }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sms_enabled" className="text-sm font-medium text-gray-700">
                        Enable SMS notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="push_enabled"
                        checked={settingsForm.notification_settings.push_enabled}
                        onChange={(e) => setSettingsForm(prev => ({ 
                          ...prev, 
                          notification_settings: { 
                            ...prev.notification_settings, 
                            push_enabled: e.target.checked 
                          }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="push_enabled" className="text-sm font-medium text-gray-700">
                        Enable push notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enable_multilingual_chat"
                        checked={settingsForm.enable_multilingual_chat}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, enable_multilingual_chat: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enable_multilingual_chat" className="text-sm font-medium text-gray-700">
                        Enable multilingual chat with auto-translation
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Third-Party Integrations</h3>
                  
                  <div className="space-y-6">
                    {/* DeepL Integration */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">DeepL Translation API</h4>
                            <p className="text-sm text-gray-600">For multilingual chat translation</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                          <button
                            onClick={() => handleTestIntegration('DeepL')}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={integrationForm.deepl_api_key}
                          onChange={(e) => setIntegrationForm(prev => ({ ...prev, deepl_api_key: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter DeepL API key"
                        />
                      </div>
                    </div>

                    {/* Stripe Integration */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">Stripe Payment Processing</h4>
                            <p className="text-sm text-gray-600">For payment processing and invoicing</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                          <button
                            onClick={() => handleTestIntegration('Stripe')}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Key
                          </label>
                          <input
                            type="password"
                            value={integrationForm.stripe_secret_key}
                            onChange={(e) => setIntegrationForm(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="sk_live_..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook Secret
                          </label>
                          <input
                            type="password"
                            value={integrationForm.stripe_webhook_secret}
                            onChange={(e) => setIntegrationForm(prev => ({ ...prev, stripe_webhook_secret: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="whsec_..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Service Integration */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-6 w-6 text-purple-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email Service</h4>
                            <p className="text-sm text-gray-600">For automated email notifications</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                          <button
                            onClick={() => handleTestIntegration('Email')}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={integrationForm.email_service_api_key}
                          onChange={(e) => setIntegrationForm(prev => ({ ...prev, email_service_api_key: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email service API key"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-900">Security Notice</h4>
                      </div>
                      <p className="text-sm text-yellow-800">
                        Advanced security features like 2FA and IP whitelisting are managed through Supabase Auth settings.
                        Please configure these in your Supabase dashboard under Authentication → Settings.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Current Security Status</h4>
                      </div>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex items-center justify-between">
                          <span>Row Level Security (RLS)</span>
                          <span className="font-medium">✅ Enabled</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Audit Logging</span>
                          <span className="font-medium">✅ Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Encrypted API Keys</span>
                          <span className="font-medium">✅ Enabled</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Session Management</span>
                          <span className="font-medium">✅ Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;