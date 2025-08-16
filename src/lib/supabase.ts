import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  console.error('\nPlease check your .env file and ensure it contains:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Enhanced Database Types
export interface Profile {
  id: string;
  auth_user_id: string;
  email: string;
  role_id?: string;
  legacy_role: 'admin' | 'consultant' | 'client';
  full_name?: string;
  phone?: string;
  country?: string;
  language_preference: string;
  timezone: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language: string;
  supported_languages: string[];
  highlights: string[];
  tags: string[];
  insights: any[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  profile_id: string;
  assigned_consultant_id?: string;
  company_name?: string;
  phone?: string;
  status: 'new' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  service_type: string;
  progress: number;
  satisfaction_rating?: number;
  segment: string;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  consultant_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  budget?: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  client_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  assigned_to?: string;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  project_id?: string;
  name: string;
  type: string;
  category: 'identity' | 'business' | 'financial' | 'legal' | 'tax' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision' | 'expired';
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  reviewed_by?: string;
  uploaded_at: string;
  reviewed_at?: string;
  expires_at?: string;
  notes?: string;
  metadata: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id?: string;
  category?: string;
  tags: string[];
  language_code: string;
  is_published: boolean;
  published_at?: string;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  language_code: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
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
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  target_table?: string;
  target_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  return profile as Profile | null;
};

export const ensureProfile = async () => {
  try {
    const { data, error } = await supabase.rpc('ensure_profile');
    
    if (error) {
      console.error('Error ensuring profile:', error);
      return null;
    }
    
    return data?.[0]?.profile_data || null;
  } catch (error) {
    console.error('Error in ensureProfile:', error);
    return null;
  }
};

export const hasPermission = async (permission: string) => {
  const profile = await getCurrentProfile();
  if (!profile) return false;

  const { data } = await supabase
    .from('role_permissions')
    .select(`
      permissions (name)
    `)
    .eq('role_id', profile.role_id);

  return data?.some(rp => rp.permissions?.name === permission) || false;
};

export const isAdmin = async () => {
  const profile = await getCurrentProfile();
  return profile?.legacy_role === 'admin';
};

export const isConsultant = async () => {
  const profile = await getCurrentProfile();
  return profile?.legacy_role === 'consultant';
};

export const isClient = async () => {
  const profile = await getCurrentProfile();
  return profile?.legacy_role === 'client';
};

// Notification helpers
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  relatedTable?: string,
  relatedId?: string,
  actionUrl?: string
) => {
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
      action_url: actionUrl
    }]);

  if (error) {
    console.error('Error creating notification:', error);
  }
};

// Enhanced notification helpers
export const notifyDocumentStatusChange = async (
  clientId: string,
  documentName: string,
  newStatus: string,
  consultantName: string
) => {
  const statusMessages = {
    approved: `Belgeniz "${documentName}" onaylandı`,
    rejected: `Belgeniz "${documentName}" reddedildi`,
    needs_revision: `Belgeniz "${documentName}" revizyon gerektiriyor`
  };

  await createNotification(
    clientId,
    'document_status',
    'Belge Durumu Güncellendi',
    `${statusMessages[newStatus as keyof typeof statusMessages]} - ${consultantName}`,
    newStatus === 'rejected' ? 'high' : 'normal',
    'documents',
    undefined,
    '/client/documents'
  );
};

