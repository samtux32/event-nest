'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Tag, ToggleLeft, ToggleRight, Pencil, Loader2 } from 'lucide-react';
import AppHeader from './AppHeader';
import ConfirmModal from './ConfirmModal';

export default function VendorPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discountText: '', validFrom: '', validUntil: '' });
  const [deletingPromoId, setDeletingPromoId] = useState(null);

  useEffect(() => {
    fetch('/api/promotions')
      .then(r => r.json())
      .then(data => setPromotions(data.promotions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ title: '', description: '', discountText: '', validFrom: '', validUntil: '' });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(promo) {
    setForm({
      title: promo.title,
      description: promo.description || '',
      discountText: promo.discountText || '',
      validFrom: promo.validFrom ? promo.validFrom.split('T')[0] : '',
      validUntil: promo.validUntil ? promo.validUntil.split('T')[0] : '',
    });
    setEditing(promo.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/promotions/${editing}` : '/api/promotions';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        if (editing) {
          setPromotions(prev => prev.map(p => p.id === editing ? data.promotion : p));
        } else {
          setPromotions(prev => [data.promotion, ...prev]);
        }
        resetForm();
      }
    } catch {}
    setSaving(false);
  }

  async function toggleActive(promo) {
    try {
      const res = await fetch(`/api/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromotions(prev => prev.map(p => p.id === promo.id ? data.promotion : p));
      }
    } catch {}
  }

  async function deletePromo(id) {
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) setPromotions(prev => prev.filter(p => p.id !== id));
    } catch {}
  }

  function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
              <p className="text-gray-500 mt-1">Create special offers shown on your public profile</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus size={15} />
              New Offer
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{editing ? 'Edit Promotion' : 'New Promotion'}</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Early Bird Discount"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <input
                  type="text"
                  value={form.discountText}
                  onChange={e => setForm(f => ({ ...f, discountText: e.target.value }))}
                  placeholder="e.g. 20% off, £50 off, Free upgrade"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Valid from (optional)</label>
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Valid until (optional)</label>
                    <input
                      type="date"
                      value={form.validUntil}
                      onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.title.trim() || saving}
                className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : promotions.length === 0 && !showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No promotions yet</h2>
              <p className="text-gray-500 mb-6">Create special offers to attract more customers to your profile.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Create Your First Promotion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                        {promo.discountText && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            {promo.discountText}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {promo.description && <p className="text-sm text-gray-500 mb-2">{promo.description}</p>}
                      {(promo.validFrom || promo.validUntil) && (
                        <p className="text-xs text-gray-400">
                          {promo.validFrom && `From ${formatDate(promo.validFrom)}`}
                          {promo.validFrom && promo.validUntil && ' — '}
                          {promo.validUntil && `Until ${formatDate(promo.validUntil)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(promo)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                        title={promo.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {promo.isActive ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => startEdit(promo)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingPromoId(promo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deletingPromoId && (
        <ConfirmModal
          title="Delete promotion?"
          message="This promotion will be permanently removed from your profile."
          confirmLabel="Delete"
          onConfirm={() => { deletePromo(deletingPromoId); setDeletingPromoId(null); }}
          onCancel={() => setDeletingPromoId(null)}
        />
      )}
    </>
  );
}
