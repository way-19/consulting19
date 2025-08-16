import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for the application
export interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language?: string;
  supported_languages?: string[];
  highlights?: string[];
  tags?: string[];
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultantDocument {
  id: string;
  consultant_id: string;
  document_type: 'contract' | 'tax_certificate' | 'id_proof' | 'business_license' | 'other';
  file_url: string;
  file_name: string;
  file_size?: number;
  uploaded_at: string;
  expiry_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultantBankDetails {
  id: string;
  consultant_id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Utility functions
export const uploadFileToStorage = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPublicImageUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteFileFromStorage = async (
  bucket: string,
  path: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { error };
  } catch (error) {
    return { error };
  }
};