import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'admin' | 'consultant' | 'client';

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string;
  role: Role;
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
      
      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        return null;
      }

      console.log('✅ Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('💥 Profile fetch failed:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('👤 Session found:', session.user.email);
            setUser(session.user);
            
            const userProfile = await fetchProfile(session.user.id);
            if (mounted && userProfile) {
              setProfile(userProfile);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Auth init error:', error);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (mounted && userProfile) {
            setProfile(userProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in:', email);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });
    
    if (error) {
      console.error('❌ Sign in error:', error.message);
      setLoading(false);
      throw error;
    }
    
    console.log('✅ Sign in successful');
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    console.log('✅ Sign out successful');
  };

  return (
    <AuthCtx.Provider value={{ loading, user, profile, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};