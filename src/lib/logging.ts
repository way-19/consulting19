// src/lib/logging.ts
import { supabase } from './supabase';

export type LogPayload = {
  userId?: string | null;
  action: string;
  context?: string;
  meta?: Record<string, any>;
};

export async function logUserAction(
  action: string,
  targetTable?: string,
  targetId?: string | null,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logEntry = {
      user_id: user?.id || null,
      action,
      target_table: targetTable,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      timestamp: new Date().toISOString()
    };

    // Try to insert into audit_logs table if it exists
    const { error } = await supabase
      .from('audit_logs')
      .insert([logEntry]);

    if (error) {
      console.warn('Failed to log user action to database:', error.message);
      console.info('[logUserAction]', logEntry);
    }
  } catch (e) {
    console.warn('logUserAction failed', e);
    console.info('[logUserAction]', { action, targetTable, targetId });
  }
}

export async function logAdminAction(
  action: string,
  targetTable?: string,
  targetId?: string | null,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const logEntry = {
      user_id: user?.id || null,
      action: `ADMIN_${action}`,
      target_table: targetTable,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      timestamp: new Date().toISOString()
    };

    // Try to insert into audit_logs table if it exists
    const { error } = await supabase
      .from('audit_logs')
      .insert([logEntry]);

    if (error) {
      console.warn('Failed to log admin action to database:', error.message);
      console.info('[logAdminAction]', logEntry);
    }
  } catch (e) {
    console.warn('logAdminAction failed', e);
    console.info('[logAdminAction]', { action, targetTable, targetId });
  }
}