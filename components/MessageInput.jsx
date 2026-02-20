'use client';

import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';

export default function MessageInput({ value, onChange, onSend }) {
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null); // { url, name, attachmentType, preview? }
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected

    setUploadError('');
    setUploading(true);

    // Show local preview for images immediately
    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setAttachment({ url: null, name: file.name, attachmentType: 'image', preview, uploading: true });
    } else {
      setAttachment({ url: null, name: file.name, attachmentType: 'pdf', uploading: true });
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/messages/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setAttachment(prev => ({ ...prev, url: data.url, uploading: false }));
    } catch (err) {
      setUploadError('Upload failed. Try again.');
      setAttachment(null);
    } finally {
      setUploading(false);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setUploadError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!value.trim() && !attachment?.url) return;
    onSend(value, attachment?.url ? attachment : null);
    setAttachment(null);
    setUploadError('');
  };

  const canSend = !uploading && (value.trim() || attachment?.url);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Attachment preview */}
      {attachment && (
        <div className="mb-3 flex items-center gap-3 px-1">
          {attachment.attachmentType === 'image' ? (
            <div className="relative">
              <img
                src={attachment.preview || attachment.url}
                alt={attachment.name}
                className="h-20 w-20 rounded-xl object-cover border border-gray-200"
              />
              {attachment.uploading && (
                <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-purple-600" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              {attachment.uploading
                ? <Loader2 size={16} className="animate-spin text-purple-600" />
                : <FileText size={16} className="text-gray-500" />
              }
              <span className="text-sm text-gray-700 max-w-[200px] truncate">{attachment.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={clearAttachment}
            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 mb-2 px-1">{uploadError}</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50"
          title="Attach image or PDF"
        >
          <Paperclip size={20} className="text-gray-600" />
        </button>

        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-purple-600 transition-colors">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-3 bg-transparent outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="text-white" />
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2 px-3">
        Press Enter to send · Shift + Enter for new line · Attach images or PDFs
      </p>
    </div>
  );
}