export const notifyNewMessage = async (
  recipientId: string,
  senderName: string,
  messagePreview: string,
  chatType: string
) => {
  await createNotification(
    recipientId,
    'new_message',
    'Yeni Mesaj',
    `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    'normal',
    'messages',
    undefined,
    chatType === 'consultant-client' ? '/client-accounting' : '/consultant-dashboard'
  );
};

export const notifyTaskAssigned = async (
  consultantId: string,
  clientId: string,
  taskTitle: string,
  dueDate?: string
) => {
  await createNotification(
    consultantId,
    'task_assigned',
    'Yeni Görev Atandı',
    `"${taskTitle}" görevi atandı${dueDate ? ` - Son tarih: ${new Date(dueDate).toLocaleDateString('tr-TR')}` : ''}`,
    'normal',
    'tasks',
    undefined,
    '/consultant/tasks'
  );

  await createNotification(
    clientId,
    'task_assigned',
    'Size Yeni Görev Atandı',
    `Danışmanınız size "${taskTitle}" görevini atadı`,
    'normal',
    'tasks',
    undefined,
    '/client/projects'
  );
};

export const notifyPaymentReceived = async (
  consultantId: string,
  amount: number,
  currency: string,
  clientName: string
) => {
  await createNotification(
    consultantId,
    'payment_received',
    'Ödeme Alındı',
    `${clientName} müşterisinden ${amount} ${currency} ödeme alındı`,
    'normal',
    'payments',
    undefined,
    '/consultant/payments'
  );
}

// Audit logging helper
export const logAdminAction = async (
  action: string,
  targetTable?: string,
  targetId?: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) => {
  const user = await getCurrentUser();
  if (!user) return;

  // Get IP address and user agent if not provided
  const finalIpAddress = ipAddress || await getClientIP();
  const finalUserAgent = userAgent || navigator.userAgent;

  const { error } = await supabase
    .from('audit_logs')
    .insert([{
      user_id: user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: finalIpAddress,
      user_agent: finalUserAgent
    }]);

  if (error) {
    console.error('Error logging admin action:', error);
  }
};

// Settings helpers
export const getSetting = async (key: string) => {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  return data?.value;
};

export const updateSetting = async (key: string, value: any) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value });

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }
  
  return true;
};

// Get client IP address (best effort)
export const getClientIP = async (): Promise<string> => {
  try {
    // Try to get IP from a public service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('Could not fetch client IP:', error);
    return 'unknown';
  }
};

// Enhanced audit logging with automatic IP and user agent detection
export const logUserAction = async (
  action: string,
  targetTable?: string,
  targetId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const ipAddress = await getClientIP();
    const userAgent = navigator.userAgent;
    const sessionId = generateSessionId();

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId
      }]);

    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (error) {
    console.error('Error in logUserAction:', error);
  }
};

// Generate a session ID for tracking user sessions
const generateSessionId = (): string => {
  // Try to get existing session ID from sessionStorage
  let sessionId = sessionStorage.getItem('consulting19_session_id');
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('consulting19_session_id', sessionId);
  }
  
  return sessionId;
};

// Image Upload and Storage Helpers
export const uploadFileToStorage = async (file: File, folder: string, bucketName: string = 'public_images') => {
  try {
    console.log('📤 uploadFileToStorage: Starting upload for file:', file.name, 'Size:', file.size, 'bytes');
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB. Please compress your file and try again.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
                         'application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not supported. Please use JPG, PNG, PDF, or DOC files.`);
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `${folder}/${fileName}`;

    console.log('📁 uploadFileToStorage: Uploading to path:', filePath);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('❌ uploadFileToStorage: Upload failed:', error.message);
      throw error;
    }

    console.log('✅ uploadFileToStorage: Upload successful, file path:', filePath);
    return filePath;
  } catch (error) {
    console.error('💥 uploadFileToStorage: Error:', error);
    throw error;
  }
};

export const getPublicImageUrl = (filePath: string, bucketName: string = 'public_images') => {
  if (!filePath) return '';

  // If path is already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Handle relative paths
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(cleanPath);

  return data.publicUrl;
};

export const deleteFileFromStorage = async (filePath: string, bucketName: string = 'public_images') => {
  try {
    console.log('🗑️ deleteFileFromStorage: Deleting file:', filePath);
    
    // Clean the file path
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([cleanPath]);

    if (error) {
      console.error('❌ deleteFileFromStorage: Delete failed:', error.message);
      throw error;
    }

    console.log('✅ deleteFileFromStorage: File deleted successfully');
    return true;
  } catch (error) {
    console.error('💥 deleteFileFromStorage: Error:', error);
    throw error;
  }
};

// Enhanced file management helpers
export const getFileMetadata = async (filePath: string, bucketName: string = 'public_images') => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(cleanPath.split('/').slice(0, -1).join('/'), {
        search: cleanPath.split('/').pop()
      });

    if (error) throw error;
    
    const fileInfo = data?.find(item => item.name === cleanPath.split('/').pop());
    return fileInfo;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
};

export const validateFileUpload = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  } = options;

  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File type "${file.type}" is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push('File name is too long. Maximum 255 characters allowed.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createFileRecord = async (
  filePath: string,
  originalFile: File,
  metadata: {
    client_id?: string;
    consultant_id?: string;
    category?: string;
    description?: string;
  }
) => {
  try {
    const fileRecord = {
      name: originalFile.name,
      file_url: filePath,
      file_size: originalFile.size,
      mime_type: originalFile.type,
      uploaded_at: new Date().toISOString(),
      ...metadata
    };

    const { data, error } = await supabase
      .from('documents')
      .insert([fileRecord])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating file record:', error);
    throw error;
  }
};