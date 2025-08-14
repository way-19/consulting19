import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, logAdminAction } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
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
  CheckCircle
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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    legacy_role: 'client' as 'admin' | 'consultant' | 'client',
    country: '',
    phone: ''
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.legacy_role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="consultant">Consultant</option>
                <option value="client">Client</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <button
              onClick={() => {/* Export functionality */}}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;