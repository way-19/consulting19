import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Immediate redirect based on email
      if (email.includes('admin')) {
        window.location.href = '/admin-dashboard';
      } else if (email.includes('georgia')) {
        window.location.href = '/consultant-dashboard';
      } else if (email.includes('client')) {
        window.location.href = '/client-accounting';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError('Giriş başarısız');
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string, dashboard: string) => {
    setEmail(email);
    setPassword(password);
    
    supabase.auth.signInWithPassword({ email, password }).then(() => {
      window.location.href = dashboard;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Globe className="h-12 w-12 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Consulting19</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Giriş Yap</h2>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-3">🚀 Hızlı Giriş</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('🔴 Admin Dashboard clicked');
                window.location.href = '/admin-dashboard';
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => {
                console.log('🟢 Consultant Dashboard clicked');
                window.location.href = '/consultant-dashboard';
              }}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Consultant Dashboard
            </button>
            <button
              onClick={() => {
                console.log('🔵 Client Dashboard clicked');
                window.location.href = '/client-accounting';
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Client Dashboard
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
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

        {/* Test Credentials */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3">🔑 Test Hesapları</h3>
          <div className="space-y-2 text-xs">
            <div className="bg-white rounded p-2">
              <strong>Admin:</strong> admin@consulting19.com / SecureAdmin2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Danışman:</strong> georgia@consulting19.com / GeorgiaConsult2025!
            </div>
            <div className="bg-white rounded p-2">
              <strong>Müşteri:</strong> client.georgia@consulting19.com / ClientGeorgia2025!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Consulting19. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;