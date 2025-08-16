import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, ConsultantDocument, ConsultantBankDetails } from '../../lib/supabase';
import { logAdminAction } from '../../lib/logging';
import SearchFilterBar, { FilterOption } from '../../components/common/SearchFilterBar';
import useAdvancedSearch from '../../hooks/useAdvancedSearch';
import { 
  ArrowLeft, 
  Users, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Key,
  Copy,
  Send,
  FileText,
  CreditCard,
  Building
} from 'lucide-react';

interface UserWithStats extends Profile {
  client_count?: number;
  project_count?: number;
  total_revenue?: number;
  last_activity?: string;
}

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserWithStats | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{
    success: boolean;
    temporaryPassword?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    legacy_role: 'client' as 'admin' | 'consultant' | 'client',
    country: '',
    phone: ''
  });

  // Advanced search and filter configuration
  const searchConfig = {
    searchFields: ['full_name', 'email', 'phone'] as (keyof UserWithStats)[],
    filterFields: [
      {
        key: 'legacy_role' as keyof UserWithStats,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Roles' },
          { value: 'admin', label: 'Admin' },
          { value: 'consultant', label: 'Consultant' },
          { value: 'client', label: 'Client' }
        ]
      },
      {
        key: 'is_active' as keyof UserWithStats,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Status' },
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' }
        ]
      }
    ],
    sortFields: [
      { key: 'created_at' as keyof UserWithStats, label: 'Date Created', defaultOrder: 'desc' as const },
      { key: 'full_name' as keyof UserWithStats, label: 'Name', defaultOrder: 'asc' as const },
      { key: 'email' as keyof UserWithStats, label: 'Email', defaultOrder: 'asc' as const },
      { key: 'last_login_at' as keyof UserWithStats, label: 'Last Login', defaultOrder: 'desc' as const }
    ]
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData: filteredUsers,
    totalCount,
    filteredCount,
    hasActiveFilters
  } = useAdvancedSearch({
    data: users,
    config: searchConfig,
    initialSortBy: 'created_at',
    initialSortOrder: 'desc',
    initialFilters: { legacy_role: 'all', is_active: 'all' }
  });

  useEffect(() => {
    if (profile?.legacy_role === 'admin') {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          assigned_clients:clients!clients_assigned_consultant_id_fkey(count),
          client_projects:projects!projects_consultant_id_fkey(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich user data with additional stats
      const enrichedUsers = await Promise.all(
        (data || []).map(async (user) => {
          let additionalStats = {};

          if (user.legacy_role === 'consultant') {
            // Get consultant-specific stats
            const { data: clientCount } = await supabase
              .from('clients')
              .select('id', { count: 'exact', head: true })
              .eq('assigned_consultant_id', user.id);

            additionalStats = {
              client_count: clientCount || 0
            };
          } else if (user.legacy_role === 'client') {
            // Get client-specific stats
            const { data: projectCount } = await supabase
              .from('projects')
              .select('id', { count: 'exact', head: true })
              .eq('client_id', user.id);

            additionalStats = {
              project_count: projectCount || 0
            };
          }

          return {
            ...user,
            ...additionalStats
          } as UserWithStats;
        })
      );

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create auth user using Supabase Admin API (this would need to be done via Edge Function in production)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: newUserForm.email,
        password: newUserForm.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Get role ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', newUserForm.legacy_role)
        .single();

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          auth_user_id: authUser.user.id,
          email: newUserForm.email,
          role_id: role?.id,
          legacy_role: newUserForm.legacy_role,
          full_name: newUserForm.full_name,
          phone: newUserForm.phone,
          country: newUserForm.country,
          is_active: true
        }]);

      if (profileError) throw profileError;

      // Log admin action
      await logAdminAction('CREATE_USER', 'profiles', authUser.user.id, null, newUserForm);

      await fetchUsers();
      setShowAddUserModal(false);
      setNewUserForm({
        email: '',
        password: '',
        full_name: '',
        legacy_role: 'client',
        country: '',
        phone: ''
      });

      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + (error as Error).message);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<Profile>) => {
    try {
      const oldUser = users.find(u => u.id === userId);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction('UPDATE_USER', 'profiles', userId, oldUser, updates);

      await fetchUsers();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const userToDelete = users.find(u => u.id === userId);
      
      // Delete auth user (this will cascade to profile due to foreign key)
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete!.auth_user_id);
      
      if (authError) throw authError;

      // Log admin action
      await logAdminAction('DELETE_USER', 'profiles', userId, userToDelete, null);

      await fetchUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleResetPassword = async (user: UserWithStats) => {
    setResetPasswordUser(user);
    setResetPasswordResult(null);
    setShowPasswordResetModal(true);
  };

  const confirmPasswordReset = async () => {
    if (!resetPasswordUser) return;

    try {
      setResettingPassword(true);
      setResetPasswordResult(null);

      // Call the Edge Function for password reset
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: resetPasswordUser.id
        })
      });

      const result = await response.json();

      if (result.success) {
        setResetPasswordResult({
          success: true,
          temporaryPassword: result.temporaryPassword,
          message: `Password reset successfully for ${result.userName || result.userEmail}`
        });
        
        // Refresh user list to update any status changes
        await fetchUsers();
      } else {
        setResetPasswordResult({
          success: false,
          error: result.error || 'Failed to reset password'
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetPasswordResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const fetchConsultantDetails = async (consultantId: string) => {
    try {
      // Fetch consultant documents
      const { data: documents, error: docsError } = await supabase
        .from('consultant_documents')
        .select('*')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setConsultantDocuments(documents || []);

      // Fetch consultant bank details
      const { data: bankDetails, error: bankError } = await supabase
        .from('consultant_bank_details')
        .select('*')
        .eq('consultant_id', consultantId)
        .maybeSingle();

      if (bankError && bankError.code !== 'PGRST116') throw bankError;
      setConsultantBankDetails(bankDetails);

    } catch (error) {
      console.error('Error fetching consultant details:', error);
    }
  };

  const handleViewConsultantDetails = async (consultant: UserWithStats) => {
    setSelectedConsultantId(consultant.id);
    await fetchConsultantDetails(consultant.id);
    setShowConsultantDetails(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Temporary password copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Temporary password copied to clipboard!');
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
      case 'consultant': return <Users className="h-4 w-4" />;
      case 'client': return <UserPlus className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage platform users, roles, and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add User</span>
              </button>
              <button
                onClick={fetchUsers}
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-red-600">{users.filter(u => u.legacy_role === 'admin').length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultants</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => u.legacy_role === 'consultant').length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.legacy_role === 'client').length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users by name, email, or phone..."
          filters={[
            {
              key: 'legacy_role',
              label: 'Role',
              value: filters.legacy_role || 'all',
              options: searchConfig.filterFields[0].options!,
              onChange: (value) => setFilter('legacy_role', value),
              icon: Users
            },
            {
              key: 'is_active',
              label: 'Status',
              value: filters.is_active || 'all',
              options: searchConfig.filterFields[1].options!,
              onChange: (value) => setFilter('is_active', value)
            }
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortOptions={searchConfig.sortFields.map(field => ({
            value: field.key as string,
            label: field.label
          }))}
          onSortChange={setSortBy}
          onSortOrderChange={setSortOrder}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onClearFilters={clearFilters}
          onExport={() => {/* Export functionality */}}
          className="mb-8"
        />

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600 mb-6">No users match your current filters.</p>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Add First User
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-3">User Information</div>
                  <div className="col-span-2">Role & Status</div>
                  <div className="col-span-2">Contact Info</div>
                  <div className="col-span-2">Statistics</div>
                  <div className="col-span-2">Last Activity</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* User Information */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.full_name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'No Name'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>

                      {/* Role & Status */}
                      <div className="col-span-2">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.legacy_role)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.legacy_role)}`}>
                              {user.legacy_role.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-600">
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="col-span-2">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{user.phone}</span>
                            </div>
                          )}
                          {user.country && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{user.country}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="col-span-2">
                        <div className="space-y-1">
                          {user.legacy_role === 'consultant' && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Clients:</span> {user.client_count || 0}
                            </div>
                          )}
                          {user.legacy_role === 'client' && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Projects:</span> {user.project_count || 0}
                            </div>
                          )}
                          {user.total_revenue && (
                            <div className="text-xs text-green-600 font-medium">
                              Revenue: ${user.total_revenue.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-600">
                          {user.last_login_at ? (
                            <>
                              <span className="font-medium">Last login:</span><br />
                              {new Date(user.last_login_at).toLocaleDateString()}
                            </>
                          ) : (
                            <span className="text-gray-400">Never logged in</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={newUserForm.legacy_role}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, legacy_role: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="client">Client</option>
                    <option value="consultant">Consultant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newUserForm.country}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Georgia"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail/Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'User Details'} - {selectedUser.full_name || selectedUser.email}
                </h2>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                    setEditingUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <p className="font-medium">{selectedUser.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.legacy_role)}`}>
                        {selectedUser.legacy_role.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Country:</span>
                      <p className="font-medium">{selectedUser.country || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Language:</span>
                      <p className="font-medium">{selectedUser.language_preference}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Timezone:</span>
                      <p className="font-medium">{selectedUser.timezone}</p>
                    </div>
                    {user.legacy_role === 'consultant' && (
                      <button
                        onClick={() => handleViewConsultantDetails(user)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Consultant Details"
                      >
                        <Building className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {(selectedUser.legacy_role === 'consultant' || selectedUser.legacy_role === 'client') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedUser.legacy_role === 'consultant' && (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-600 font-medium">Assigned Clients</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedUser.client_count || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-700">${(selectedUser.total_revenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                          <p className="text-2xl font-bold text-purple-700">98.5%</p>
                        </div>
                      </>
                    )}
                    {selectedUser.legacy_role === 'client' && (
                      <>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-600 font-medium">Active Projects</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedUser.project_count || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600 font-medium">Completed Services</p>
                          <p className="text-2xl font-bold text-green-700">5</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-purple-600 font-medium">Satisfaction</p>
                          <p className="text-2xl font-bold text-purple-700">4.8/5</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateUser(selectedUser.id, { is_active: !selectedUser.is_active })}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedUser.is_active 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {selectedUser.is_active ? (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <span>Deactivate User</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Activate User</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {/* Reset password functionality */}}
                  className="bg-yellow-50 text-yellow-600 px-6 py-3 rounded-lg font-medium hover:bg-yellow-100 transition-colors flex items-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="bg-red-50 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete User</span>
                </button>
                <button
                  onClick={() => handleResetPassword(selectedUser)}
                  className="bg-orange-50 text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                >
                  <Key className="h-5 w-5" />
                  <span>Reset Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setResetPasswordUser(null);
                    setResetPasswordResult(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!resetPasswordResult ? (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Reset Password for {resetPasswordUser.full_name || resetPasswordUser.email}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      This will generate a new temporary password for the user. 
                      The user will need to change it on their next login.
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Important</h4>
                    </div>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• A secure temporary password will be generated</li>
                      <li>• The user's current password will be invalidated</li>
                      <li>• You should share the new password securely with the user</li>
                      <li>• This action will be logged for security audit</li>
                    </ul>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setShowPasswordResetModal(false);
                        setResetPasswordUser(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPasswordReset}
                      disabled={resettingPassword}
                      className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {resettingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-5 w-5" />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {resetPasswordResult.success ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Password Reset Successful
                      </h3>
                      <p className="text-green-700 text-sm mb-4">
                        {resetPasswordResult.message}
                      </p>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
                        <h4 className="font-medium text-green-900 mb-2">Temporary Password</h4>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono text-gray-900">
                            {resetPasswordResult.temporaryPassword}
                          </code>
                          <button
                            onClick={() => copyToClipboard(resetPasswordResult.temporaryPassword!)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          Please share this password securely with the user. They should change it on their next login.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowPasswordResetModal(false);
                          setResetPasswordUser(null);
                          setResetPasswordResult(null);
                        }}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Password Reset Failed
                      </h3>
                      <p className="text-red-700 text-sm mb-4">
                        {resetPasswordResult.error}
                      </p>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setShowPasswordResetModal(false);
                            setResetPasswordUser(null);
                            setResetPasswordResult(null);
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            setResetPasswordResult(null);
                          }}
                          className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consultant Details Modal */}
      {showConsultantDetails && selectedConsultantId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Consultant Details</h2>
                <button
                  onClick={() => {
                    setShowConsultantDetails(false);
                    setSelectedConsultantId(null);
                    setConsultantDocuments([]);
                    setConsultantBankDetails(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Documents Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Documents</span>
                </h3>
                
                {consultantDocuments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consultantDocuments.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.file_name}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Type: {doc.document_type}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  doc.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.status.toUpperCase()}
                                </span>
                                <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                {doc.file_size && (
                                  <span>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                )}
                              </div>
                              {doc.expiry_date && (
                                <p className="text-xs text-gray-500">
                                  Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                                </p>
                              )}
                              {doc.notes && (
                                <p className="text-xs text-gray-600 mt-1">Notes: {doc.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>View</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Banking Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Banking Information</span>
                </h3>
                
                {!consultantBankDetails ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No banking information provided</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-900 mb-3">Bank Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-green-700 font-medium">Bank Name:</span>
                            <p className="text-green-800">{consultantBankDetails.bank_name}</p>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">Account Holder:</span>
                            <p className="text-green-800">{consultantBankDetails.account_holder_name}</p>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">Currency:</span>
                            <p className="text-green-800">{consultantBankDetails.currency}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-green-900 mb-3">Account Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-green-700 font-medium">Account Number:</span>
                            <p className="text-green-800 font-mono">***{consultantBankDetails.account_number.slice(-4)}</p>
                          </div>
                          {consultantBankDetails.iban && (
                            <div>
                              <span className="text-green-700 font-medium">IBAN:</span>
                              <p className="text-green-800 font-mono">***{consultantBankDetails.iban.slice(-4)}</p>
                            </div>
                          )}
                          {consultantBankDetails.swift_code && (
                            <div>
                              <span className="text-green-700 font-medium">SWIFT:</span>
                              <p className="text-green-800">{consultantBankDetails.swift_code}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {consultantBankDetails.notes && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <span className="text-green-700 font-medium">Notes:</span>
                        <p className="text-green-800 text-sm mt-1">{consultantBankDetails.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-green-200 text-xs text-green-600">
                      Last updated: {new Date(consultantBankDetails.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;