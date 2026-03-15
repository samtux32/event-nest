'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { User, Store, Eye, EyeOff, Check } from 'lucide-react'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const [step, setStep] = useState(1) // 1 = role select, 2 = details
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [categories, setCategories] = useState([])
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const searchParams = useSearchParams()
  const isOAuth = searchParams.get('oauth') === 'true'
  const refCode = searchParams.get('ref') || ''
  const [googleLoading, setGoogleLoading] = useState(false)
  const supabase = createClient()

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  // Auto-select role from query param (e.g. /register?role=vendor)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roleParam = params.get('role')
    if (roleParam === 'vendor' || roleParam === 'customer') {
      setRole(roleParam)
      setStep(2)
    }
  }, [])

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isOAuth && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      if (isOAuth) {
        // OAuth user already authenticated - just update metadata and create DB record
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role }
        })
        if (updateError) throw updateError

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            fullName: fullName || undefined,
            businessName: businessName || undefined,
            categories: role === 'vendor' ? categories : undefined,
            ref: role === 'vendor' && refCode ? refCode : undefined,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Registration failed')
        }

        window.location.href = role === 'customer' ? '/marketplace' : '/'
        return
      }

      // Email/password signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      })

      if (signUpError) throw signUpError

      // Create DB records (pass userId/email as fallback when email confirmation is on)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          fullName: fullName || undefined,
          businessName: businessName || undefined,
          categories: role === 'vendor' ? categories : undefined,
          userId: data.user?.id,
          userEmail: data.user?.email,
          ref: role === 'vendor' && refCode ? refCode : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Registration failed')
      }

      window.location.href = role === 'customer' ? '/marketplace' : '/'
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-1.5 text-purple-200 hover:text-white text-sm mb-6 transition-colors">
          ← Back to home
        </Link>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="Event Nest" className="w-16 h-16 rounded-xl object-cover brightness-0 invert" />
            <div className="font-bold text-2xl text-white leading-tight">Event<br/>Nest</div>
          </div>
          <p className="text-purple-200">
            {isOAuth ? 'Complete your profile' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">I am a...</h2>
              <p className="text-sm text-gray-500 mb-6">Choose how you&apos;ll use Event Nest</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setRole('customer')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    role === 'customer'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <User size={32} className={role === 'customer' ? 'text-purple-600' : 'text-gray-400'} />
                  <h3 className="font-semibold text-gray-900 mt-3">Customer</h3>
                  <p className="text-sm text-gray-500 mt-1">Planning an event and looking for vendors</p>
                </button>

                <button
                  onClick={() => setRole('vendor')}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    role === 'vendor'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Store size={32} className={role === 'vendor' ? 'text-purple-600' : 'text-gray-400'} />
                  <h3 className="font-semibold text-gray-900 mt-3">Vendor</h3>
                  <p className="text-sm text-gray-500 mt-1">Offering event services to customers</p>
                </button>
              </div>

              <button
                onClick={() => { if (role) setStep(2) }}
                disabled={!role}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Continue
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-400">or</span></div>
              </div>

              <button
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.462.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-purple-600 hover:text-purple-700 mb-2"
              >
                &larr; Back to role selection
              </button>

              {!isOAuth && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="Min 6 characters"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        placeholder="Re-enter your password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {role === 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              {role === 'vendor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                    <div className="flex flex-wrap gap-2">
                      {['Photography', 'Videography', 'Catering', 'Florist', 'DJ', 'Live Band/Music', 'Venue', 'Decorator/Stylist', 'Cake', 'Other'].map(cat => {
                        const selected = categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategories(prev => selected ? prev.filter(c => c !== cat) : [...prev, cat])}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              selected
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {selected && <Check size={14} />}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 accent-purple-600"
                  required
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline" target="_blank">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline" target="_blank">Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreedToTerms || (role === 'vendor' && categories.length === 0)}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

            </form>
          )}

          {!isOAuth && (
            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 font-medium hover:text-purple-700">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
