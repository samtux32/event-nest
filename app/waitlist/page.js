'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Check, Star, Users, TrendingUp, Eye, MessageSquare } from 'lucide-react'

// ─── Slide mockup components (outside main component to avoid re-creation) ───

function SlideMarketplace() {
  return (
    <div className="flex flex-col h-full p-6 pb-14">
      <h2 className="text-2xl font-bold text-white mb-1">Find the Perfect Vendors</h2>
      <p className="text-purple-200 text-sm mb-5">Browse thousands of vendors in seconds</p>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          { name: 'Sarah Photography', rating: '4.9', grad: 'from-pink-400 to-orange-400', reviews: 48 },
          { name: 'Beats DJ', rating: '4.8', grad: 'from-blue-400 to-purple-400', reviews: 32 },
          { name: 'Taste Catering', rating: '5.0', grad: 'from-green-400 to-emerald-400', reviews: 61 },
          { name: 'Bloom Florist', rating: '4.7', grad: 'from-rose-400 to-pink-400', reviews: 27 },
        ].map((v) => (
          <div key={v.name} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className={`w-full h-14 bg-gradient-to-br ${v.grad} rounded-lg mb-2`} />
            <p className="text-white text-xs font-semibold truncate">{v.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="fill-yellow-300 text-yellow-300" />
              <span className="text-yellow-200 text-xs font-medium">{v.rating}</span>
              <span className="text-purple-300 text-xs">({v.reviews})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideQuotes() {
  return (
    <div className="flex flex-col h-full p-6 pb-14">
      <h2 className="text-2xl font-bold text-white mb-1">Get Instant Quotes</h2>
      <p className="text-purple-200 text-sm mb-5">Compare prices from multiple vendors</p>
      <div className="space-y-2.5 flex-1">
        {[
          { name: 'Sarah Photography', price: '£1,200', desc: '8 hours coverage + album', badge: 'Best Value' },
          { name: 'Pro Lens Studio', price: '£1,500', desc: '10 hours + 2 photographers', badge: null },
          { name: 'Click & Capture', price: '£800', desc: '5 hours + digital copies', badge: 'Budget' },
        ].map((q) => (
          <div key={q.name} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <p className="text-white text-sm font-semibold">{q.name}</p>
              <p className="text-green-300 text-sm font-bold">{q.price}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-purple-200 text-xs">{q.desc}</p>
              {q.badge && (
                <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-full font-medium">{q.badge}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideReviews() {
  return (
    <div className="flex flex-col h-full p-6 pb-14">
      <h2 className="text-2xl font-bold text-white mb-1">Real Reviews & Photos</h2>
      <p className="text-purple-200 text-sm mb-5">Book with confidence</p>
      <div className="space-y-2.5 flex-1">
        {[
          { title: 'Absolutely stunning!', text: '"Captured our wedding day perfectly. Every photo tells a story."', author: 'Emily R.', rating: 5 },
          { title: 'Professional & fast', text: '"Album delivered in 2 weeks. Exceeded all our expectations!"', author: 'James T.', rating: 5 },
          { title: 'Highly recommend', text: '"Made our corporate event look incredible. Will book again."', author: 'Priya S.', rating: 5 },
        ].map((r) => (
          <div key={r.author} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex gap-0.5 mb-1">
              {[...Array(r.rating)].map((_, i) => (
                <Star key={i} size={11} className="fill-yellow-300 text-yellow-300" />
              ))}
            </div>
            <p className="text-white text-xs font-semibold mb-0.5">{r.title}</p>
            <p className="text-purple-200 text-xs leading-relaxed">{r.text}</p>
            <p className="text-purple-300 text-xs mt-1">— {r.author}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideVendorDashboard() {
  return (
    <div className="flex flex-col h-full p-6 pb-14">
      <h2 className="text-2xl font-bold text-white mb-1">Grow Your Business</h2>
      <p className="text-purple-200 text-sm mb-5">Your vendor dashboard at a glance</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          { icon: Users, value: '42', label: 'Bookings', color: 'text-green-300' },
          { icon: TrendingUp, value: '£8.4k', label: 'Revenue', color: 'text-blue-300' },
          { icon: Eye, value: '156', label: 'Profile Views', color: 'text-purple-300' },
          { icon: MessageSquare, value: '12', label: 'New Enquiries', color: 'text-yellow-300' },
        ].map((s) => (
          <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 text-center">
            <s.icon size={16} className={`${s.color} mx-auto mb-1.5`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-purple-200 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Fake mini chart */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        <p className="text-purple-200 text-xs mb-2">Bookings this month</p>
        <div className="flex items-end gap-1 h-8">
          {[40, 65, 45, 80, 60, 90, 75, 95, 70, 85, 100, 88].map((h, i) => (
            <div key={i} className="flex-1 bg-purple-300/40 rounded-sm" style={{ height: `${h}%` }}>
              <div className="w-full bg-purple-300 rounded-sm" style={{ height: `${Math.min(h + 10, 100)}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SLIDES = [SlideMarketplace, SlideQuotes, SlideReviews, SlideVendorDashboard]
const SLIDE_COUNT = SLIDES.length

// ─── Main component ───

export default function WaitlistPage() {
  const [userType, setUserType] = useState('vendor')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Vendor form
  const [vendorEmail, setVendorEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [categories, setCategories] = useState([])
  const [vendorLocation, setVendorLocation] = useState('')

  // Customer form
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerLocation, setCustomerLocation] = useState('')

  const categoryOptions = ['Photography', 'Videography', 'Catering', 'Florist', 'DJ', 'Live Band/Music', 'Venue', 'Decorator/Stylist', 'Cake', 'Other']

  // Auto-advance carousel every 5 seconds
  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % SLIDE_COUNT), [])
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + SLIDE_COUNT) % SLIDE_COUNT), [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        email: userType === 'vendor' ? vendorEmail : customerEmail,
        userType,
        ...(userType === 'vendor' && {
          businessName,
          categories,
          location: vendorLocation,
        }),
        ...(userType === 'customer' && {
          name: customerName,
          location: customerLocation,
        }),
      }

      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // ─── Success screen ───
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={40} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">You&apos;re on the Waitlist!</h1>
            <p className="text-gray-600 mb-2">
              {userType === 'vendor'
                ? "We'll be in touch soon with early access. Get ready to grow your event business!"
                : "We'll contact you with launch details. Your perfect event vendors are coming!"}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Keep an eye on your inbox for updates.
            </p>

            <div className="border-t border-gray-100 pt-6 mb-6">
              <p className="text-sm text-gray-500 mb-3">Follow us for updates</p>
              <div className="flex justify-center gap-4">
                <a href="https://instagram.com/eventnestgroup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Instagram</a>
                <a href="https://facebook.com/eventnestgroup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Facebook</a>
                <a href="https://linkedin.com/company/eventnestgroup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-sm font-medium">LinkedIn</a>
                <a href="https://tiktok.com/@eventnestgroup" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-sm font-medium">TikTok</a>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main page ───
  const CurrentSlide = SLIDES[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 py-8 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="Event Nest" className="w-12 h-12 rounded-lg object-cover brightness-0 invert" />
              <div className="font-bold text-xl text-white">Event Nest</div>
            </div>
          </Link>
          <p className="text-purple-200 text-sm">Join the waitlist for early access</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Carousel */}
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 min-h-[340px] flex flex-col">
            <CurrentSlide />

            {/* Carousel controls */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
              <button onClick={prevSlide} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                    }`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {userType === 'vendor' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sarah's Photography"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          categories.includes(cat)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={vendorLocation}
                    onChange={(e) => setVendorLocation(e.target.value)}
                    placeholder="e.g. London, Manchester"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    placeholder="e.g. London, Manchester"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (userType === 'vendor' && categories.length === 0)}
              className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? 'Joining...' : 'Join the Waitlist'}
            </button>

            {/* Subtle toggle */}
            <p className="text-center mt-4 text-sm text-gray-500">
              {userType === 'vendor' ? (
                <>Looking to plan an event? <button type="button" onClick={() => setUserType('customer')} className="text-purple-600 font-medium hover:text-purple-700">Join as a customer</button></>
              ) : (
                <>Offer event services? <button type="button" onClick={() => setUserType('vendor')} className="text-purple-600 font-medium hover:text-purple-700">Join as a vendor</button></>
              )}
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300 text-xs mt-6">
          <Link href="/privacy" className="hover:text-white underline">Privacy Policy</Link>
          {' · '}
          <Link href="/terms" className="hover:text-white underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
