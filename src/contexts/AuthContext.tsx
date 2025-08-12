import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type Session = any;
type AuthValue = { 
  user: User | null;
  session: Session | null; 
  profile: Profile | null; 
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error.message, error.code);
        return null;
      }

      console.log('✅ Profile fetched successfully:', {
        id: data?.id,
        email: data?.email,
        role: data?.role,
        full_name: data?.full_name
      });
      return data as Profile;
    } catch (error) {
      console.error('💥 Unexpected error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id);
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  useEffect(() => {
    if (didInit.current) {
      console.log('⚠️ AuthProvider already initialized, skipping...');
      return;
    }
    didInit.current = true;
    
    console.log('🚀 AuthProvider initializing...');
    
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('📋 Initial session check:', session ? 'Session found' : 'No session');
        setUser(session?.user ?? null);
        setSession(session ?? null);
        
        if (session?.user) {
          console.log('👤 User found in session:', session.user.email);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('🔔 Auth state changed:', event, session ? `Session exists for ${session.user.email}` : 'No session');
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
      }
      
      setUser(session?.user || null);
      setSession(session ?? null);
      if (session?.user) {
        console.log('👤 Fetching profile for user:', session.user.email);
        const userProfile = await fetchProfile(session.user.id);
        if (isMounted) {
          console.log('✅ Profile loaded, setting profile:', userProfile?.email, userProfile?.role);
          setProfile(userProfile);
        }
      } else {
        console.log('🚪 User logged out, clearing profile');
        if (isMounted) {
          setProfile(null);
        }
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error.message);
    } else {
      console.log('✅ Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({ 
    user, 
    session, 
    profile, 
    loading, 
    signIn, 
    signOut, 
    refreshProfile 
  }), [user, session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}