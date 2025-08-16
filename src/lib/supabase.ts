// src/lib/supabase.ts
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

// Yalnızca gerçekten varsa açın; yoksa bu satırı kaldırın:
export { logUserAction } from './logging';