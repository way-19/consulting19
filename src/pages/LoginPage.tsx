import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Globe, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, user, profile, profileLoaded, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // If already logged in, show dashboard button
  if (user && profile && profileLoaded && !authLoading) {
    const goToDashboard = () => {
      const role = profile.role
      if (role === 'admin') {
        navigate('/admin-dashboard')
      } else if (role === 'consultant') {
        navigate('/consultant-dashboard')
      } else if (role === 'client') {
        navigate('/client-accounting')
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <img 
                src="/image.png" 
                alt="Consulting19 Logo" 
                className="h-20 w-40"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <Globe className="h-20 w-40 text-purple-600 hidden" />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">You are already logged in as {profile.role}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-900 mb-2">
                {profile.full_name || profile.email}
              </p>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.role}
              </span>
            </div>
            
            <button
              onClick={goToDashboard}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (loading || (user && profile && profileLoaded)) {
      console.log('⚠️ Already logged in or loading, preventing submission')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Login attempt for:', email)
      await signIn(email, password)
      console.log('✅ Login successful, NavigationHandler will handle redirect')
      // Clear form to prevent resubmission
      setEmail('')
      setPassword('')
    } catch (err: any) {
      console.error('❌ Login error:', err.message)
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please check your credentials.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (userEmail: string, userPassword: string) => {
    // Prevent double submission
    if (loading || (user && profile && profileLoaded)) {
      console.log('⚠️ Already logged in or loading, preventing quick login')
      return
    }
    
    setEmail(userEmail)
    setPassword(userPassword)
    setError('')
    setLoading(true)

    try {
      console.log('⚡ Quick login attempt for:', userEmail)
      await signIn(userEmail, userPassword)
      console.log('✅ Quick login successful, AuthContext will handle redirect')
    } catch (err: any) {
      console.error('❌ Quick login error:', err.message)
      if (err.message === 'Invalid login credentials') {
        setError(`User ${userEmail} not found. Please create this user in your Supabase Dashboard.`)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <img 
              src="/image.png" 
              alt="Consulting19 Logo" 
              className="h-20 w-40"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <Globe className="h-20 w-40 text-purple-600 hidden" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Quick Login Buttons for Development */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-green-800 mb-3">🏢 Production Users Ready</h3>
          <p className="text-xs text-blue-700 mb-3 font-medium">
            Production users are created automatically. Login with:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin@consulting19.com', 'SecureAdmin2025!')}
              className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              👑 Admin Panel - admin@consulting19.com
            </button>
            <button
              onClick={() => quickLogin('georgia@consulting19.com', 'GeorgiaConsult2025!')}
              className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading} 
            >
              🇬🇪 Georgia Consultant - georgia@consulting19.com
            </button>
            <button
              onClick={() => quickLogin('client.georgia@consulting19.com', 'ClientGeorgia2025!')}
              className="w-full text-left px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              👤 Test Client - client.georgia@consulting19.com
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-purple-600 hover:text-purple-500 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Consulting19. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage