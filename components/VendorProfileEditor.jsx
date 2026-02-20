'use client';

import React, { useState, useRef, useEffect } from 'react';
import VendorHeader from '@/components/VendorHeader';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  Save
} from 'lucide-react';

export default function EditVendorProfile() {
  const { profile: authProfile, refreshProfile } = useAuth();

  // Track which sections are complete
  const [completedSections, setCompletedSections] = useState([]);
  const [activeSection, setActiveSection] = useState('business');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Form State ──
  const [profile, setProfile] = useState({
    // Business Info
    businessName: '',
    category: '',
    description: '',
    location: '',
    responseTime: '',

    // Images
    coverImage: null,
    coverImagePreview: '',
    profileImage: null,
    profileImagePreview: '',

    // Pricing
    pricingModel: 'perDay', // 'perDay' | 'perHead' | 'both'
    pricePerDay: '',
    pricePerHead: '',
    customQuotes: true,
    packages: [
      { id: 1, name: '', price: '', details: '' }
    ],

    // Contact
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',

    // Portfolio
    portfolioImages: [],

    // Documents
    documents: []
  });

  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const portfolioInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const categories = [
    'Photography',
    'Videography',
    'Catering',
    'Florist',
    'DJ',
    'Live Band/Music',
    'Venue',
    'Decorator/Stylist',
    'Cake',
    'Wedding Planner',
    'Hair & Makeup',
    'Transport',
    'Stationery',
    'Entertainment',
    'Other'
  ];

  // Pre-fill form from database profile (once only)
  const hasPreFilled = useRef(false);
  useEffect(() => {
    if (!authProfile || hasPreFilled.current) return;
    hasPreFilled.current = true;

    const pricingModelMap = { per_day: 'perDay', per_head: 'perHead', both: 'both' };

    setProfile(prev => ({
      ...prev,
      businessName: authProfile.businessName || '',
      category: authProfile.category || '',
      description: authProfile.description || '',
      location: authProfile.location || '',
      responseTime: authProfile.responseTime || '',
      pricingModel: pricingModelMap[authProfile.pricingModel] || 'perDay',
      pricePerDay: authProfile.pricePerDay ? String(authProfile.pricePerDay) : '',
      pricePerHead: authProfile.pricePerHead ? String(authProfile.pricePerHead) : '',
      customQuotes: authProfile.customQuotesEnabled ?? true,
      phone: authProfile.phone || '',
      email: authProfile.email || '',
      website: authProfile.website || '',
      instagram: authProfile.instagram || '',
      facebook: authProfile.facebook || '',
      twitter: authProfile.twitter || '',
      coverImagePreview: authProfile.coverImageUrl || '',
      profileImagePreview: authProfile.profileImageUrl || '',
      packages: authProfile.packages?.length > 0
        ? authProfile.packages.map(pkg => ({
            id: pkg.id || Date.now() + Math.random(),
            name: pkg.name || '',
            price: pkg.price ? String(pkg.price) : '',
            details: (pkg.features || []).join('\n'),
          }))
        : [{ id: 1, name: '', price: '', details: '' }],
      portfolioImages: authProfile.portfolioImages?.length > 0
        ? authProfile.portfolioImages.map(img => ({
            id: img.id || Date.now() + Math.random(),
            url: img.imageUrl,
            preview: img.imageUrl,
            caption: img.caption || '',
            name: img.imageUrl?.split('/').pop() || 'image',
          }))
        : [],
      documents: authProfile.documents?.length > 0
        ? authProfile.documents.map(doc => ({
            id: doc.id || Date.now() + Math.random(),
            url: doc.fileUrl,
            name: doc.fileName,
            type: doc.fileType || doc.fileName?.split('.').pop()?.toUpperCase() || 'FILE',
            size: doc.fileSize > 0
              ? (doc.fileSize / (1024 * 1024)).toFixed(1) + ' MB'
              : '—',
            rawSize: doc.fileSize || 0,
          }))
        : [],
    }));
  }, [authProfile]);

  const sections = [
    { id: 'business', label: 'Business Info', icon: <FileText size={18} /> },
    { id: 'images', label: 'Photos', icon: <Camera size={18} /> },
    { id: 'pricing', label: 'Pricing & Packages', icon: <DollarSign size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <ImageIcon size={18} /> },
    { id: 'contact', label: 'Contact & Socials', icon: <Phone size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> }
  ];

  // ── Handlers ──

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProfile('coverImage', file);
      updateProfile('coverImagePreview', URL.createObjectURL(file));
    }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProfile('profileImage', file);
      updateProfile('profileImagePreview', URL.createObjectURL(file));
    }
  };

  const handlePortfolioImages = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    updateProfile('portfolioImages', [...profile.portfolioImages, ...newImages]);
  };

  const removePortfolioImage = (imageId) => {
    updateProfile('portfolioImages', profile.portfolioImages.filter(img => img.id !== imageId));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: file.name.split('.').pop().toUpperCase(),
      verified: false
    }));
    updateProfile('documents', [...profile.documents, ...newDocs]);
  };

  const removeDocument = (docId) => {
    updateProfile('documents', profile.documents.filter(doc => doc.id !== docId));
  };

  // Packages
  const addPackage = () => {
    const newPkg = { id: Date.now(), name: '', price: '', details: '' };
    updateProfile('packages', [...profile.packages, newPkg]);
  };

  const updatePackage = (pkgId, field, value) => {
    updateProfile('packages', profile.packages.map(pkg =>
      pkg.id === pkgId ? { ...pkg, [field]: value } : pkg
    ));
  };

  const removePackage = (pkgId) => {
    if (profile.packages.length > 1) {
      updateProfile('packages', profile.packages.filter(pkg => pkg.id !== pkgId));
    }
  };

  // Section completion check
  const isSectionComplete = (sectionId) => {
    switch (sectionId) {
      case 'business':
        return profile.businessName && profile.category && profile.description && profile.location;
      case 'images':
        return profile.coverImagePreview && profile.profileImagePreview;
      case 'pricing':
        return (profile.pricePerDay || profile.pricePerHead) && profile.packages[0]?.name;
      case 'portfolio':
        return profile.portfolioImages.length >= 3;
      case 'contact':
        return profile.phone && profile.email;
      case 'documents':
        return profile.documents.length >= 1;
      default:
        return false;
    }
  };

  const completionPercentage = Math.round(
    (sections.filter(s => isSectionComplete(s.id)).length / sections.length) * 100
  );

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch('/api/vendors/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('File upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');

    try {
      // Upload any new images/documents first
      let coverImageUrl = profile.coverImagePreview;
      let profileImageUrl = profile.profileImagePreview;

      if (profile.coverImage) {
        coverImageUrl = await uploadFile(profile.coverImage, 'cover');
        updateProfile('coverImage', null);
        updateProfile('coverImagePreview', coverImageUrl);
      }
      if (profile.profileImage) {
        profileImageUrl = await uploadFile(profile.profileImage, 'profile');
        updateProfile('profileImage', null);
        updateProfile('profileImagePreview', profileImageUrl);
      }

      // Upload new portfolio images (ones that have a file object)
      const uploadedPortfolio = await Promise.all(
        profile.portfolioImages.map(async (img) => {
          if (img.file) {
            const url = await uploadFile(img.file, 'portfolio');
            return { ...img, file: null, preview: url, url };
          }
          return img;
        })
      );
      updateProfile('portfolioImages', uploadedPortfolio);

      // Upload new documents
      const uploadedDocs = await Promise.all(
        profile.documents.map(async (doc) => {
          if (doc.file) {
            const url = await uploadFile(doc.file, 'document');
            return { ...doc, file: null, url };
          }
          return doc;
        })
      );
      updateProfile('documents', uploadedDocs);

      const res = await fetch('/api/vendors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: profile.businessName,
          category: profile.category,
          description: profile.description,
          location: profile.location,
          responseTime: profile.responseTime,
          pricingModel: profile.pricingModel,
          pricePerDay: profile.pricePerDay,
          pricePerHead: profile.pricePerHead,
          customQuotes: profile.customQuotes,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          instagram: profile.instagram,
          facebook: profile.facebook,
          twitter: profile.twitter,
          packages: profile.packages,
          coverImageUrl,
          profileImageUrl,
          portfolioImages: uploadedPortfolio.map(img => ({ url: img.url || img.preview, caption: img.caption || '' })),
          documents: uploadedDocs.map(doc => ({ url: doc.url, name: doc.name, type: doc.type, size: doc.rawSize !== undefined ? doc.rawSize : (doc.file?.size || 0) })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      await refreshProfile();
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Section scroll helper ──
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <VendorHeader />

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check size={18} />
          Profile saved successfully!
        </div>
      )}

      {/* Error Toast */}
      {saveError && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {saveError}
          <button onClick={() => setSaveError('')} className="ml-2 underline text-sm">Dismiss</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* ── Sidebar Navigation ── */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-28">
              <nav className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {sections.map((section, index) => {
                  const isComplete = isSectionComplete(section.id);
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                      } ${index > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete
                          ? 'bg-green-100 text-green-600'
                          : isActive
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isComplete ? <Check size={14} /> : section.icon}
                      </div>
                      <span className="font-medium text-sm">{section.label}</span>
                      {isComplete && (
                        <Check size={14} className="ml-auto text-green-500" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Completion hint */}
              {completionPercentage < 100 && (
                <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Complete your profile</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Profiles with all sections filled get 3x more inquiries from customers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Main Form Content ── */}
          <div className="flex-1 space-y-8">
            {/* ═══════════════════════════════════ */}
            {/* SECTION: Business Info              */}
            {/* ═══════════════════════════════════ */}
            <div id="section-business" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
                  <p className="text-sm text-gray-500">Tell customers about your business</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => updateProfile('businessName', e.target.value)}
                    placeholder="e.g. The Silver Vows"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={profile.category}
                    onChange={(e) => updateProfile('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 cursor-pointer"
                  >
                    <option value="">Select your category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => updateProfile('location', e.target.value)}
                      placeholder="e.g. London, UK"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => updateProfile('description', e.target.value)}
                    placeholder="Tell potential clients about your business, experience, and what makes you unique..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{profile.description.length}/500 characters</p>
                </div>

                {/* Response Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Typical Response Time</label>
                  <select
                    value={profile.responseTime}
                    onChange={(e) => updateProfile('responseTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 cursor-pointer"
                  >
                    <option value="">Select response time</option>
                    <option value="1 hour">Within 1 hour</option>
                    <option value="2 hours">Within 2 hours</option>
                    <option value="Same day">Same day</option>
                    <option value="24 hours">Within 24 hours</option>
                    <option value="2-3 days">2–3 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* SECTION: Photos                     */}
            {/* ═══════════════════════════════════ */}
            <div id="section-images" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Camera className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Photos</h2>
                  <p className="text-sm text-gray-500">Add a cover photo and profile picture</p>
                </div>
              </div>

              {/* Cover Image */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Photo *</label>
                <p className="text-xs text-gray-500 mb-3">Recommended: 1600×600px. This appears at the top of your profile.</p>

                {profile.coverImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden group">
                    <img
                      src={profile.coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => { updateProfile('coverImage', null); updateProfile('coverImagePreview', ''); }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full h-56 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer"
                  >
                    <Upload size={32} className="mb-3" />
                    <span className="font-medium">Click to upload cover photo</span>
                    <span className="text-xs mt-1">PNG, JPG up to 10MB</span>
                  </button>
                )}
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture *</label>
                <p className="text-xs text-gray-500 mb-3">Recommended: 400×400px. Square format works best.</p>

                <div className="flex items-center gap-6">
                  {profile.profileImagePreview ? (
                    <div className="relative group">
                      <img
                        src={profile.profileImagePreview}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                        <button
                          onClick={() => profileInputRef.current?.click()}
                          className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Camera size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer"
                    >
                      <Camera size={24} className="mb-1" />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                  )}

                  {!profile.profileImagePreview && (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium text-gray-700">Add your business logo or photo</p>
                      <p>This helps customers recognise your brand.</p>
                    </div>
                  )}
                </div>
                <input ref={profileInputRef} type="file" accept="image/*" onChange={handleProfileImage} className="hidden" />
              </div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* SECTION: Pricing & Packages         */}
            {/* ═══════════════════════════════════ */}
            <div id="section-pricing" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pricing & Packages</h2>
                  <p className="text-sm text-gray-500">Set your pricing structure</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Pricing Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pricing Model *</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'perDay', label: 'Per Day' },
                      { value: 'perHead', label: 'Per Head' },
                      { value: 'both', label: 'Both' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateProfile('pricingModel', opt.value)}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          profile.pricingModel === opt.value
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {(profile.pricingModel === 'perDay' || profile.pricingModel === 'both') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price (Per Day)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                        <input
                          type="number"
                          value={profile.pricePerDay}
                          onChange={(e) => updateProfile('pricePerDay', e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                  {(profile.pricingModel === 'perHead' || profile.pricingModel === 'both') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price (Per Head)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                        <input
                          type="number"
                          value={profile.pricePerHead}
                          onChange={(e) => updateProfile('pricePerHead', e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Quotes Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Accept custom quote requests</p>
                    <p className="text-sm text-gray-500">Allow customers to request personalised quotes</p>
                  </div>
                  <button
                    onClick={() => updateProfile('customQuotes', !profile.customQuotes)}
                    className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${
                      profile.customQuotes ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      profile.customQuotes ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Packages */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Packages</label>
                      <p className="text-xs text-gray-500 mt-0.5">Create tiered offerings for your customers</p>
                    </div>
                    <button
                      onClick={addPackage}
                      className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Package
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.packages.map((pkg, index) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-xl p-5 hover:border-purple-200 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            Package {index + 1}
                          </span>
                          {profile.packages.length > 1 && (
                            <button
                              onClick={() => removePackage(pkg.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Package Name</label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)}
                              placeholder="e.g. Half Day, Premium"
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">£</span>
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updatePackage(pkg.id, 'price', e.target.value)}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">What's included</label>
                          <textarea
                            value={pkg.details}
                            onChange={(e) => updatePackage(pkg.id, 'details', e.target.value)}
                            placeholder={"e.g.\n• 4 hours coverage\n• 200+ edited photos\n• Online gallery"}
                            rows={4}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900 text-sm resize-none"
                          />
                          <p className="text-xs text-gray-400 mt-1">Use separate lines for each feature or bullet point</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* SECTION: Portfolio                  */}
            {/* ═══════════════════════════════════ */}
            <div id="section-portfolio" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                  <p className="text-sm text-gray-500">Showcase your best work (minimum 3 images recommended)</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {profile.portfolioImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img
                      src={img.preview}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removePortfolioImage(img.id)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload placeholder */}
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer"
                >
                  <Plus size={28} className="mb-2" />
                  <span className="text-xs font-medium">Add Photos</span>
                </button>
              </div>

              <input ref={portfolioInputRef} type="file" accept="image/*" multiple onChange={handlePortfolioImages} className="hidden" />

              <p className="text-xs text-gray-400">
                {profile.portfolioImages.length} image{profile.portfolioImages.length !== 1 ? 's' : ''} uploaded
                {profile.portfolioImages.length < 3 && ' — add at least 3 to complete this section'}
              </p>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* SECTION: Contact & Socials          */}
            {/* ═══════════════════════════════════ */}
            <div id="section-contact" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Phone className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contact & Socials</h2>
                  <p className="text-sm text-gray-500">How customers can reach you</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => updateProfile('phone', e.target.value)}
                        placeholder="+44 7700 900123"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => updateProfile('email', e.target.value)}
                        placeholder="hello@yourbusiness.co.uk"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => updateProfile('website', e.target.value)}
                      placeholder="www.yourbusiness.co.uk"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Social Media</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => updateProfile('instagram', e.target.value)}
                        placeholder="@yourbusiness"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                      />
                    </div>
                    <div className="relative">
                      <Facebook size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.facebook}
                        onChange={(e) => updateProfile('facebook', e.target.value)}
                        placeholder="Your Facebook page name"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                      />
                    </div>
                    <div className="relative">
                      <Twitter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profile.twitter}
                        onChange={(e) => updateProfile('twitter', e.target.value)}
                        placeholder="@yourbusiness"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* SECTION: Documents                  */}
            {/* ═══════════════════════════════════ */}
            <div id="section-documents" className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Certificates & Documents</h2>
                  <p className="text-sm text-gray-500">Upload insurance, licenses, and certifications to build trust</p>
                </div>
              </div>

              {/* Uploaded documents list */}
              {profile.documents.length > 0 && (
                <div className="space-y-3 mb-6">
                  {profile.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} · {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                          Pending Review
                        </span>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <button
                onClick={() => documentInputRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer"
              >
                <Upload size={28} className="mb-3" />
                <span className="font-medium">Upload Documents</span>
                <span className="text-xs mt-1">PDF, JPG, PNG up to 10MB each</span>
              </button>
              <input ref={documentInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleDocumentUpload} className="hidden" />

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm text-blue-900">
                  <strong>Recommended documents:</strong> Public Liability Insurance, Professional Indemnity Insurance, Business License, any relevant qualifications or certifications.
                </p>
              </div>
            </div>

            {/* ── Save Button (bottom) ── */}
            <div className="flex items-center justify-between py-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <Link href={`/vendor-profile/${authProfile?.id || ''}`} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Preview Profile
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
