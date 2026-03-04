'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'
import AppHeader from './AppHeader'
import { HelpCircle, FileText, Shield, Eye, EyeOff, Star, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

export default function CustomerSettings() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [vendorSaving, setVendorSaving] = useState(false)
  const [vendorMsg, setVendorMsg] = useState(null)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsFetched, setReviewsFetched] = useState(false)

  useEffect(() => {
    if (profile) setFullName(profile.fullName || '')
    if (user) setEmail(user.email || '')
  }, [profile, user])

  useEffect(() => {
    if (!reviewsOpen || reviewsFetched) return
    setReviewsLoading(true)
    fetch('/api/customer-reviews/received')
      .then(r => r.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews)
        setReviewsFetched(true)
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [reviewsOpen, reviewsFetched])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    try {
      const nameChanged = fullName !== (profile?.fullName || '')
      const emailChanged = email !== (user?.email || '')
      const passwordChanged = currentPassword && newPassword
      if (passwordChanged && newPassword !== confirmPassword) {
        setMsg({ type: 'error', text: 'New passwords do not match.' })
        setSaving(false)
        return
      }

      // Save name to DB
      if (nameChanged) {
        const res = await fetch('/api/customers/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update name')
        }
      }

      // Update email via Supabase
      if (emailChanged) {
        const { error } = await supabase.auth.updateUser({ email })
        if (error) throw new Error(error.message)
      }

      // Update password via Supabase
      if (passwordChanged) {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw new Error(error.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }

      await refreshProfile()

      const messages = []
      if (nameChanged) messages.push('Name updated.')
      if (emailChanged) messages.push('Confirmation email sent to new address.')
      if (passwordChanged) messages.push('Password updated.')
      setMsg({ type: 'success', text: messages.join(' ') || 'No changes made.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleBecomeVendor(e) {
    e.preventDefault()
    if (!businessName.trim()) return
    setVendorSaving(true)
    setVendorMsg(null)

    try {
      const res = await fetch('/api/auth/become-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create vendor profile')

      await refreshProfile()
      window.location.href = '/dashboard'
    } catch (err) {
      setVendorMsg({ type: 'error', text: err.message })
    } finally {
      setVendorSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Account Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">A confirmation email will be sent to the new address.</p>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Change Password</p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            </div>
            {msg && (
              <p className={`text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {msg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              {saving ? 'Saving...' : 'Save Account Info'}
            </button>
          </form>
        </section>

        {/* Reviews About Me */}
        <section className="bg-white rounded-xl border border-gray-200">
          <button
            onClick={() => setReviewsOpen(p => !p)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <Star size={20} className="text-amber-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reviews About Me</h2>
                <p className="text-sm text-gray-500">See what vendors have said about you</p>
              </div>
            </div>
            {reviewsOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          {reviewsOpen && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-purple-600" size={24} />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Star className="mx-auto mb-2" size={32} />
                  <p className="text-sm">No reviews yet. Vendors can leave reviews after completed bookings.</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-purple-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-700">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                      <p>from vendors you've worked with</p>
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-2">
                          {review.vendor?.profileImageUrl ? (
                            <img src={review.vendor.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                              {review.vendor?.businessName?.[0] || 'V'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{review.vendor?.businessName || 'Vendor'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{review.text}</p>
                        {review.booking?.eventType && (
                          <p className="text-xs text-gray-500 mt-2">
                            {review.booking.eventType}
                            {review.booking.eventDate && ` — ${new Date(review.booking.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Become a Vendor */}
        {profile?.role === 'customer' && (
          <section id="become-vendor" className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Become a Vendor</h2>
            <p className="text-sm text-gray-500 mb-4">List your services and start receiving bookings.</p>
            <form onSubmit={handleBecomeVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sam's Photography"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              {vendorMsg && (
                <p className={`text-sm ${vendorMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {vendorMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={vendorSaving || !businessName.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {vendorSaving ? 'Creating...' : 'Create Vendor Profile'}
              </button>
            </form>
          </section>
        )}

        {/* Help & Legal */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Help & Legal</h2>
          <div className="space-y-2">
            <Link href="/help" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <HelpCircle size={18} className="text-gray-400" />
              Help & FAQ
            </Link>
            <Link href="/terms" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <FileText size={18} className="text-gray-400" />
              Terms of Service
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Shield size={18} className="text-gray-400" />
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
