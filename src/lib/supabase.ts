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
  bucketName: string,
  filePath: string
): Promise<string> => {
  try {
    console.log(`📤 uploadFileToStorage: Starting upload for ${file.name} to ${bucketName}/${filePath}`);
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ uploadFileToStorage: Upload failed:', uploadError.message);
      throw new Error(uploadError.message);
    }

    console.log('✅ uploadFileToStorage: Upload successful:', uploadData);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log('✅ uploadFileToStorage: Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('💥 uploadFileToStorage: Error:', (error as Error).message);
    throw error;
  }
};

export const deleteFileFromStorage = async (
  bucketName: string,
  filePath: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    throw error;
  }
};

export const getPublicImageUrl = (filePath: string, bucketName: string = 'public_images'): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Auth utilities
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database utilities
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};