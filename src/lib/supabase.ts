import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Audit logging function
export const logUserAction = async (
  action: string,
  targetTable?: string,
  targetId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: null, // Will be set by server if needed
      user_agent: navigator.userAgent,
      session_id: user?.id // Using user ID as session identifier
    });
  } catch (error) {
    console.error('Failed to log user action:', error);
  }
};

// Alias for admin actions
export const logAdminAction = logUserAction;

// File validation function
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
) => {
  const errors: string[] = [];
  
  const defaultOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx']
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Check file size
  if (file.size > finalOptions.maxSize) {
    errors.push(`File size exceeds limit of ${finalOptions.maxSize / (1024 * 1024)}MB.`);
  }
  
  // Check file type
  const isTypeAllowed = finalOptions.allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
  
  if (!isTypeAllowed) {
    errors.push(`File type ${file.type} is not allowed.`);
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!finalOptions.allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension ${fileExtension} is not allowed.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File upload function
export const uploadFileToStorage = async (
  file: File,
  bucket: string,
  path: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Get public URL for uploaded file
export const getPublicImageUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Delete file from storage
export const deleteFileFromStorage = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    throw error;
  }
};