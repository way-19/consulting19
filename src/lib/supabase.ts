import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Varsayılan bucket (projenize göre değiştirin)
const DEFAULT_BUCKET = 'documents';

const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s);

/**
 * getPublicImageUrl
 * 1) getPublicImageUrl('documents', 'virtual_mailbox/file.pdf')  // bucket + path
 * 2) getPublicImageUrl('virtual_mailbox/file.pdf')               // sadece path (DEFAULT_BUCKET kullanır)
 */
export function getPublicImageUrl(bucketOrPath: string, maybePath?: string): string {
  if (maybePath !== undefined) {
    // İki argümanlı kullanım
    const bucket = bucketOrPath;
    const path = maybePath;
    if (!path) return '';
    if (isAbsoluteUrl(path)) return path;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    // Tek argümanlı kullanım (varsayılan bucket)
    const path = bucketOrPath;
    if (!path) return '';
    if (isAbsoluteUrl(path)) return path;
    const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}

// İsterseniz alternatif isimli yardımcı:
export function getPublicFileUrl(bucket: string, path: string): string {
  if (!path) return '';
  if (isAbsoluteUrl(path)) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFileFromStorage(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// ---- Lightweight logging shims ----
export type LogPayload = {
  userId?: string | null;
  action: string;
  context?: string;
  meta?: Record<string, any>;
};

export async function logUserAction(
  action: string,
  targetTable?: string | null,
  targetId?: string | null,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    // Örnek tablo yazımı:
    // await supabase.from('audit_logs').insert([{ 
    //   action, 
    //   target_table: targetTable,
    //   target_id: targetId,
    //   old_values: oldValues,
    //   new_values: newValues,
    //   timestamp: new Date().toISOString() 
    // }]);
    console.info('[logUserAction]', { action, targetTable, targetId, oldValues, newValues });
  } catch (e) {
    console.warn('logUserAction failed', e);
  }
}

export async function logAdminAction(
  action: string,
  targetTable?: string | null,
  targetId?: string | null,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    // Örnek tablo yazımı:
    // await supabase.from('audit_logs').insert([{ 
    //   action, 
    //   target_table: targetTable,
    //   target_id: targetId,
    //   old_values: oldValues,
    //   new_values: newValues,
    //   timestamp: new Date().toISOString() 
    // }]);
    console.info('[logAdminAction]', { action, targetTable, targetId, oldValues, newValues });
  } catch (e) {
    console.warn('logAdminAction failed', e);
  }
}

// Settings helpers
export async function getSetting(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.warn(`getSetting failed for key ${key}:`, error);
      return null;
    }
    
    return data?.value;
  } catch (e) {
    console.warn('getSetting failed', e);
    return null;
  }
}

export async function updateSetting(key: string, value: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert([{ key, value }]);
    
    if (error) {
      throw new Error(`Failed to update setting: ${error.message}`);
    }
  } catch (e) {
    console.warn('updateSetting failed', e);
    throw e;
  }
}