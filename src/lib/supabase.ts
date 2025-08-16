// src/lib/supabase.ts
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
// Projende bir tabloya yazmak istersen aşağıdaki insert satırlarını kendi tablo adına göre açıp düzenle.
// Şimdilik konsola yazar; import eden yerler derlenir ve çalışır.

export type LogPayload = {
  userId?: string | null;
  action: string;
  context?: string;
  meta?: Record<string, any>;
};

export async function logUserAction(payload: LogPayload): Promise<void> {
  try {
    // Örnek tablo yazımı:
    // await supabase.from('user_actions').insert([{ ...payload, created_at: new Date().toISOString() }]);
    console.info('[logUserAction]', payload);
  } catch (e) {
    console.warn('logUserAction failed', e);
  }
}

export async function logAdminAction(payload: LogPayload): Promise<void> {
  try {
    // Örnek tablo yazımı:
    // await supabase.from('admin_actions').insert([{ ...payload, created_at: new Date().toISOString() }]);
    console.info('[logAdminAction]', payload);
  } catch (e) {
    console.warn('logAdminAction failed', e);
  }
}