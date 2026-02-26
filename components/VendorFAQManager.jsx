'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, HelpCircle, Pencil, ChevronDown, Loader2 } from 'lucide-react';
import AppHeader from './AppHeader';

export default function VendorFAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/vendor-faqs')
      .then(r => r.json())
      .then(data => setFaqs(data.faqs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ question: '', answer: '' });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(faq) {
    setForm({ question: faq.question, answer: faq.answer });
    setEditing(faq.id);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/vendor-faqs/${editing}` : '/api/vendor-faqs';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        if (editing) {
          setFaqs(prev => prev.map(f => f.id === editing ? data.faq : f));
        } else {
          setFaqs(prev => [...prev, data.faq]);
        }
        resetForm();
      }
    } catch {}
    setSaving(false);
  }

  async function deleteFaq(id) {
    try {
      const res = await fetch(`/api/vendor-faqs/${id}`, { method: 'DELETE' });
      if (res.ok) setFaqs(prev => prev.filter(f => f.id !== id));
    } catch {}
  }

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FAQ Manager</h1>
              <p className="text-gray-500 mt-1">Add common questions and answers to your public profile</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus size={15} />
              Add FAQ
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{editing ? 'Edit FAQ' : 'New FAQ'}</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. What is your cancellation policy?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <textarea
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  placeholder="Your answer..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.question.trim() || !form.answer.trim() || saving}
                className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
              </button>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : faqs.length === 0 && !showForm ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No FAQs yet</h2>
              <p className="text-gray-500 mb-6">Add frequently asked questions so customers can find answers quickly.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Add Your First FAQ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map(faq => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle size={18} className="text-purple-500 flex-shrink-0" />
                      <span className="flex-1 font-medium text-gray-900 text-sm">{faq.question}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line mb-3">{faq.answer}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(faq)}
                            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
