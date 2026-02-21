'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { User, Store } from 'lucide-react'

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
  const [category, setCategory] = useState('Photography')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const isOAuth = searchParams.get('oauth') === 'true'
  const supabase = createClient()

  const categories = [
    'Photography', 'Videography', 'Catering', 'Florist',
    'DJ', 'Live Band/Music', 'Venue', 'Decorator/Stylist', 'Cake', 'Other'
  ]

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

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
            category: role === 'vendor' ? category : undefined,
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
          category: role === 'vendor' ? category : undefined,
          userId: data.user?.id,
          userEmail: data.user?.email,
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

  async function handleGoogleSignUp() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                    />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {!isOAuth && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </button>
                </>
              )}
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
