// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/** Güvenli public URL üretici.
 * - path yoksa null döner
 * - Tam public URL geldiyse bucket içi path'e indirger
 */
export function getPublicUrl(bucket: string, path?: string | null): string | null {
  if (!bucket || !path) return null;

  const absolutePrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  const cleanPath = path.startsWith(absolutePrefix) ? path.slice(absolutePrefix.length) : path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
  return data?.publicUrl ?? null;
}

// Geriye dönük uyumluluk için alias
export const getPublicImageUrl = getPublicUrl;

/** Storage'a dosya yükleme yardımcıları */
export async function uploadFileToStorage(
  bucket: string,
  file: File,
  opts: { pathPrefix?: string; upsert?: boolean } = {}
): Promise<{ path: string; publicUrl: string | null }> {
  const prefix = (opts.pathPrefix ?? '').replace(/^\/+|\/+$/g, '');
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
  const storagePath = prefix ? `${prefix}/${fileName}` : fileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { upsert: !!opts.upsert });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return { path: storagePath, publicUrl: getPublicUrl(bucket, storagePath) };
}

/** Ayar yazma örneği (yoksa sessizce uyarır) */
export async function updateSetting(key: string, value: any) {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  } catch (e) {
    console.warn('[updateSetting] failed:', e);
  }
}