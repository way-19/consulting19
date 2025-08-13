import { supabase } from './supabase';

export async function ensureProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found, skipping profile check');
      return null;
    }

    // Call the SQL function – it returns the user profile
    // Note: The ensure_user_profile function is now a trigger on auth.users insert
    // This function is no longer needed for direct RPC call, but keeping for context if needed elsewhere.
    // The profile should be created automatically by the trigger.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.warn('Error fetching profile:', error.message);
      return null;
    }

    console.log('Profile ensured:', data);
    return data;
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return null;
  }
}

// Helper to ensure profile after successful login
export async function ensureProfileAfterLogin() {
  try {
    const profile = await ensureProfile();
    if (profile) {
      console.log('Profile ready:', profile.email, profile.role);
      return profile;
    }
    return null;
  } catch (error) {
    console.error('Failed to ensure profile after login:', error);
    return null;
  }
}