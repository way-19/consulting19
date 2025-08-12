import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Globe, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // If user is logged in and has profile, redirect to dashboard
  if (user && profile && !authLoading) {
    const role = profile.role;
    if (role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else if (role === 'consultant') {
      navigate('/consultant-dashboard', { replace: true });
    } else if (role === 'client') {
      navigate('/client-accounting', { replace: true });
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading) return;
    
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      // Navigation will be handled by the redirect logic above
    } catch (err: any) {
      console.error('❌ Login error:', err.message)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = email.trim().length > 0 && password.trim().length > 0
  const isButtonDisabled = loading || authLoading || !isFormValid

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

        {/* Quick Login Credentials */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-3">🏢 Test Credentials</h3>
          <div className="space-y-2 text-xs">
            <div className="bg-white rounded p-2">
              <strong>Admin:</strong> admin@consulting19.com / SecureAdmin2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Consultant:</strong> georgia@consulting19.com / GeorgiaConsult2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Client:</strong> client.georgia@consulting19.com / ClientGeorgia2025!
            </div>
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

            {/* Debug Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
              <p><strong>Debug:</strong></p>
              <p>Email length: {email.trim().length}</p>
              <p>Password length: {password.trim().length}</p>
              <p>Form valid: {isFormValid ? 'YES' : 'NO'}</p>
              <p>Button disabled: {isButtonDisabled ? 'YES' : 'NO'}</p>
              <p>Loading: {loading ? 'YES' : 'NO'}</p>
              <p>Auth Loading: {authLoading ? 'YES' : 'NO'}</p>
              <p>Has User: {user ? 'YES' : 'NO'}</p>
              <p>Has Profile: {profile ? 'YES' : 'NO'}</p>
              <p>Profile Role: {profile?.role || 'None'}</p>
              
              {user && !profile && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p className="text-red-700 font-bold">⚠️ User exists but no profile found!</p>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="mt-1 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Force Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
              }`}
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