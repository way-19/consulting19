import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  auth_user_id: string;
  email: string;
  legacy_role: 'admin' | 'consultant' | 'client';
  full_name?: string;
  phone?: string;
  country?: string;
  avatar_url?: string;
  language_preference?: string;
  timezone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
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
  is_active: boolean;
  sort_order: number;
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
  client_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

// File upload validation
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateFileUpload = (
  file: File,
  options: FileValidationOptions
): FileValidationResult => {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  const isTypeAllowed = options.allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.toLowerCase();
    }
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return mimeType.startsWith(baseType);
    }
    return mimeType === type;
  });

  const isExtensionAllowed = options.allowedExtensions.some(ext => 
    fileExtension === '.' + ext.toLowerCase()
  );

  if (!isTypeAllowed && !isExtensionAllowed) {
    errors.push(`File type not supported. Allowed: ${options.allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// File upload to Supabase Storage
export const uploadFileToStorage = async (
  file: File,
  folder: string = 'uploads',
  bucketName: string = 'public_images'
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data.path;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete file from Supabase Storage
export const deleteFileFromStorage = async (
  filePath: string,
  bucketName: string = 'public_images'
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get public URL for uploaded files
export const getPublicImageUrl = (
  filePath: string,
  bucketName: string = 'public_images'
): string => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Admin action logging
export const logAdminAction = async (
  action: string,
  targetTable: string,
  targetId: string | null,
  oldValues: any = null,
  newValues: any = null
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user?.id,
        action,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error logging admin action:', error);
    }
  } catch (error) {
    console.error('Error in logAdminAction:', error);
  }
};

// Settings management
export const getSetting = async (key: string) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data?.value;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
};

export const updateSetting = async (key: string, value: any) => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
};