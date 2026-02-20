'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2, Send } from 'lucide-react';

export default function QuoteForm({ conversationId, onClose, onSent }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addFeature = () => setFeatures(prev => [...prev, '']);
  const removeFeature = (i) => setFeatures(prev => prev.filter((_, idx) => idx !== i));
  const updateFeature = (i, val) => setFeatures(prev => prev.map((f, idx) => idx === i ? val : f));

  const handleSubmit = async () => {
    if (!title.trim() || !price || !eventDate) {
      setError('Title, price and event date are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          price: parseFloat(price),
          eventDate,
          description: description.trim() || undefined,
          features: features.map(f => f.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send quote');
        return;
      }
      onSent(data.quote);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Send Custom Quote</h2>
            <p className="text-xs text-gray-500 mt-0.5">Build a tailored offer for this customer</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quote Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Full-day photography package"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date *</label>
            <input
              type="date"
              value={eventDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setEventDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add any additional details about this quote..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
            />
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">What's included</label>
              <button
                onClick={addFeature}
                className="flex items-center gap-1 text-xs text-purple-600 font-semibold hover:text-purple-800 transition-colors"
              >
                <Plus size={12} />
                Add item
              </button>
            </div>
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={e => updateFeature(i, e.target.value)}
                    placeholder={`e.g. 8 hours coverage`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  {features.length > 1 && (
                    <button
                      onClick={() => removeFeature(i)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Sending...' : 'Send Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}
