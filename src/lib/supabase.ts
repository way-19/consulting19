```typescript
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not set in environment variables.');
  // Fallback or throw error depending on desired behavior
  // For now, we'll proceed but functions might fail.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function for logging user actions
export async function logUserAction(
  action: string,
  target_table: string | null = null,
  target_id: string | null = null,
  old_values: any | null = null,
  new_values: any | null = null
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = user?.email || 'system';

    // Attempt to get IP address and user agent from request headers if available (for server-side functions)
    // For client-side, these might be null or require a proxy.
    const ip_address = 'client_side_ip'; // Placeholder for client-side
    const user_agent = navigator.userAgent; // Client-side user agent

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action: action,
      target_table: target_table,
      target_id: target_id,
      old_values: old_values,
      new_values: new_values,
      ip_address: ip_address,
      user_agent: user_agent,
      timestamp: new Date().toISOString(),
      session_id: userId ? (await supabase.auth.getSession()).data.session?.id : null // Log session ID if available
    });

    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (error) {
    console.error('Error in logUserAction:', error);
  }
}

// Alias for logUserAction for admin-specific logging
export const logAdminAction = logUserAction;

// Utility function for file validation
export function validateFileUpload(file: File, options: { maxSize: number; allowedTypes: string[]; allowedExtensions: string[] }) {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    errors.push(\`File size exceeds limit of ${options.maxSize / (1024 * 1024)}MB.`);
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  const isTypeAllowed = options.allowedTypes.some(type => {
    if (type.endsWith('/*')) { // Handle image/* or audio/*
      return mimeType.startsWith(type.slice(0, -1));
    }
    return mimeType === type;
  });

  const isExtensionAllowed = options.allowedExtensions.includes(fileExtension.substring(1)); // Remove leading dot

  if (!isTypeAllowed && !isExtensionAllowed) {
    errors.push(\`File type or extension is not allowed. Allowed types: ${options.allowedTypes.join(', ')}, Allowed extensions: ${options.allowedExtensions.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Utility function for uploading files to Supabase Storage
export async function uploadFileToStorage(file: File, folder: string, bucketName: string = 'public_images'): Promise<string> {
  const filePath = \`${folder}/${Date.now()}-${file.name}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('💥 uploadFileToStorage: Error:', error);
      throw new Error(error.message);
    }

    return data.path;
  } catch (error) {
    console.error('❌ uploadFileToStorage: Upload failed:', error);
    throw error;
  }
}

// Utility function to get public URL of an uploaded file
export function getPublicImageUrl(filePath: string, bucketName: string = 'public_images'): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

// Utility function to delete files from Supabase Storage
export async function deleteFileFromStorage(filePath: string, bucketName: string = 'public_images'): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from storage:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
    throw error;
  }
}
```