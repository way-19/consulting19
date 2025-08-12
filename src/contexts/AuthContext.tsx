import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  auth_user_id: string;   // FK to auth.users.id
  email: string;
  role: 'admin' | 'consultant' | 'client';
  country?: string | null;
  full_name?: string | null;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function fetchProfile(u: User) {
    try {
      console.log('🔍 Fetching profile for user:', u.email, 'ID:', u.id);
      
      // Try to get profile by auth_user_id first
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', u.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile by auth_user_id:', error);
      }

      if (data) {
        console.log('✅ Profile found by auth_user_id:', data.email, data.role);
        setProfile(data as Profile);
        return;
      }

      console.log('⚠️ No profile found by auth_user_id, trying by email...');
      
      // Try to find by email as fallback
      const { data: emailProfile, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', u.email)
        .maybeSingle();

      if (emailError) {
        console.error('❌ Error fetching profile by email:', emailError);
      }

      if (emailProfile) {
        console.log('✅ Profile found by email:', emailProfile.email, emailProfile.role);
        
        // Update the auth_user_id to link properly
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ auth_user_id: u.id })
          .eq('id', emailProfile.id);
          
        if (updateError) {
          console.error('❌ Error updating auth_user_id:', updateError);
        } else {
          console.log('✅ Profile linked to auth user');
        }
        
        setProfile(emailProfile as Profile);
        return;
      }

      console.log('⚠️ No profile found at all for user:', u.email);
      setProfile(null);
    } catch (e) {
      console.error('💥 fetchProfile failed:', e);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    async function initAuth() {
      console.log('🚀 AuthProvider initializing...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session check:', session ? `Session found for ${session.user.email}` : 'No session');
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user);
        }
      } catch (error) {
        console.error('❌ Error in initial auth check:', error);
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete, setting loading to false');
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('🔔 Auth state changed:', event, sess ? `Session for ${sess.user.email}` : 'No session');
      
      if (!mounted) return;
      
      setUser(sess?.user ?? null);
      
      if (sess?.user) {
        try {
          await fetchProfile(sess.user);
        } catch (error) {
          console.error('❌ Error fetching profile on auth change:', error);
        }
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        console.log('✅ Auth state change complete, setting loading to false');
        setLoading(false);
      }
    });
    
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    loading, 
    user, 
    profile,
    signIn: async (email: string, password: string) => {
      console.log('🔐 Attempting sign in for:', email);
      setLoading(true);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('❌ Sign in error:', error.message);
          throw error;
        }
        
        console.log('✅ Sign in successful');
        // onAuthStateChange will handle the rest
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signOut: async () => {
      console.log('🚪 Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      setProfile(null);
      setLoading(false);
    }
  }), [loading, user, profile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};