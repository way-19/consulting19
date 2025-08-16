import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logUserAction } from '../lib/logging';

export type Role = 'admin' | 'consultant' | 'client';

export interface Profile {
  id: string;           // auth.users.id ile aynı
  email: string;
  role: Role;
  full_name?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // StrictMode'da effect'in iki kez tetiklenmesini güvenle engelle
  const initRef = useRef(false);

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    console.log('🔍 Fetching profile for user:', uid);
    
    try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, legacy_role, full_name, country, created_at, updated_at')
      .eq('id', uid)              // profiles.id = auth.users.id
      .maybeSingle();

    if (error) {
      console.error('❌ Profile fetch error:', error);
      setProfile(null);
      return null;
    }
    if (!data) {
      console.warn('ℹ️ Profile not found for user:', uid);
      setProfile(null);
      return null;
    }
      
      console.log('✅ Profile fetched successfully:', data.email, data.legacy_role);
    // Map legacy_role to role for consistency with interface
    const profileData = { ...data, role: data.legacy_role } as Profile;
    setProfile(profileData);
    return profileData;
    } catch (error) {
      console.error('💥 Error in fetchProfile:', error);
      setProfile(null);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('🔐 Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('❌ Sign in error:', error);
        setLoading(false);
        
        // Log failed login attempt
        await logUserAction(
          'LOGIN_FAILED',
          'auth',
          null,
          null,
          { email, error: error.message }
        );
        
        throw error;
      }
      console.log('✅ Sign in successful');
      
      // Log successful login
      await logUserAction(
        'LOGIN_SUCCESS',
        'auth',
        null,
        null,
        { email }
      );
      
      // onAuthStateChange tetiklenecek
    } catch (error) {
      setLoading(false);
      throw error;
    }
    // onAuthStateChange tetiklenecek
  };

  useEffect(() => {
    if (initRef.current || initialized) return;     // ikinci çalışmayı engelle
    initRef.current = true;

    const init = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        const current = session?.user ?? null;
        console.log('👤 Current user:', current ? current.email : 'None');
        
        setUser(current);
        if (current) {
          await fetchProfile(current.id);
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_evt, session) => {
        console.log('🔄 Auth state changed:', _evt, session?.user?.email || 'No user');
        
        const next = session?.user ?? null;
        setUser(next);
        if (next) {
          await fetchProfile(next.id);
        } else {
          setProfile(null);
        }
        
        if (initialized) {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initialized]);

  const signOut = async (): Promise<void> => {
    console.log('🚪 Signing out...');
    setLoading(true);
    
    // Log logout action
    if (user) {
      await logUserAction(
        'LOGOUT',
        'auth',
        user.id,
        null,
        { email: user.email }
      );
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setUser(null);
    setProfile(null);
    setLoading(false);
    console.log('✅ Signed out successfully');
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) await fetchProfile(user.id);
  };

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signOut, refreshProfile }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};