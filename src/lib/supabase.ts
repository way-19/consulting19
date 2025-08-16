// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// -------------------- Public URL helpers --------------------
const DEFAULT_BUCKET = 'documents';
const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s);

/** 
 * getPublicImageUrl('bucket', 'path') veya getPublicImageUrl('path') (DEFAULT_BUCKET)
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

// -------------------- Settings helpers --------------------
/**
 * Tablo varsayımı: 'settings' (columns: key text primary key, value jsonb, updated_at timestamptz)
 * Şemanız farklıysa tablo adını/kolonları kendi ihtiyacınıza göre değiştirin.
 */
export async function getSetting<T = Json>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.warn('getSetting error', error);
    return null;
  }
  return (data?.value as T) ?? null;
}

export async function updateSetting(key: string, value: Json): Promise<boolean> {
  const row = { key, value, updated_at: new Date().toISOString() };
  const { error } = await supabase.from('settings').upsert(row, { onConflict: 'key' });
  if (error) {
    console.warn('updateSetting error', error);
    return false;
  }
  return true;
}

// -------------------- Logging helpers --------------------
export type LogPayload = {
  userId?: string | null;
  action: string;
  context?: string;
  meta?: Record<string, any>;
};

export async function logUserAction(payload: LogPayload): Promise<void> {
  try {
    // Örnek DB yazımı (tabloyu kendinize göre düzenleyin):
    // await supabase.from('user_actions').insert([{ ...payload, created_at: new Date().toISOString() }]);
    console.info('[logUserAction]', payload);
  } catch (e) {
    console.warn('logUserAction failed', e);
  }
}

export async function logAdminAction(payload: LogPayload): Promise<void> {
  try {
    // Örnek DB yazımı (tabloyu kendinize göre düzenleyin):
    // await supabase.from('admin_actions').insert([{ ...payload, created_at: new Date().toISOString() }]);
    console.info('[logAdminAction]', payload);
  } catch (e) {
    console.warn('logAdminAction failed', e);
  }
}

// -------------------- File upload helpers --------------------
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateFileUpload(file: File, options: FileValidationOptions): FileValidationResult {
  const errors: string[] = [];

  // Check file size
  if (file.size > options.maxSize) {
    errors.push(`File size exceeds limit of ${options.maxSize / (1024 * 1024)}MB.`);
  }

  // Check file type
  if (options.allowedTypes && options.allowedTypes.length > 0) {
    const isTypeAllowed = options.allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      errors.push(`File type ${file.type} is not allowed.`);
    }
  }

  // Check file extension
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !options.allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function uploadFileToStorage(
  file: File,
  folder: string = 'uploads',
  bucket: string = 'documents'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return filePath;
}

export async function deleteFileFromStorage(
  filePath: string,
  bucket: string = 'documents'
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// -------------------- Type definitions --------------------
export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'consultant' | 'client';
  legacy_role: 'admin' | 'consultant' | 'client';
  full_name?: string;
  country?: string;
  phone?: string;
  avatar_url?: string;
  language_preference?: string;
  timezone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  auth_user_id?: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language: string;
  supported_languages: string[];
  highlights: string[];
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  consultant_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  budget?: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}