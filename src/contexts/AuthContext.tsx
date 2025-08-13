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
      
      // Attempt 1: Query by auth_user_id
      console.log('🔍 Step 1: Querying by auth_user_id...');
      const { data: profileByAuthId, error: authIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();
      
      console.log('🔍 Step 1 Results:', { data: profileByAuthId, error: authIdError });
      
      if (authIdError) {
        console.error('❌ Error fetching profile by auth_user_id:', authIdError.message);
        console.error('❌ Full error details:', authIdError);
        console.error('❌ Full error details:', authIdError);
      }
      if (profileByAuthId) {
        console.log('✅ Profile found by auth_user_id:', {
          id: profileByAuthId.id,
          email: profileByAuthId.email,
          role: profileByAuthId.role,
          auth_user_id: profileByAuthId.auth_user_id
        });
          id: profileByAuthId.id,
          email: profileByAuthId.email,
          role: profileByAuthId.role,
          auth_user_id: profileByAuthId.auth_user_id
        });
        return profileByAuthId;
      }

      console.log('⚠️ Profile not found by auth_user_id. Attempting to fetch by id...');
      console.log('🔍 Step 2: Querying by id...');
      
      // Attempt 2: Query by id
      const { data: profileById, error: idError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('🔍 Step 2 Results:', { data: profileById, error: idError });
      
      if (idError) {
        console.error('❌ Error fetching profile by id:', idError.message);
        console.error('❌ Full error details:', idError);
        console.error('❌ Full error details:', idError);
      }
      if (profileById) {
        console.log('✅ Profile found by id:', {
          id: profileById.id,
          email: profileById.email,
          role: profileById.role,
          auth_user_id: profileById.auth_user_id
        });
          id: profileById.id,
          email: profileById.email,
          role: profileById.role,
          auth_user_id: profileById.auth_user_id
        });
        return profileById;
      }

      // Attempt 3: Query by email as last resort
      console.log('⚠️ Profile not found by id either. Trying by email...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        console.log('🔍 Step 3: Querying by email:', session.user.email);
        const { data: profileByEmail, error: emailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();
        
        console.log('🔍 Step 3 Results:', { data: profileByEmail, error: emailError });
        
        if (emailError) {
          console.error('❌ Error fetching profile by email:', emailError.message);
          console.error('❌ Full error details:', emailError);
        }
        if (profileByEmail) {
          console.log('✅ Profile found by email:', {
            id: profileByEmail.id,
            email: profileByEmail.email,
            role: profileByEmail.role,
            auth_user_id: profileByEmail.auth_user_id
          });
          return profileByEmail;
        }
      }
      
      console.error('❌ Profile not found by any method (auth_user_id, id, or email) for user:', userId);
      console.error('❌ Available debugging info:');
      console.error('   - Auth user ID:', userId);
      console.error('   - Auth user email:', session?.user?.email);
      console.error('   - Auth ID error:', authIdError?.message || 'None');
      console.error('   - ID error:', idError?.message || 'None');
      
      console.log('⚠️ Profile not found by id either. Trying by email...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data: profileByEmail, error: emailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();
        
        if (emailError) {
          console.error('❌ Error fetching profile by email:', emailError.message);
          console.error('❌ Full error details:', emailError);
        }
        if (profileByEmail) {
          console.log('✅ Profile found by email:', {
            id: profileByEmail.id,
            email: profileByEmail.email,
            role: profileByEmail.role,
            auth_user_id: profileByEmail.auth_user_id
          });
          return profileByEmail;
        }
      }
      
      console.error('❌ Profile not found by any method (auth_user_id, id, or email) for user:', userId);
      console.error('❌ Available debugging info:');
      console.error('   - Auth user ID:', userId);
      console.error('   - Auth user email:', session?.user?.email);
      console.error('   - Auth ID error:', authIdError?.message || 'None');
      console.error('   - ID error:', idError?.message || 'None');
      
      return null;
    } catch (error) {
      console.error('💥 General error during profile fetch:', error);
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
            console.log('✅ Profile loaded successfully, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after session found. User will stay on current page.');
            console.error('❌ This means the user exists in auth.users but not in profiles table.');
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
            console.log('✅ Profile loaded after sign in, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after sign in. This is a critical issue.');
            console.error('❌ User authenticated but profile missing from database.');
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
        console.error('❌ Full sign in error:', error);
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