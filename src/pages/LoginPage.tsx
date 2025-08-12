import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Globe, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signOut, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user && profile) {
      const roleRoutes = {
        admin: '/admin-dashboard',
        consultant: '/consultant-dashboard',
        client: '/client-accounting'
      } as const
      
      const route = roleRoutes[profile.role as keyof typeof roleRoutes]
      if (route) {
        navigate(route, { replace: true })
      }
    }
  }, [authLoading, user, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('❌ Login error:', message)
      setError('Geçersiz giriş bilgileri. Lütfen email ve şifrenizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = email.trim().length > 0 && password.trim().length > 0
  const isButtonDisabled = loading || authLoading || !isFormValid

  if (user && !profile && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Profil Bulunamadı</h2>
          <p className="text-gray-600">Bu kullanıcı için profil kaydı bulunamadı.</p>
          <button
            onClick={signOut}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    )
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h2>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        {/* Quick Login Credentials */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-3">🏢 Giriş Bilgileri</h3>
          <div className="space-y-2 text-xs">
            <div className="bg-white rounded p-2">
              <strong>Yönetici:</strong> admin@consulting19.com / SecureAdmin2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Danışman:</strong> georgia@consulting19.com / GeorgiaConsult2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Müşteri:</strong> client.georgia@consulting19.com / ClientGeorgia2025!
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
                Email Adresi
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
                  placeholder="Email adresinizi girin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
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
                  placeholder="Şifrenizi girin"
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
                  Beni hatırla
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-purple-600 hover:text-purple-500 font-medium">
                  Şifremi unuttum
                </Link>
              </div>
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
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Consulting19. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage