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
): Promise<{ data: { path: string } | null; error: Error | null }> => {
  try {
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to check buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets?.some(b => b.name === bucket);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucket}' not found. Please contact administrator to set up file storage.`);
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

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown upload error');
    console.error('❌ uploadFileToStorage: Upload failed:', error.message);
    return { data: null, error };
  }
};

export const getPublicUrl = (bucket: string, path: string): string => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('❌ getPublicUrl: Failed to generate URL:', error);
    return '';
  }
};

export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown delete error');
    console.error('❌ deleteFile: Delete failed:', error.message);
    return { error };
  }
};