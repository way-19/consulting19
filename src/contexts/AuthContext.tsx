import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  user_id: string;   // FK to auth.users.id
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

  async function fetchOrCreateProfile(u: User) {
    try {
      console.log('🔍 Fetching profile for user:', u.email);
      
      // First try to get profile by auth_user_id
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', u.id)
        .maybeSingle();

      if (data) {
        console.log('✅ Profile found:', data.email, data.role);
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

      console.log('⚠️ No profile found at all, this should not happen in production');
      console.log('🔧 Available user data:', { id: u.id, email: u.email });
      
      // In production, profiles should already exist
      setProfile(null);
    } catch (e) {
      console.error('💥 fetchOrCreateProfile failed:', e);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      console.log('🚀 AuthProvider initializing...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session check:', session ? `Session found for ${session.user.email}` : 'No session');
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchOrCreateProfile(session.user);
        }
      } catch (error) {
        console.error('❌ Error in initial auth check:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('🔔 Auth state changed:', event, sess ? `Session for ${sess.user.email}` : 'No session');
      
      if (!mounted) return;
      
      setUser(sess?.user ?? null);
      if (sess?.user) {
        try {
          await fetchOrCreateProfile(sess.user);
        } catch (error) {
          console.error('❌ Error fetching profile on auth change:', error);
        }
      } else {
        setProfile(null);
      }
      
      if (mounted) {
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
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('❌ Sign in error:', error.message);
        setLoading(false);
        throw error;
      }
      
      console.log('✅ Sign in successful');
      // onAuthStateChange will handle the rest
    },
    signOut: async () => {
      console.log('🚪 Signing out...');
      await supabase.auth.signOut();
    }
  }), [loading, user, profile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};