// src/lib/supabase.ts  (JSX YOK)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Storage helpers ----
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadToBucket(opts: {
  bucket: string;
  folder?: string;
  file: File;
  filename?: string;
  useUidPrefix?: boolean;
}) {
  const { bucket, folder = '', file, filename, useUidPrefix = true } = opts;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('Not authenticated');

  const prefix = useUidPrefix ? `${auth.user.id}/` : '';
  const safeName = filename ?? `${Date.now()}-${file.name}`;
  const key = [prefix, folder && `${folder}/`, safeName].filter(Boolean).join('');

  const { error } = await supabase
    .storage
    .from(bucket)
    .upload(key, file, { upsert: false, contentType: file.type, cacheControl: '3600' });

  if (error) throw error;

  return { key, publicUrl: getPublicUrl(bucket, key) };
}

// ---- Backwards-compatible aliases (isteğe bağlı) ----
// Eski kodunuz getPublicImageUrl bekliyorsa bu alias yeter.
export const getPublicImageUrl = getPublicUrl;

// ---- Settings helper (şemanıza göre uyarlayın veya kullanmıyorsanız kaldırın) ----
export async function updateSetting(key: string, value: unknown) {
  // Tablo/kolon adlarını kendi şemanıza göre değiştirin
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
}

// ---- Logging re-exports (./logging varsa) ----
export { logUserAction, logAdminAction } from './logging';