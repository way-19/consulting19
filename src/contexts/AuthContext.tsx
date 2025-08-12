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
      
      // read by auth uid (NOT email) to avoid RLS recursion
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', u.id)
        .single();

      if (!error && data) {
        console.log('✅ Profile found:', data.email, data.role);
        setProfile(data as Profile);
        return;
      }

      console.log('⚠️ No profile found, creating new profile...');
      
      // create minimal profile if missing (allowed by RLS insert policy)
      const payload = {
        user_id: u.id,
        email: u.email || '',
        role: 'client' as const
      };
      
      const { data: created, error: iErr } = await supabase
        .from('profiles')
        .insert(payload)
        .select('*')
        .single();

      if (iErr) {
        console.error('❌ Error creating profile:', iErr);
        throw iErr;
      }
      
      console.log('✅ Profile created:', created.email, created.role);
      setProfile(created as Profile);
    } catch (e) {
      console.error('💥 fetchOrCreateProfile failed:', e);
      setProfile(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      console.log('🚀 AuthProvider initializing...');
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📋 Initial session check:', session ? `Session found for ${session.user.email}` : 'No session');
      
      if (!mounted) return;
      
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('🔔 Auth state changed:', event, sess ? `Session for ${sess.user.email}` : 'No session');
      
      if (!mounted) return;
      
      setUser(sess?.user ?? null);
      if (sess?.user) {
        await fetchOrCreateProfile(sess.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
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