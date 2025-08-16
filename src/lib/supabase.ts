```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Utility function for logging user actions to audit_logs table
export async function logUserAction(
  action: string,
  target_table: string | null,
  target_id: string | null,
  old_values: any | null,
  new_values: any | null
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id || null;
    const ip_address = null; // You might get this from request headers in a server environment
    const user_agent = navigator.userAgent;
    const session_id = session?.jti || null; // JWT ID as session ID

    const { error } = await supabase.from('audit_logs').insert([
      {
        user_id,
        action,
        target_table,
        target_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        session_id,
      },
    ]);

    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (error) {
    console.error('Error in logUserAction:', error);
  }
}

// Alias for logUserAction for admin actions
export const logAdminAction = logUserAction;

// Utility function to upload files to Supabase storage
export async function uploadFileToStorage(file: File, folder: string, bucketName: string = 'documents') {
  const filePath = `${folder}/${file.name}`;
  const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }
  return filePath;
}

// Utility function to get a public URL for a file in Supabase storage
export function getPublicImageUrl(filePath: string, bucketName: string = 'documents') {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

// Utility function to delete files from Supabase storage
export async function deleteFileFromStorage(filePath: string, bucketName: string = 'documents') {
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);
  if (error) {
    throw error;
  }
}

// Utility function to validate file uploads
export function validateFileUpload(file: File, options: { maxSize: number; allowedTypes: string[]; allowedExtensions: string[] }) {
  const errors: string[] = [];

  if (file.size > options.maxSize) {
    errors.push(`File size exceeds ${options.maxSize / (1024 * 1024)}MB limit.`);
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  const isTypeAllowed = options.allowedTypes.includes(mimeType) || options.allowedTypes.some(type => type.endsWith('/*') && mimeType.startsWith(type.slice(0, -1)));
  const isExtensionAllowed = options.allowedExtensions.includes(fileExtension.substring(1));

  if (!isTypeAllowed && !isExtensionAllowed) {
    errors.push(`File type or extension not supported. Allowed types: ${options.allowedTypes.join(', ')}, Allowed extensions: ${options.allowedExtensions.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}
```