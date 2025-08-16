import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Globe, 
  Bell,
  Settings,
  LogOut,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  country?: string;
  avatar_url?: string;
  legacy_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MyProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    country: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || ''
      });
    }
    setLoading(false);
  }, [profile]);

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          country: editForm.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id);

      if (error) throw error;

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        phone: editForm.phone,
        country: editForm.country,
        updated_at: new Date().toISOString()
      } : null);

      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditForm({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        country: profileData.country || ''
      });
    }
    setEditing(false);
    setMessage(null);
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'consultant': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'consultant': return <User className="h-4 w-4" />;
      case 'client': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'admin': return '/admin-dashboard';
      case 'consultant': return '/consultant-dashboard';
      case 'client': return '/client-accounting';
      default: return '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={getDashboardLink(profileData.legacy_role)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {(profileData.full_name || profileData.email)[0].toUpperCase()}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {profileData.full_name || 'No Name Set'}
                </h3>
                
                <p className="text-gray-600 mb-4">{profileData.email}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {getRoleIcon(profileData.legacy_role)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData.legacy_role)}`}>
                    {profileData.legacy_role.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className={`w-2 h-2 rounded-full ${profileData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {profileData.is_active ? 'Active Account' : 'Inactive Account'}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/notifications"
                    className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={editing ? editForm.full_name : (profileData.full_name || 'Not set')}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!editing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                        editing ? 'focus:ring-2 focus:ring-purple-500 focus:border-transparent' : 'bg-gray-50 text-gray-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={editing ? editForm.phone : (profileData.phone || 'Not set')}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                        editing ? 'focus:ring-2 focus:ring-purple-500 focus:border-transparent' : 'bg-gray-50 text-gray-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={editing ? editForm.country : (profileData.country || 'Not set')}
                      onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!editing}
                      className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                        editing ? 'focus:ring-2 focus:ring-purple-500 focus:border-transparent' : 'bg-gray-50 text-gray-500'
                      }`}
                      placeholder="Enter your country"
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.legacy_role.charAt(0).toUpperCase() + profileData.legacy_role.slice(1)}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={new Date(profileData.created_at).toLocaleDateString()}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/notifications"
                  className="w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notification Center</span>
                </Link>

                <Link
                  to={getDashboardLink(profileData.legacy_role)}
                  className="w-full bg-purple-50 text-purple-600 px-4 py-3 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2"
                >
                  <Settings className="h-5 w-5" />
                  <span>Go to Dashboard</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profileData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Account Type</span>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(profileData.legacy_role)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profileData.legacy_role)}`}>
                      {profileData.legacy_role.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Last Updated</span>
                  <span className="text-sm text-gray-600">
                    {new Date(profileData.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;