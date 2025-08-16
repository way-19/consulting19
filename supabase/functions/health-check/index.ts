import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'error';
      response_time_ms: number;
      error?: string;
    };
    storage: {
      status: 'healthy' | 'error';
      response_time_ms: number;
      error?: string;
    };
    auth: {
      status: 'healthy' | 'error';
      response_time_ms: number;
      error?: string;
    };
  };
  overall_response_time_ms: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'healthy', response_time_ms: 0 },
        storage: { status: 'healthy', response_time_ms: 0 },
        auth: { status: 'healthy', response_time_ms: 0 }
      },
      overall_response_time_ms: 0
    }

    // Test Database Connection
    try {
      const dbStart = Date.now()
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()

      result.checks.database.response_time_ms = Date.now() - dbStart

      if (error) {
        result.checks.database.status = 'error'
        result.checks.database.error = error.message
        result.status = 'error'
      }
    } catch (error) {
      result.checks.database.status = 'error'
      result.checks.database.error = error.message
      result.status = 'error'
    }

    // Test Storage Connection
    try {
      const storageStart = Date.now()
      const { data, error } = await supabase.storage
        .from('public_images')
        .list('', { limit: 1 })

      result.checks.storage.response_time_ms = Date.now() - storageStart

      if (error) {
        result.checks.storage.status = 'error'
        result.checks.storage.error = error.message
        if (result.status === 'healthy') result.status = 'warning'
      }
    } catch (error) {
      result.checks.storage.status = 'error'
      result.checks.storage.error = error.message
      if (result.status === 'healthy') result.status = 'warning'
    }

    // Test Auth Service
    try {
      const authStart = Date.now()
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })

      result.checks.auth.response_time_ms = Date.now() - authStart

      if (error) {
        result.checks.auth.status = 'error'
        result.checks.auth.error = error.message
        if (result.status === 'healthy') result.status = 'warning'
      }
    } catch (error) {
      result.checks.auth.status = 'error'
      result.checks.auth.error = error.message
      if (result.status === 'healthy') result.status = 'warning'
    }

    result.overall_response_time_ms = Date.now() - startTime

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Health check error:', error)
    
    const errorResult: HealthCheckResult = {
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'error', response_time_ms: 0, error: error.message },
        storage: { status: 'error', response_time_ms: 0, error: 'Not tested due to database error' },
        auth: { status: 'error', response_time_ms: 0, error: 'Not tested due to database error' }
      },
      overall_response_time_ms: Date.now() - startTime
    }

    return new Response(
      JSON.stringify(errorResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})