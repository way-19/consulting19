import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage utilities
export const uploadFileToStorage = async (
  file: File,
  bucket: string,
  path: string
): Promise<{ data: { path: string; fullPath: string } | null; error: Error | null }> => {
  try {
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to check buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets?.some(b => b.name === bucket);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucket}' not found. Please create it in your Supabase dashboard.`);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return { 
      data: data ? { 
        path: data.path, 
        fullPath: data.fullPath || data.path 
      } : null, 
      error: null 
    };
  } catch (err) {
    console.error('❌ uploadFileToStorage: Upload failed:', err instanceof Error ? err.message : 'Unknown error');
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown upload error') 
    };
  }
};

export const getFileUrl = (bucket: string, path: string): string => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return '';
  }
};

export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
    return { success: true };
  } catch (err) {
    console.error('Error deleting file:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

// Audit logging utility
export const logUserAction = async (
  action: string,
  targetTable?: string,
  targetId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user for audit log');
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: null, // Will be handled by database triggers if needed
        user_agent: navigator.userAgent,
        session_id: null // Will be handled by database triggers if needed
      });

    if (error) {
      console.error('Failed to log user action:', error);
    }
  } catch (err) {
    console.error('Error logging user action:', err);
  }
};