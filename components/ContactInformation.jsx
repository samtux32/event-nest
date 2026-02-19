import React from 'react';

export default function ContactInformation({ formData, onFormChange }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Your Contact Information</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          name="contactName"
          value={formData.contactName}
          onChange={onFormChange}
          required
          placeholder="Your full name"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={onFormChange}
            required
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={onFormChange}
            required
            placeholder="07XXX XXXXXX"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How did you hear about us?
        </label>
        <select
          name="hearAbout"
          value={formData.hearAbout}
          onChange={onFormChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600"
        >
          <option value="">Please select</option>
          <option value="google">Google Search</option>
          <option value="social">Social Media</option>
          <option value="friend">Friend/Family Referral</option>
          <option value="venue">Venue Recommendation</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}
