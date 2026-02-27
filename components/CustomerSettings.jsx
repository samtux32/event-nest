'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'
import AppHeader from './AppHeader'
import { HelpCircle, FileText, Shield, Eye, EyeOff } from 'lucide-react'

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

  useEffect(() => {
    if (profile) setFullName(profile.fullName || '')
    if (user) setEmail(user.email || '')
  }, [profile, user])

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
