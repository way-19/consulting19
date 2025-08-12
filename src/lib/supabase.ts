import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Country {
  id: string
  name: string
  slug: string
  flag_emoji?: string
  description?: string
  primary_language: string
  supported_languages: string[]
  status: boolean
  created_at: string
}

export interface Profile {
  id: string;
  user_id: string; // This links to auth.users.id
  email: string;
  role: 'admin' | 'consultant' | 'client' | 'legal_reviewer';
  full_name?: string;
  phone?: string;
  language?: string;
  timezone?: string;
  company_name?: string;
  business_type?: string;
  address?: string;
  preferred_currency?: string;
  marketing_consent?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string
  profile_id: string
  assigned_consultant_id?: string
  company_name?: string
  phone?: string
  status: 'new' | 'in_progress' | 'completed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  service_type: string
  progress: number
  satisfaction_rating?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  client_id: string
  consultant_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  client_id: string
  name: string
  type: string
  category: 'identity' | 'business' | 'financial' | 'medical' | 'other'
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  file_url?: string
  file_size?: number
  uploaded_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface ConsultantCountryAssignment {
  id: string
  consultant_id: string
  country_id: string
  is_primary: boolean
  status: string
  created_at: string
}

export interface CustomService {
  id: string
  consultant_id: string
  country_id?: string
  title: string
  description?: string
  features: string[]
  price: number
  currency: string
  delivery_time_days: number
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceOrder {
  id: string
  service_id: string
  client_id: string
  consultant_id: string
  status: 'pending' | 'paid' | 'in_progress' | 'completed' | 'cancelled'
  total_amount: number
  currency: string
  stripe_payment_intent_id?: string
  invoice_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ServicePayment {
  id: string
  order_id: string
  stripe_payment_intent_id: string
  stripe_charge_id?: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
  payment_method?: string
  created_at: string
  updated_at: string
}
// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles') 
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('Current user:', user.id, user.email)
  console.log('Profile data:', profile)
  return profile as Profile | null
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (data.user && !error) {
    // Profile will be created automatically by trigger
    // Update with additional data if provided
    if (Object.keys(userData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('user_id', data.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }
  }

  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Helper functions for role-based queries
export const isAdmin = async () => {
  const profile = await getCurrentProfile()
  return profile?.role === 'admin'
}

export const isConsultant = async () => {
  const profile = await getCurrentProfile()
  return profile?.role === 'consultant'
}

export const isClient = async () => {
  const profile = await getCurrentProfile()
  return profile?.role === 'client'
}

// Get consultant's assigned countries
export const getConsultantCountries = async (consultantId?: string) => {
  const profile = await getCurrentProfile()
  const targetConsultantId = consultantId || profile?.id
  
  if (!targetConsultantId) return []

  const { data } = await supabase
    .from('consultant_country_assignments')
    .select(`
      *,
      countries:country_id (*)
    `)
    .eq('consultant_id', targetConsultantId)
    .eq('status', 'active')

  return data || []
}

// Get client's assigned consultant
export const getClientConsultant = async (clientId?: string) => {
  const profile = await getCurrentProfile()
  
  if (!clientId && profile?.role !== 'client') return null

  const { data } = await supabase
    .from('clients')
    .select(`
      *,
      profile:profile_id (
        *
      )
    `)
    .eq('profile_id', clientId || profile?.user_id)
    .single()

  return data
}

// Get consultant's clients
export const getConsultantClients = async (consultantId?: string) => {
  const profile = await getCurrentProfile()
  const targetConsultantId = consultantId || profile?.id
  
  if (!targetConsultantId) return []

  const { data } = await supabase
    .from('clients')
    .select(`
      *,
      profile:profile_id (
        *
      )
    `)
    .eq('assigned_consultant_id', targetConsultantId)

  return data || []
}