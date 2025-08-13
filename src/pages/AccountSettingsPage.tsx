import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  Building,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  Download,
  Trash2,
  Settings,
  RefreshCw
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AccountingProfile {
  id: string;
  company_name: string;
  tax_number?: string;
  business_type: string;
  service_package: string;
  monthly_fee: number;
  preferred_language?: string;
  reminder_frequency: number;
}

const AccountSettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accountingProfile, setAccountingProfile] = useState<AccountingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    country: '',
    company_name: '',
    tax_number: '',
    preferred_language: 'en'
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    reminder_frequency: 7,
    preferred_language: 'en',
    timezone: 'UTC'
  });

  useEffect(() => {
    if (profile?.id) {
      fetchUserData();
    }
  }, [profile]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile?.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Set profile form data
      setProfileForm({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        country: profileData.country || '',
        company_name: '',
        tax_number: '',
        preferred_language: 'en'
      });

      // Fetch accounting profile if exists
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (clientData) {
        const { data: accountingData } = await supabase
          .from('accounting_clients')
          .select('*')
          .eq('client_id', clientData.id)
          .single();

        if (accountingData) {
          setAccountingProfile(accountingData);
          setProfileForm(prev => ({
            ...prev,
            company_name: accountingData.company_name || '',
            tax_number: accountingData.tax_number || '',
            preferred_language: accountingData.preferred_language || 'en'
          }));
          setPreferences(prev => ({
            ...prev,
            reminder_frequency: accountingData.reminder_frequency || 7,
            preferred_language: accountingData.preferred_language || 'en'
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          country: profileForm.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      // Update accounting profile if exists
      if (accountingProfile) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (clientData) {
          const { error: accountingError } = await supabase
            .from('accounting_clients')
            .update({
              company_name: profileForm.company_name,
              tax_number: profileForm.tax_number,
              preferred_language: profileForm.preferred_language,
              updated_at: new Date().toISOString()
            })
            .eq('client_id', clientData.id);

          if (accountingError) throw accountingError;
        }
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Update accounting preferences if accounting profile exists
      if (accountingProfile) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (clientData) {
          const { error } = await supabase
            .from('accounting_clients')
            .update({
              reminder_frequency: preferences.reminder_frequency,
              preferred_language: preferences.preferred_language,
              updated_at: new Date().toISOString()
            })
            .eq('client_id', clientData.id);

          if (error) throw error;
        }
      }

      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const countries = [
    'Georgia', 'United States', 'Montenegro', 'Estonia', 'Portugal', 
    'Malta', 'Panama', 'UAE', 'Switzerland', 'Spain', 'Turkey', 'Other'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ka', name: 'ქართული (Georgian)' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' }
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
              to="/client-accounting"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your profile, security, and preferences</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Account</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <nav className="space-y-2">
                {[
                  { key: 'profile', label: 'Profile Information', icon: User },
                  { key: 'security', label: 'Security', icon: Lock },
                  { key: 'preferences', label: 'Preferences', icon: Settings },
                  { key: 'billing', label: 'Billing Info', icon: CreditCard }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.key
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                      <p className="text-gray-600">Update your personal and company information</p>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.full_name}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your full name"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="email"
                                value={userProfile?.email || ''}
                                disabled
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                placeholder="Email cannot be changed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <select
                                value={profileForm.country}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                  <option key={country} value={country}>{country}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Company Information */}
                      {accountingProfile && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                              </label>
                              <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                  type="text"
                                  value={profileForm.company_name}
                                  onChange={(e) => setProfileForm(prev => ({ ...prev, company_name: e.target.value }))}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Your company name"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Number
                              </label>
                              <input
                                type="text"
                                value={profileForm.tax_number}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, tax_number: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Tax identification number"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={fetchUserData}
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="h-5 w-5" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                      <p className="text-gray-600">Manage your account security and password</p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter new password"
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Confirm new password"
                                minLength={6}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Security Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Use a strong, unique password</li>
                          <li>• Include uppercase, lowercase, numbers, and symbols</li>
                          <li>• Don't reuse passwords from other accounts</li>
                          <li>• Consider using a password manager</li>
                        </ul>
                      </div>

                      <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving || !passwordForm.newPassword || !passwordForm.confirmPassword}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-5 w-5" />
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
                      <p className="text-gray-600">Customize your experience and notifications</p>
                    </div>

                    <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                      {/* Language Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Preferred Language
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <select
                                value={preferences.preferred_language}
                                onChange={(e) => setPreferences(prev => ({ ...prev, preferred_language: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                {languages.map(lang => (
                                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Timezone
                            </label>
                            <select
                              value={preferences.timezone}
                              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="UTC">UTC (Coordinated Universal Time)</option>
                              <option value="America/New_York">Eastern Time (ET)</option>
                              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                              <option value="Europe/Istanbul">Turkey Time (TRT)</option>
                              <option value="Asia/Tbilisi">Georgia Time (GET)</option>
                              <option value="Europe/Zurich">Central European Time (CET)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Notification Preferences */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Bell className="h-5 w-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive updates via email</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.email_notifications}
                                onChange={(e) => setPreferences(prev => ({ ...prev, email_notifications: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">SMS Notifications</p>
                                <p className="text-sm text-gray-600">Receive urgent updates via SMS</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences.sms_notifications}
                                onChange={(e) => setPreferences(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reminder Frequency (days)
                            </label>
                            <select
                              value={preferences.reminder_frequency}
                              onChange={(e) => setPreferences(prev => ({ ...prev, reminder_frequency: parseInt(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value={1}>Daily</option>
                              <option value={3}>Every 3 days</option>
                              <option value={7}>Weekly</option>
                              <option value={14}>Bi-weekly</option>
                              <option value={30}>Monthly</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              <span>Save Preferences</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Information</h2>
                      <p className="text-gray-600">View your current service package and billing details</p>
                    </div>

                    {accountingProfile ? (
                      <div className="space-y-6">
                        {/* Current Package */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Service Package</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-600">Package Type</p>
                              <p className="text-xl font-bold text-purple-600">
                                {accountingProfile.service_package.charAt(0).toUpperCase() + accountingProfile.service_package.slice(1)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Monthly Fee</p>
                              <p className="text-xl font-bold text-green-600">
                                ${accountingProfile.monthly_fee.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Business Type</p>
                              <p className="font-medium text-gray-900">
                                {accountingProfile.business_type.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Billing Period</p>
                              <p className="font-medium text-gray-900">Monthly</p>
                            </div>
                          </div>
                        </div>

                        {/* Package Features */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Package Features</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              'Monthly bookkeeping',
                              'Tax preparation',
                              'Financial reporting',
                              'Email support',
                              'Document management',
                              'Compliance monitoring'
                            ].map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Upgrade Options */}
                        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                          <h4 className="font-semibold text-yellow-900 mb-2">Need More Features?</h4>
                          <p className="text-sm text-yellow-800 mb-4">
                            Contact your consultant to upgrade your service package or add additional services.
                          </p>
                          <Link
                            to="/client-services"
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors inline-flex items-center space-x-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>View Additional Services</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Billing Information</h3>
                        <p className="text-gray-600 mb-6">You don't have an active accounting service yet.</p>
                        <Link
                          to="/client-services"
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Browse Services
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;