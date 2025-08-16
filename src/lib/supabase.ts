import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File upload utilities
export const uploadFileToStorage = async (
  file: File,
  bucketName: string = 'public_images',
  folder: string = 'uploads'
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folder}/${fileName}`;

    console.log('🔄 uploadFileToStorage: Starting upload...', {
      fileName,
      filePath,
      bucketName,
      fileSize: file.size,
      fileType: file.type
    });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ uploadFileToStorage: Upload failed:', error);
      throw new Error(error.message);
    }

    console.log('✅ uploadFileToStorage: Upload successful', data);
    return filePath;
  } catch (error) {
    console.error('💥 uploadFileToStorage: Error:', error);
    throw error;
  }
};

export const getPublicImageUrl = (path: string, bucketName: string = 'public_images'): string => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFileFromStorage = async (
  path: string,
  bucketName: string = 'public_images'
): Promise<void> => {
  const { error } = await supabase.storage.from(bucketName).remove([path]);
  if (error) {
    throw new Error(error.message);
  }
};

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
    
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user?.id,
        action,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: null, // Will be handled by database function if needed
        user_agent: navigator.userAgent,
        session_id: null // Will be handled by database function if needed
      }]);

    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (error) {
    console.error('Error in logUserAction:', error);
  }
};

// File validation function
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const { maxSize = 10, allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'] } = options;

  // Check file size
  const maxSizeBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize}MB`
    };
  }

  // Check file type
  const isValidType = allowedTypes.some(type => {
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return file.type.startsWith(baseType);
    }
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type === type;
  });

  if (!isValidType) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};