import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Public URL helpers ----
const DEFAULT_BUCKET = 'documents';

const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s);

/**
 * getPublicImageUrl
 * Kullanım:
 *  1) getPublicImageUrl('documents', 'virtual_mailbox/file.pdf')
 *  2) getPublicImageUrl('virtual_mailbox/file.pdf')  // DEFAULT_BUCKET kullanır
 */
export function getPublicImageUrl(bucketOrPath: string, maybePath?: string): string {
  if (maybePath !== undefined) {
    const bucket = bucketOrPath;
    const path = maybePath;
    if (!path) return '';
    if (isAbsoluteUrl(path)) return path;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    const path = bucketOrPath;
    if (!path) return '';
    if (isAbsoluteUrl(path)) return path;
    const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}

export function getPublicFileUrl(bucket: string, path: string): string {
  if (!path) return '';
  if (isAbsoluteUrl(path)) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ---- Lightweight logging shims ----
export type LogPayload = {
  userId?: string | null;
  action: string;
  context?: string;
  meta?: Record<string, any>;
};

export async function logUserAction(payload: LogPayload): Promise<void> {
  try {
    console.info('[logUserAction]', payload);
  } catch (e) {
    console.warn('logUserAction failed', e);
  }
}

export async function logAdminAction(payload: LogPayload): Promise<void> {
  try {
    console.info('[logAdminAction]', payload);
  } catch (e) {
    console.warn('logAdminAction failed', e);
  }
}

// ---- Settings helpers ----
export async function getSetting(key: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) {
    console.warn('getSetting error:', error);
    return null;
  }
  
  return data?.value;
}

export async function updateSetting(key: string, value: any) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value });
  
  if (error) {
    console.error('updateSetting error:', error);
    return { success: false, error };
  }
  
  return { success: true };
}