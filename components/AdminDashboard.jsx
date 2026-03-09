'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { CheckCircle, XCircle, Loader2, LogOut, Store, Users, Clock, BadgeCheck, FileText, Eye, X, Flag, Star, Trash2, MessageSquare, BarChart3, ShoppingBag, TrendingUp } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [docsVendor, setDocsVendor] = useState(null); // vendor whose docs are shown in modal
  const [tab, setTab] = useState('pending'); // 'pending' | 'approved' | 'reviews'
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewActionId, setReviewActionId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch('/api/admin/vendors');
        const data = await res.json();
        if (res.ok) setVendors(data.vendors);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  useEffect(() => {
    if (tab !== 'analytics') return;
    if (analytics) return; // already loaded
    async function fetchAnalytics() {
      setAnalyticsLoading(true);
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (res.ok) setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    fetchAnalytics();
  }, [tab, analytics]);

  useEffect(() => {
    if (tab !== 'reviews') return;
    async function fetchReviews() {
      setReviewsLoading(true);
      try {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        if (res.ok) setReviews(data.reviews);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    }
    fetchReviews();
  }, [tab]);

  const toggleFlag = async (reviewId, isFlagged) => {
    setReviewActionId(reviewId);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isFlagged }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isFlagged } : r));
      }
    } catch (err) {
      console.error('Failed to flag review:', err);
    } finally {
      setReviewActionId(null);
    }
  };

  const deleteReview = async (reviewId) => {
    setReviewActionId(reviewId);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setReviewActionId(null);
    }
  };

  const updateVendor = async (vendorId, isApproved) => {
    setUpdatingId(vendorId);
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, isApproved }),
      });
      if (res.ok) {
        setVendors(prev =>
          prev.map(v => v.id === vendorId ? { ...v, isApproved } : v)
        );
      }
    } catch (err) {
      console.error('Failed to update vendor:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const verifyVendor = async (vendorId, verificationStatus) => {
    setVerifyingId(vendorId);
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, verificationStatus }),
      });
      if (res.ok) {
        setVendors(prev =>
          prev.map(v => v.id === vendorId ? { ...v, verificationStatus } : v)
        );
      }
    } catch (err) {
      console.error('Failed to verify vendor:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const pending = vendors.filter(v => !v.isApproved);
  const approved = vendors.filter(v => v.isApproved);
  const displayed = tab === 'pending' ? pending : approved;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <div className="font-bold text-gray-900">Event Nest</div>
              <div className="text-xs text-purple-600 font-medium">Admin Panel</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Vendor Approvals</h1>
          <p className="text-gray-500">Review and approve vendor applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
              <p className="text-sm text-gray-500">Awaiting approval</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Store className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approved.length}</p>
              <p className="text-sm text-gray-500">Live on marketplace</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              <p className="text-sm text-gray-500">Total vendors</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Approved ({approved.length})
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5 ${
              tab === 'reviews'
                ? 'bg-red-100 text-red-800'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Flag size={14} />
            Reviews
            {reviews.filter(r => r.isFlagged).length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {reviews.filter(r => r.isFlagged).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5 ${
              tab === 'analytics'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        </div>

        {/* Vendor List */}
        {(tab === 'pending' || tab === 'approved') && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="mx-auto mb-3 text-purple-600 animate-spin" size={32} />
                <p className="text-gray-500">Loading vendors...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Store className="mx-auto mb-3" size={40} />
                <p>{tab === 'pending' ? 'No vendors awaiting approval' : 'No approved vendors yet'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{vendor.businessName}</div>
                        <div className="text-sm text-gray-500">{vendor.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{Array.isArray(vendor.categories) ? vendor.categories.join(', ') : vendor.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(vendor.user?.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${vendor.profileCompletion}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{vendor.profileCompletion}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.documents?.length > 0 ? (
                          <button
                            onClick={() => setDocsVendor(vendor)}
                            className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            <Eye size={14} />
                            {vendor.documents.length} file{vendor.documents.length !== 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vendor.verificationStatus === 'verified' ? (
                            <button
                              onClick={() => verifyVendor(vendor.id, 'pending')}
                              disabled={verifyingId === vendor.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              {verifyingId === vendor.id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
                              Verified
                            </button>
                          ) : (
                            <button
                              onClick={() => verifyVendor(vendor.id, 'verified')}
                              disabled={verifyingId === vendor.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              {verifyingId === vendor.id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
                              Verify
                            </button>
                          )}
                          {updatingId === vendor.id ? (
                            <Loader2 size={18} className="animate-spin text-gray-400" />
                          ) : tab === 'pending' ? (
                            <button
                              onClick={() => updateVendor(vendor.id, true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={15} />
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => updateVendor(vendor.id, false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <XCircle size={15} />
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Reviews Panel */}
        {tab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {reviewsLoading ? (
              <div className="text-center py-16">
                <Loader2 className="mx-auto mb-3 text-purple-600 animate-spin" size={32} />
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="mx-auto mb-3" size={40} />
                <p>No reviews yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviewer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map(review => (
                    <tr key={review.id} className={`hover:bg-gray-50 transition-colors ${review.isFlagged ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{review.customerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{review.vendorName}</div>
                        <div className="text-xs text-gray-400">{review.vendorCategory}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">{review.text}</p>
                        {review.photos?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{review.photos.length} photo{review.photos.length !== 1 ? 's' : ''}</p>
                        )}
                        {review.isFlagged && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <Flag size={10} />
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {reviewActionId === review.id ? (
                            <Loader2 size={18} className="animate-spin text-gray-400" />
                          ) : (
                            <>
                              {review.isFlagged ? (
                                <button
                                  onClick={() => toggleFlag(review.id, false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  <CheckCircle size={13} />
                                  Unflag
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleFlag(review.id, true)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 text-sm font-medium rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                >
                                  <Flag size={13} />
                                  Flag
                                </button>
                              )}
                              <button
                                onClick={() => setDeletingReviewId(review.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* Analytics */}
        {tab === 'analytics' && (
          <div>
            {analyticsLoading ? (
              <div className="text-center py-16">
                <Loader2 className="mx-auto mb-3 text-purple-600 animate-spin" size={32} />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Total Vendors', value: analytics.totals.vendors, icon: <Store size={20} />, color: 'purple' },
                    { label: 'Total Customers', value: analytics.totals.customers, icon: <Users size={20} />, color: 'blue' },
                    { label: 'Total Bookings', value: analytics.totals.bookings, icon: <ShoppingBag size={20} />, color: 'green' },
                    { label: 'Total Reviews', value: analytics.totals.reviews, icon: <Star size={20} />, color: 'yellow' },
                    { label: 'Pending Approval', value: analytics.totals.pendingVendors, icon: <Clock size={20} />, color: 'red' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className={`text-${stat.color}-600 mb-2`}>{stat.icon}</div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Bookings by Status */}
                {Object.keys(analytics.bookingsByStatus).length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag size={18} />
                      Bookings by Status
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
                        <div key={status} className="px-4 py-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">{status.replace(/_/g, ' ')}</p>
                          <p className="text-xl font-bold text-gray-900">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signups Chart (simple bar chart) */}
                {[
                  { title: 'Vendor Signups (30 days)', data: analytics.vendorSignups, color: 'bg-purple-500' },
                  { title: 'Customer Signups (30 days)', data: analytics.customerSignups, color: 'bg-blue-500' },
                  { title: 'Bookings (30 days)', data: analytics.bookingsOverTime, color: 'bg-green-500' },
                ].map(chart => {
                  const maxCount = Math.max(...chart.data.map(d => d.count), 1);
                  const total = chart.data.reduce((sum, d) => sum + d.count, 0);
                  return (
                    <div key={chart.title} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <TrendingUp size={18} />
                          {chart.title}
                        </h3>
                        <span className="text-sm font-medium text-gray-500">{total} total</span>
                      </div>
                      <div className="flex items-end gap-[2px] h-32">
                        {chart.data.map(d => (
                          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <div
                              className={`w-full ${chart.color} rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]`}
                              style={{ height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%` }}
                            />
                            <div className="hidden group-hover:block absolute -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: {d.count}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>{new Date(chart.data[0]?.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <span>Today</span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="text-center text-gray-500 py-16">Failed to load analytics</p>
            )}
          </div>
        )}
      </main>

      {/* Documents Modal */}
      {docsVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="font-bold text-gray-900">{docsVendor.businessName}</h2>
                <p className="text-sm text-gray-500">{docsVendor.documents.length} document{docsVendor.documents.length !== 1 ? 's' : ''} uploaded</p>
              </div>
              <button
                onClick={() => setDocsVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {docsVendor.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-purple-600" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                      <p className="text-xs text-gray-400">{doc.fileType}</p>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </a>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BadgeCheck size={16} className={docsVendor.verificationStatus === 'verified' ? 'text-blue-500' : 'text-gray-300'} />
                {docsVendor.verificationStatus === 'verified' ? 'Vendor is verified' : 'Not yet verified'}
              </div>
              {docsVendor.verificationStatus !== 'verified' ? (
                <button
                  onClick={() => { verifyVendor(docsVendor.id, 'verified'); setDocsVendor(null); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BadgeCheck size={15} />
                  Mark as Verified
                </button>
              ) : (
                <button
                  onClick={() => { verifyVendor(docsVendor.id, 'pending'); setDocsVendor(null); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <XCircle size={15} />
                  Remove Verification
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingReviewId && (
        <ConfirmModal
          title="Delete review?"
          message="Permanently delete this review? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => { deleteReview(deletingReviewId); setDeletingReviewId(null); }}
          onCancel={() => setDeletingReviewId(null)}
        />
      )}
    </div>
  );
}
