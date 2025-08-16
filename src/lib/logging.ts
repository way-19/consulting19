// src/lib/logging.ts
import { supabase } from './supabase';

export type LogUserActionParams = {
  action: string;                          // örn: 'document_viewed'
  user_id?: string | null;                 // verilmezse oturumdaki kullanıcıdan alınır
  details?: Record<string, any> | null;    // JSON detaylar (opsiyonel)
  context?: string | null;                 // ek bağlam (opsiyonel)
};

export async function logUserAction(params: LogUserActionParams) {
  const { action, user_id, details = null, context = null } = params;

  // Kullanıcı id verilmemişse Supabase oturumundan dene
  let uid = user_id ?? null;
  if (!uid) {
    const { data } = await supabase.auth.getUser();
    uid = data.user?.id ?? null;
  }

  // Kendi tablo adınızı kullanın (ör: 'user_actions' ya da 'activity_logs')
  const { error } = await supabase.from('user_actions').insert([
    {
      action,
      user_id: uid,
      details,   // Supabase'te JSONB kolon önerilir
      context,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('logUserAction error:', error);
    return { ok: false, error };
  }

  return { ok: true };
}