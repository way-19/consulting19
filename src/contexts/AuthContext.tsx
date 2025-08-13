import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Try both auth_user_id and id columns
      const { data: profileByAuthId, error: authIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();
      
      if (profileByAuthId) {
        console.log('✅ Profile found by auth_user_id:', profileByAuthId);
        return profileByAuthId;
      }

      console.log('⚠️ Profile not found by auth_user_id, trying by id...');
      
      const { data: profileById, error: idError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileById) {
        console.log('✅ Profile found by id:', profileById);
        return profileById;
      }

      console.error('❌ Profile not found by either method');
      console.error('Auth ID error:', authIdError);
      console.error('ID error:', idError);
      
      return null;
    } catch (error) {
      console.error('💥 Profile fetch failed:', error);
      return null;
    }
  };

  const navigateBasedOnRole = (userProfile: Profile) => {
    console.log('🧭 Navigating based on role:', userProfile.role);
    
    switch (userProfile.role) {
      case 'admin':
        console.log('➡️ Navigating to admin dashboard');
        navigate('/admin-dashboard');
        break;
      case 'consultant':
        console.log('➡️ Navigating to consultant dashboard');
        navigate('/consultant-dashboard');
        break;
      case 'client':
        console.log('➡️ Navigating to client dashboard');
        navigate('/client-accounting');
        break;
      default:
        console.log('➡️ Navigating to home (unknown role)');
        navigate('/');
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('👤 Session found:', session.user.email);
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile, staying on current page');
          }
        }
      } catch (error) {
        console.error('💥 Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after sign in');
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in:', email);
    setLoading(true);
    
    try {
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
      // Navigation will happen in auth state change handler
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
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