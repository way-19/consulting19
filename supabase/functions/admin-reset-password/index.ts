import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ResetPasswordRequest {
  userId: string;
  newPassword?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('legacy_role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.legacy_role !== 'admin') {
      throw new Error('Insufficient permissions')
    }

    // Parse request body
    const { userId, newPassword }: ResetPasswordRequest = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Generate secure random password if not provided
    const password = newPassword || generateSecurePassword()

    // Get user profile to get auth_user_id
    const { data: targetProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('auth_user_id, email, full_name')
      .eq('id', userId)
      .single()

    if (profileError || !targetProfile) {
      throw new Error('User not found')
    }

    // Reset password using admin API
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUser(
      targetProfile.auth_user_id,
      { password: password }
    )

    if (resetError) {
      throw new Error(`Failed to reset password: ${resetError.message}`)
    }

    // Log the admin action
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: 'RESET_USER_PASSWORD',
        target_table: 'profiles',
        target_id: userId,
        new_values: { password_reset: true },
        timestamp: new Date().toISOString()
      }])

    // Return success with temporary password
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password reset successfully',
        temporaryPassword: password,
        userEmail: targetProfile.email,
        userName: targetProfile.full_name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Password reset error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function generateSecurePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  // Ensure password has at least one uppercase, lowercase, number, and special char
  if (!/[A-Z]/.test(password)) password = password.slice(0, -1) + 'A'
  if (!/[a-z]/.test(password)) password = password.slice(0, -2) + 'a' + password.slice(-1)
  if (!/[0-9]/.test(password)) password = password.slice(0, -3) + '1' + password.slice(-2)
  if (!/[!@#$%^&*]/.test(password)) password = password.slice(0, -4) + '!' + password.slice(-3)
  
  return password
}