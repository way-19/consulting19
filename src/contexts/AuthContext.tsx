import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'consultant' | 'client';
  country?: string;
  avatar_url?: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
};

type AuthContextValue = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fetchProfile = async (userId: string, email: string): Promise<Profile | null> => {
  console.log('🔍 Fetching profile for:', email, 'ID:', userId);
  
  try {
    // Try to get profile by auth_user_id first
    const { data: profileByAuthId, error: authIdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (profileByAuthId) {
      console.log('✅ Profile found by auth_user_id:', profileByAuthId.email, profileByAuthId.role);
      return profileByAuthId;
    }

    // Fallback: try by email
    const { data: profileByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileByEmail) {
      console.log('✅ Profile found by email:', profileByEmail.email, profileByEmail.role);
      
      // Update auth_user_id if missing
      if (!profileByEmail.auth_user_id) {
        await supabase
          .from('profiles')
          .update({ auth_user_id: userId })
          .eq('id', profileByEmail.id);
        console.log('🔗 Updated auth_user_id for profile');
      }
      
      return profileByEmail;
    }

    // If no profile found, create mock profile for development
    console.log('📝 Using mock profile data for user:', email);
    const mockProfile: Profile = {
      id: userId,
      email: email,
      full_name: email.includes('admin') ? 'Platform Administrator' :
                email.includes('georgia') && !email.includes('client') ? 'Georgia Consultant' :
                email.includes('client') ? 'Test Client' :
                'User',
      role: email.includes('admin') ? 'admin' :
            email.includes('georgia') && !email.includes('client') ? 'consultant' :
            'client',
      country: email.includes('georgia') ? 'Georgia' : undefined,
      auth_user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to insert the mock profile
    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([mockProfile]);
      
      if (!insertError) {
        console.log('✅ Mock profile created:', email, mockProfile.role);
        return mockProfile;
      }
    } catch (insertErr) {
      console.log('⚠️ Could not insert mock profile, using in-memory profile');
    }

    return mockProfile;

  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return null;
  }
};

const navigateBasedOnRole = (profile: Profile, navigate: any, location: any) => {
  console.log('🧭 Navigating based on role:', profile.role);
  
  const currentPath = location.pathname;
  
  // Define allowed paths for each role
  const allowedPaths = {
    admin: ['/admin-dashboard', '/account-settings'],
    consultant: ['/consultant-dashboard', '/consultant-services', '/legacy-orders', '/customers-management', '/payments', '/account-settings'],
    client: ['/client-accounting', '/client-services', '/account-settings']
  };
  
  const rolePaths = allowedPaths[profile.role] || [];
  
  // If user is on an allowed path for their role, don't redirect
  if (rolePaths.some(path => currentPath.startsWith(path))) {
    console.log('✅ Already on correct path:', currentPath);
    return;
  }
  
  // Redirect to appropriate dashboard
  const dashboardPaths = {
    admin: '/admin-dashboard',
    consultant: '/consultant-dashboard', 
    client: '/client-accounting'
  };
  
  const targetPath = dashboardPaths[profile.role];
  if (targetPath && currentPath !== targetPath) {
    console.log('➡️ Navigating from', currentPath, 'to', targetPath);
    navigate(targetPath);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('👤 Session found:', session.user.email);
          if (mounted) {
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id, session.user.email || '');
            if (userProfile && mounted) {
              setProfile(userProfile);
              console.log('✅ Profile loaded successfully, navigating...');
              navigateBasedOnRole(userProfile, navigate, location);
            }
          }
        } else {
          console.log('❌ No session found');
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id, session.user.email || '');
          if (userProfile && mounted) {
            setProfile(userProfile);
            console.log('✅ Profile loaded after sign in, navigating...');
            navigateBasedOnRole(userProfile, navigate, location);
          }
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, location]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setProfile(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email);
        // Profile will be loaded by the auth state change listener
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};