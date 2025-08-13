import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MultilingualChat from '../components/MultilingualChat';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings, 
  Star, 
  Award, 
  Calculator, 
  CreditCard, 
  Globe, 
  Globe2,
  X,
  Save,
  Download,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
  Building,
  Shield,
  Mail
interface AssignedClient {
  id: string;
  profile_id: string;
  company_name?: string;
  status: string;
  priority: string;
  progress: number;
  created_at: string;
  profile?: {
    email: string;
    full_name?: string;
    country?: string;
  };
}

interface MeetingFormData {
  client_id: string;
  title: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow_up' | 'document_review' | 'planning';
  notes: string;
}

interface ReportFormData {
  client_id: string;
  report_type: 'monthly' | 'project_status' | 'financial' | 'compliance';
  period_start: string;
  period_end: string;
  include_financials: boolean;
  include_tasks: boolean;
  include_documents: boolean;
}

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  specializations: string[];
  languages: string[];
}
const ConsultantDashboard = () => {
  const { user, profile } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState<'admin-consultant' | 'consultant-client'>('admin-consultant');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [meetingForm, setMeetingForm] = useState<MeetingFormData>({
    client_id: '',
    title: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });

  const [reportForm, setReportForm] = useState<ReportFormData>({
    client_id: '',
    report_type: 'monthly',
    period_start: '',
    period_end: '',
    include_financials: true,
    include_tasks: true,
    include_documents: true
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    bio: '',
   specializations: ['Company Formation', 'Tax Consulting'],
   currentPassword: '',
   newPassword: '',
   confirmPassword: '',
   emailNotifications: true,
   smsNotifications: false,
   clientMessageAlerts: true,
   workingHoursStart: '09:00',
   workingHoursEnd: '18:00',
   timezone: 'Asia/Tbilisi',
  preferredLanguage: 'en',
    languages: ['English', 'Turkish', 'Georgian']
  });
  useEffect(() => {
    if (profile?.id) {
      fetchAssignedClients();
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: '',
        country: profile.country || 'Georgia',
        bio: '',
        specializations: ['Company Formation', 'Tax Consulting'],
        languages: ['English', 'Turkish', 'Georgian']
      });
    }
  }, [profile]);
  const fetchAssignedClients = async () => {
    try {
      setLoadingClients(true);
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          profile_id,
          assigned_consultant_id,
          company_name,
          status,
          priority,
          progress,
          created_at,
          profile:profile_id (
            id,
            email,
            full_name,
            country
          )
        `)
        .eq('assigned_consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assigned clients:', error);
      } else {
        setAssignedClients(data || []);
      }
    } catch (error) {
      console.error('Error in fetchAssignedClients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In real implementation, this would save to database
      console.log('Scheduling meeting:', meetingForm);
      alert('Meeting scheduled successfully! Client will be notified.');
      setShowMeetingModal(false);
      setMeetingForm({
        client_id: '',
        title: '',
        date: '',
        time: '',
        type: 'consultation',
        notes: ''
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In real implementation, this would generate and save report
      console.log('Generating report:', reportForm);
      
      // Simulate report generation
      const reportData = {
        id: Date.now().toString(),
        client_id: reportForm.client_id,
        type: reportForm.report_type,
        period: `${reportForm.period_start} to ${reportForm.period_end}`,
        generated_at: new Date().toISOString(),
        consultant_id: profile?.id
      };
      
      // Create downloadable report (mock)
      const reportContent = `
CONSULTANT REPORT
================

Report Type: ${reportForm.report_type.toUpperCase()}
Period: ${reportForm.period_start} to ${reportForm.period_end}
Generated: ${new Date().toLocaleString()}
Consultant: ${profile?.full_name || profile?.email}

Client Information:
${assignedClients.find(c => c.id === reportForm.client_id)?.company_name || 'Selected Client'}

Report Sections:
${reportForm.include_financials ? '✓ Financial Summary' : '✗ Financial Summary'}
${reportForm.include_tasks ? '✓ Task Progress' : '✗ Task Progress'}
${reportForm.include_documents ? '✓ Document Status' : '✗ Document Status'}

This is a sample report. In production, this would contain real data.
      `;
      
      // Download report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportForm.report_type}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Report generated and downloaded successfully!');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
     // Validate password change if provided
     if (settingsData.newPassword) {
       if (settingsData.newPassword !== settingsData.confirmPassword) {
         alert('New passwords do not match');
         return;
       }
       
       if (settingsData.newPassword.length < 8) {
         alert('Password must be at least 8 characters long');
         return;
       }
       
       if (!settingsData.currentPassword) {
         alert('Please enter your current password');
         return;
       }
     }

      // In real implementation, this would update profile in database
      console.log('Updating profile:', profileForm);
      alert('Profile updated successfully!');
     // Update password if provided
     if (settingsData.newPassword && settingsData.currentPassword) {
       // In real implementation, this would call Supabase auth.updateUser
       console.log('Password change requested');
     }
     
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Filter clients for report modal
  const filteredClientsForReport = assignedClients.filter(client => {
    const matchesSearch = 
      (client.company_name?.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
      (client.profile?.full_name?.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
      (client.profile?.email?.toLowerCase().includes(clientSearchTerm.toLowerCase()));
    
    const matchesStatus = 
      clientStatusFilter === 'all' ||
      (clientStatusFilter === 'high_priority' && (client.priority === 'high' || client.priority === 'urgent')) ||
      client.status === clientStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      name: 'Active Clients',
      value: assignedClients.filter(c => c.status === 'in_progress').length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
      description: 'Currently active clients'
    },
    {
      name: 'Completed Projects',
      value: assignedClients.filter(c => c.status === 'completed').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
      description: 'Successfully completed'
    },
    {
      name: 'Total Clients',
      value: assignedClients.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+2.1%',
      changeType: 'positive',
      description: 'All assigned clients'
    },
    {
      name: 'Avg Response Time',
      value: '2.3h',
      icon: Clock,
      color: 'bg-orange-500',
      change: '-15min',
      changeType: 'positive',
      description: 'Average response time'
    }
  ];

  const upcomingTasks = [
    { 
      id: 1, 
      task: 'Client consultation call', 
      time: '10:00 AM', 
      client: 'Tech Startup LLC',
      type: 'meeting',
      priority: 'high'
    },
    { 
      id: 2, 
      task: 'Document review', 
      time: '2:30 PM', 
      client: 'Global Trading Co.',
      type: 'review',
      priority: 'medium'
    },
    { 
      id: 3, 
      task: 'Bank account setup', 
      time: '4:00 PM', 
      client: 'Investment Fund',
      type: 'setup',
      priority: 'high'
    },
    { 
      id: 4, 
      task: 'Follow-up email', 
      time: '5:30 PM', 
      client: 'E-commerce Ltd.',
      type: 'communication',
      priority: 'low'
    }
  ];

  const quickActions = [
    { 
      name: 'Schedule Meeting', 
      icon: Calendar, 
      color: 'bg-green-500 hover:bg-green-600', 
      description: 'Book consultation',
      action: () => setShowMeetingModal(true)
    },
    { 
      name: 'Generate Report', 
      icon: FileText, 
      color: 'bg-purple-500 hover:bg-purple-600', 
      description: 'Create client report',
      action: () => setShowReportModal(true)
    },
    { 
      name: 'Admin Chat', 
      icon: MessageSquare, 
      color: 'bg-blue-500 hover:bg-blue-600', 
      description: 'Message with admin',
      action: () => {
        setChatType('admin-consultant');
        setIsChatOpen(true);
      }
    },
    { 
      name: 'Client Messages', 
      icon: Users, 
      color: 'bg-indigo-500 hover:bg-indigo-600', 
      description: 'Messages from clients',
      action: () => {
        setChatType('consultant-client');
        setIsChatOpen(true);
      }
    },
    { 
      name: 'View Analytics', 
      icon: TrendingUp, 
      color: 'bg-indigo-500 hover:bg-indigo-600', 
      description: 'Performance metrics',
      action: () => setShowAnalyticsModal(true)
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      color: 'bg-gray-500 hover:bg-gray-600', 
      description: 'Account settings',
      action: () => setShowSettingsModal(true)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/image.png" 
                alt="Consulting19 Logo" 
                className="h-16 w-32"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe2 className="h-16 w-32 text-purple-600 hidden" />
              <div>
                <p className="text-sm text-gray-500">Professional Consultant Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Online</span>
              </div>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                {profile?.role || 'consultant'} • Georgia Specialist
              </span>
            </div>
          </div>
          
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.full_name || profile?.email || user?.email || 'Consultant'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg border border-purple-200">
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <Link 
              to="/consultant-services"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>My Services</span>
            </Link>
            <Link 
              to="/legacy-orders"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Legacy Orders</span>
            </Link>
            <Link 
              to="/accounting-management"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Calculator className="h-4 w-4" />
              <span>Accounting Management</span>
            </Link>
            <Link 
              to="/customers-management"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Customer Management</span>
            </Link>
            <Link 
              to="/consultant-payments"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </Link>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Globe className="h-4 w-4" />
              <Link to="/site-management">Site Management</Link>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Recent Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Clients</h2>
              <Link 
                to="/customers-management"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {loadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : assignedClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Clients</h3>
                  <p className="text-gray-600">No clients have been assigned to you yet.</p>
                  <button 
                    onClick={fetchAssignedClients}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedClients.slice(0, 5).map((client) => (
                    <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {client.company_name || client.profile?.full_name || client.profile?.email}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              client.priority === 'high' ? 'bg-red-100 text-red-700' :
                              client.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {client.priority} Priority
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Email: {client.profile?.email}</p>
                            <p>Country: {client.profile?.country || 'Georgia'}</p>
                            <p>Status: {client.status}</p>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    client.progress === 100 ? 'bg-green-500' :
                                    client.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${client.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{client.progress}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            client.status === 'completed' ? 'bg-green-100 text-green-800' :
                            client.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Debug Info */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">System Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">User:</span>
                  <p className="text-blue-600">{user?.email || 'No user'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Profile:</span>
                  <p className="text-blue-600">{profile ? `${profile.email} (${profile.role})` : 'No profile'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Assigned Clients:</span>
                  <p className="text-blue-600">{assignedClients.length}</p>
                </div>
              </div>
              <button 
                onClick={fetchAssignedClients}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Clients
              </button>
            </div>

            {/* Enhanced Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.task}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.client}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-purple-600 font-medium">{task.time}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                            task.type === 'review' ? 'bg-green-100 text-green-700' :
                            task.type === 'setup' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index} 
                      onClick={action.action}
                      className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md group cursor-pointer`}
                    >
                      <action.icon className="h-5 w-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-medium">{action.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">This Month</h3>
                <Award className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">New Clients</span>
                  <span className="font-bold">{assignedClients.filter(c => c.status === 'new').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Revenue</span>
                  <span className="font-bold">$47,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    <span className="font-bold">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Chat Modal */}
      <MultilingualChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatType={chatType}
        currentUserId={profile?.id || 'consultant-1'}
        currentUserRole="consultant"
      />

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  required
                  value={meetingForm.client_id}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
                  {assignedClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.profile?.full_name || client.profile?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Initial Consultation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  value={meetingForm.type}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="document_review">Document Review</option>
                  <option value="planning">Planning Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Meeting agenda or notes..."
                />
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Generate Client Report</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateReport} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client *
                </label>
                <select
                  required
                  value={reportForm.client_id}
                  onChange={(e) => setReportForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
                  {assignedClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.profile?.full_name || client.profile?.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  value={reportForm.report_type}
                  onChange={(e) => setReportForm(prev => ({ ...prev, report_type: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly Summary</option>
                  <option value="project_status">Project Status</option>
                  <option value="financial">Financial Report</option>
                  <option value="compliance">Compliance Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportForm.period_start}
                    onChange={(e) => setReportForm(prev => ({ ...prev, period_start: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportForm.period_end}
                    onChange={(e) => setReportForm(prev => ({ ...prev, period_end: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Include in Report
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="include_financials"
                      checked={reportForm.include_financials}
                      onChange={(e) => setReportForm(prev => ({ ...prev, include_financials: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include_financials" className="text-sm text-gray-700">
                      Financial Summary
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="include_tasks"
                      checked={reportForm.include_tasks}
                      onChange={(e) => setReportForm(prev => ({ ...prev, include_tasks: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include_tasks" className="text-sm text-gray-700">
                      Task Progress
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="include_documents"
                      checked={reportForm.include_documents}
                      onChange={(e) => setReportForm(prev => ({ ...prev, include_documents: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include_documents" className="text-sm text-gray-700">
                      Document Status
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Generate & Download</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization Country
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    🇬🇪 Georgia (Fixed)
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your specialization country cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+995 XXX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={profileForm.country}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Georgia">Georgia</option>
                    <option value="USA">USA</option>
                    <option value="Estonia">Estonia</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell clients about your expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Company Formation', 'Tax Consulting', 'Banking', 'Legal Services', 'Accounting', 'Investment'].map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        setProfileForm(prev => ({
                          ...prev,
                          specializations: prev.specializations.includes(spec)
                            ? prev.specializations.filter(s => s !== spec)
                            : [...prev.specializations, spec]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        profileForm.specializations.includes(spec)
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-blue-700">4.9/5</p>
                    <p className="text-xs text-blue-600">Based on 247 reviews</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-green-700">98.5%</p>
                    <p className="text-xs text-green-600">Project completion</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Response Time</p>
                    <p className="text-2xl font-bold text-purple-700">2.3h</p>
                    <p className="text-xs text-purple-600">Average response</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium">Revenue Growth</p>
                    <p className="text-2xl font-bold text-orange-700">+23%</p>
                    <p className="text-xs text-orange-600">This month</p>
                  </div>
                </div>
              </div>

              {/* Client Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">By Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.status === 'new').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.status === 'in_progress').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.status === 'completed').length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">By Priority</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.priority === 'high').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Medium</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.priority === 'medium').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Low</span>
                        <span className="text-sm font-medium">{assignedClients.filter(c => c.priority === 'low').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trends */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">+23%</p>
                      <p className="text-sm text-purple-700">Revenue Growth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">+15%</p>
                      <p className="text-sm text-green-700">New Clients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">94%</p>
                      <p className="text-sm text-blue-700">Client Retention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantDashboard;