'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'
import VendorHeader from './VendorHeader'

export default function VendorSettings() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  // Account info state
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountMsg, setAccountMsg] = useState(null)

  // Custom quotes state
  const [customQuotesEnabled, setCustomQuotesEnabled] = useState(true)
  const [quotesSaving, setQuotesSaving] = useState(false)
  const [quotesMsg, setQuotesMsg] = useState(null)

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || '')
      setCustomQuotesEnabled(profile.customQuotesEnabled ?? true)
    }
    if (user) {
      setEmail(user.email || '')
    }
  }, [profile, user])

  async function handleSaveAccount(e) {
    e.preventDefault()
    setAccountSaving(true)
    setAccountMsg(null)

    try {
      const nameChanged = businessName !== (profile?.businessName || '')
      const emailChanged = email !== (user?.email || '')
      const passwordChanged = currentPassword && newPassword

      // Save name to DB
      if (nameChanged) {
        const res = await fetch('/api/vendors/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update business name')
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
      }

      await refreshProfile()

      const messages = []
      if (nameChanged) messages.push('Business name updated.')
      if (emailChanged) messages.push('Confirmation email sent to new address.')
      if (passwordChanged) messages.push('Password updated.')
      setAccountMsg({ type: 'success', text: messages.join(' ') || 'No changes made.' })
    } catch (err) {
      setAccountMsg({ type: 'error', text: err.message })
    } finally {
      setAccountSaving(false)
    }
  }

  async function handleSaveQuotes() {
    setQuotesSaving(true)
    setQuotesMsg(null)

    try {
      const res = await fetch('/api/vendors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuotes: customQuotesEnabled }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update setting')
      }
      await refreshProfile()
      setQuotesMsg({ type: 'success', text: 'Custom quotes preference saved.' })
    } catch (err) {
      setQuotesMsg({ type: 'error', text: err.message })
    } finally {
      setQuotesSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader />
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Account Info */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
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
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            {accountMsg && (
              <p className={`text-sm ${accountMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {accountMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={accountSaving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              {accountSaving ? 'Saving...' : 'Save Account Info'}
            </button>
          </form>
        </section>

        {/* Custom Quotes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Custom Quote Requests</h2>
          <p className="text-sm text-gray-500 mb-6">
            When enabled, customers can send you a custom quote request with their event details.
            You can then respond with a tailored price.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Accept custom quote requests</span>
            <button
              type="button"
              onClick={() => setCustomQuotesEnabled(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                customQuotesEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  customQuotesEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {quotesMsg && (
            <p className={`text-sm mt-3 ${quotesMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {quotesMsg.text}
            </p>
          )}
          <button
            type="button"
            onClick={handleSaveQuotes}
            disabled={quotesSaving}
            className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {quotesSaving ? 'Saving...' : 'Save Preference'}
          </button>
        </section>
      </div>
    </div>
  )
}
