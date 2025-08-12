import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Prevent double initialization in StrictMode
  const didInit = useRef(false)
  const navigate = useNavigate()

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user ID:', userId)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching profile:', error.message, error.code)
        return null
      }

      console.log('✅ Profile fetched successfully:', {
        id: profile?.id,
        email: profile?.email,
        role: profile?.role,
        full_name: profile?.full_name
      })
      return profile as Profile
    } catch (error) {
      console.error('💥 Unexpected error in fetchProfile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id)
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  const redirectBasedOnRole = (userProfile: Profile) => {
    const currentPath = window.location.pathname
    console.log('🎯 Redirecting based on role:', userProfile.role, 'from path:', currentPath)
    
    // Only redirect from login page
    if (currentPath !== '/login') return
    
    let targetPath = '/'
    
    switch (userProfile.role) {
      case 'admin':
        targetPath = '/admin-dashboard'
        break
      case 'consultant':
        targetPath = '/consultant-dashboard'
        break
      case 'client':
        targetPath = '/client-accounting'
        break
      default:
        targetPath = '/'
    }
    
    console.log('🔄 Navigating to:', targetPath)
    navigate(targetPath)
  }

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (didInit.current) {
      console.log('⚠️ AuthProvider already initialized, skipping...')
      return
    }
    didInit.current = true
    
    console.log('🚀 AuthProvider initializing...')
    
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        console.log('📋 Initial session check:', session ? 'Session found' : 'No session')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 User found in session:', session.user.email)
          const userProfile = await fetchProfile(session.user.id)
          if (isMounted) {
            setProfile(userProfile)
            if (userProfile) {
              redirectBasedOnRole(userProfile)
            }
          }
        }
        
        if (isMounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      console.log('🔔 Auth state changed:', event, session ? `Session exists for ${session.user.email}` : 'No session')
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setHasRedirected(false)
        return
      }
      
      setUser(session?.user || null)
      if (session?.user) {
        console.log('👤 Fetching profile for user:', session.user.email)
        const userProfile = await fetchProfile(session.user.id)
        if (isMounted) {
          console.log('✅ Profile loaded, setting profile:', userProfile?.email, userProfile?.role)
          setProfile(userProfile)
          
          if (event === 'SIGNED_IN' && userProfile) {
            redirectBasedOnRole(userProfile)
          }
        }
      } else {
        console.log('🚪 User logged out, clearing profile')
        if (isMounted) {
          setProfile(null)
        }
      }
    })

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Sign in error:', error.message)
    } else {
      console.log('✅ Sign in successful')
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    await supabase.auth.signOut()
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}