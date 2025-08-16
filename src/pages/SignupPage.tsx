/* __backup__ 2025-08-12 15:02 */
// import React, { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { Globe, Mail, Lock, User, AlertCircle, Eye, EyeOff, Building } from 'lucide-react'
// import { signUp } from '../lib/supabase'
// 
// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     fullName: '',
//     role: 'client' as 'admin' | 'consultant' | 'client',
//     country: 'Georgia'
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   
//   const navigate = useNavigate()
// 
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
// 
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match')
//       return
//     }
// 
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters')
//       return
//     }
// 
//     setLoading(true)
// 
//     try {
//       const { error } = await signUp(formData.email, formData.password, {
//         role: formData.role,
//         full_name: formData.fullName,
//         country: formData.role === 'consultant' ? formData.country : undefined,
//       })
//       
//       if (error) {
//         setError(error.message)
//       } else {
//         navigate('/login', { 
//           state: { 
//             message: 'Account created successfully! Please sign in.' 
//           } 
//         })
//       }
//     } catch {

//       setError('An unexpected error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }
// 
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     })
//   }
// 
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <Link to="/" className="inline-flex items-center space-x-2 mb-6">
//             <img 
//               src="/image.png" 
//               alt="Consulting19 Logo" 
//               className="h-20 w-40"
//               onError={(e) => {
//                 // Fallback to icon if logo fails to load
//                 e.currentTarget.style.display = 'none';
//                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
//               }}
//             />
//             <Globe className="h-20 w-40 text-purple-600 hidden" />
//           </Link>
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
//           <p className="text-gray-600">Join our global business consulting platform</p>
//         </div>
// 
//         {/* Signup Form */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                 <span className="text-sm text-red-700">{error}</span>
//               </div>
//             )}
// 
//             <div>
//               <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="fullName"
//                   name="fullName"
//                   type="text"
//                   required
//                   value={formData.fullName}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//                   placeholder="Enter your full name"
//                 />
//               </div>
//             </div>
// 
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>
// 
//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//                 Account Type
//               </label>
//               <div className="relative">
//                 <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <select
//                   id="role"
//                   name="role"
//                   required
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors appearance-none bg-white"
//                 >
//                   <option value="client">Client - Looking for business services</option>
//                   <option value="consultant">Consultant - Providing services</option>
//                   <option value="admin">Admin - Platform management</option>
//                 </select>
//               </div>
//             </div>
// 
//             {formData.role === 'consultant' && (
//               <div>
//                 <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
//                   Country Specialization
//                 </label>
//                 <select
//                   id="country"
//                   name="country"
//                   required
//                   value={formData.country}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors appearance-none bg-white"
//                 >
//                   <option value="Georgia">🇬🇪 Georgia</option>
//                   <option value="USA">🇺🇸 United States</option>
//                   <option value="Estonia">🇪🇪 Estonia</option>
//                   <option value="UAE">🇦🇪 UAE</option>
//                 </select>
//               </div>
//             )}
// 
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="new-password"
//                   required
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//                   placeholder="Create a password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>
// 
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   autoComplete="new-password"
//                   required
//                   value={formData.confirmPassword}
//                   onChange={handleInputChange}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
//                   placeholder="Confirm your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>
// 
//             <div className="flex items-center">
//               <input
//                 id="terms"
//                 name="terms"
//                 type="checkbox"
//                 required
//                 className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
//               />
//               <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
//                 I agree to the{' '}
//                 <Link to="/terms" className="text-purple-600 hover:text-purple-500">
//                   Terms of Service
//                 </Link>{' '}
//                 and{' '}
//                 <Link to="/privacy" className="text-purple-600 hover:text-purple-500">
//                   Privacy Policy
//                 </Link>
//               </label>
//             </div>
// 
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </form>
// 
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium">
//                 Sign in here
//               </Link>
//             </p>
//           </div>
//         </div>
// 
//         {/* Footer */}
//         <div className="text-center text-sm text-gray-500">
//           <p>© 2025 Consulting19. All rights reserved.</p>
//         </div>
//       </div>
//     </div>
//   )
// }
// 
// export default SignupPage
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Mail, Lock, User, AlertCircle, Eye, EyeOff, Building } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'client' as 'admin' | 'consultant' | 'client',
    country: 'Georgia'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
      } else {
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              legacy_role: formData.role,
              full_name: formData.fullName,
              country: formData.role === 'consultant' ? formData.country : undefined,
            })
            .eq('auth_user_id', data.user.id)

          if (profileError) {
            console.error('❌ Profile update error:', profileError.message)
          }
          
          // Track user registration
          trackBusinessEvent.userRegistration('email', formData.role);
        }
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please sign in.'
          }
        })
      }
    } catch {

      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Globe className="h-20 w-40 text-purple-600 hidden" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Consulting19</h2>
          <p className="text-gray-600">Create your account and start your global business journey</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-pulse">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Registration Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white"
                >
                  <option value="client">Client - Looking for business services</option>
                  <option value="consultant">Consultant - Providing expert services</option>
                  <option value="admin">Administrator - Platform management</option>
                </select>
              </div>
            </div>

            {formData.role === 'consultant' && (
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country Specialization
                </label>
                <p className="text-xs text-gray-500 mb-2">Select your primary area of expertise</p>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none bg-white"
                >
                  <option value="Georgia">🇬🇪 Georgia</option>
                  <option value="USA">🇺🇸 United States</option>
                  <option value="Estonia">🇪🇪 Estonia</option>
                  <option value="UAE">🇦🇪 UAE</option>
                  <option value="Malta">🇲🇹 Malta</option>
                  <option value="Switzerland">🇨🇭 Switzerland</option>
                  <option value="Portugal">🇵🇹 Portugal</option>
                  <option value="Spain">🇪🇸 Spain</option>
                  <option value="Turkey">🇹🇷 Turkey</option>
                  <option value="Germany">🇩🇪 Germany</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Password must be at least 6 characters long</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign in here
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

export default SignupPage
