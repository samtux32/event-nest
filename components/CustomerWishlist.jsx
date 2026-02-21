'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, MapPin, Search, Plus, X, FolderPlus, Check } from 'lucide-react';
import CustomerHeader from './CustomerHeader';

export default function CustomerWishlist() {
  const [vendors, setVendors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null); // vendorId

  useEffect(() => {
    async function load() {
      try {
        const [wishlistRes, groupsRes] = await Promise.all([
          fetch('/api/wishlist?full=true'),
          fetch('/api/wishlist/groups'),
        ]);
        const [wishlistData, groupsData] = await Promise.all([
          wishlistRes.json(),
          groupsRes.json(),
        ]);
        if (wishlistRes.ok) setVendors(wishlistData.vendors ?? []);
        if (groupsRes.ok) setGroups(groupsData.groups ?? []);
      } catch (err) {
        console.error('Wishlist load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const removeFromWishlist = async (vendorId) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
    setGroups(prev => prev.map(g => ({ ...g, vendorIds: g.vendorIds.filter(id => id !== vendorId) })));
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    });
  };

  const createGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    setNewGroupName('');
    setCreatingGroup(false);
    try {
      const res = await fetch('/api/wishlist/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(prev => [...prev, data.group]);
        setActiveTab(data.group.id);
      } else {
        console.error('Create group error:', data);
      }
    } catch (err) {
      console.error('Create group error:', err);
    }
  };

  const deleteGroup = async (groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (activeTab === groupId) setActiveTab('all');
    await fetch(`/api/wishlist/groups/${groupId}`, { method: 'DELETE' });
  };

  const toggleVendorInGroup = async (groupId, vendorId) => {
    const group = groups.find(g => g.id === groupId);
    const inGroup = group?.vendorIds.includes(vendorId);
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, vendorIds: inGroup ? g.vendorIds.filter(id => id !== vendorId) : [...g.vendorIds, vendorId] }
        : g
    ));
    await fetch(`/api/wishlist/groups/${groupId}/vendors`, {
      method: inGroup ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId }),
    });
  };

  const displayedVendors = activeTab === 'all'
    ? vendors
    : vendors.filter(v => groups.find(g => g.id === activeTab)?.vendorIds.includes(v.id));

  const activeGroup = groups.find(g => g.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />

      {/* Invisible overlay to close any open dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">Vendors you've saved for later</p>
        </div>

        {/* Tabs row */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-400'
            }`}
          >
            All ({vendors.length})
          </button>

          {groups.map(group => (
            <div key={group.id} className="relative flex items-center">
              <button
                onClick={() => setActiveTab(group.id)}
                className={`pl-4 pr-8 py-2 rounded-full font-medium text-sm transition-colors ${
                  activeTab === group.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-400'
                }`}
              >
                {group.name} ({group.vendorIds.length})
              </button>
              <button
                onClick={() => deleteGroup(group.id)}
                title="Delete group"
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors ${
                  activeTab === group.id ? 'text-purple-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X size={13} />
              </button>
            </div>
          ))}

          {creatingGroup ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') createGroup();
                  if (e.key === 'Escape') { setCreatingGroup(false); setNewGroupName(''); }
                }}
                placeholder="Group name..."
                className="px-3 py-1.5 text-sm border border-purple-400 rounded-full outline-none focus:ring-2 focus:ring-purple-200 w-40"
              />
              <button
                onClick={createGroup}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setCreatingGroup(false); setNewGroupName(''); }}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreatingGroup(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-purple-600 border border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Plus size={15} />
              New group
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                <div className="h-56 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty wishlist */}
        {!loading && vendors.length === 0 && (
          <div className="text-center py-24">
            <Heart className="mx-auto text-gray-200 mb-4" size={72} />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved vendors yet</h2>
            <p className="text-gray-500 mb-6">Tap the heart icon on any vendor to save them here.</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <Search size={18} />
              Browse vendors
            </Link>
          </div>
        )}

        {/* Empty group */}
        {!loading && vendors.length > 0 && displayedVendors.length === 0 && activeTab !== 'all' && (
          <div className="text-center py-24">
            <FolderPlus className="mx-auto text-gray-200 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No vendors in "{activeGroup?.name}" yet</h2>
            <p className="text-gray-500">Click the <span className="font-medium">All</span> tab, then use the folder icon on any vendor card to add them here.</p>
          </div>
        )}

        {/* Vendor grid */}
        {!loading && displayedVendors.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-900">{displayedVendors.length}</span> vendor{displayedVendors.length !== 1 ? 's' : ''}
              {activeTab !== 'all' && <span className="text-gray-400"> in this group</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVendors.map(vendor => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-56">
                    {vendor.image ? (
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                        <span className="text-5xl font-bold text-purple-300">{vendor.name?.[0] || 'V'}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlist(vendor.id)}
                      title="Remove from wishlist"
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart size={20} className="fill-red-500 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-purple-600 font-medium mb-2">{vendor.category}</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vendor.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      {vendor.rating !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-yellow-400" size={16} />
                          <span className="font-semibold text-gray-900">{vendor.rating}</span>
                          <span className="text-gray-500 text-sm">({vendor.reviews})</span>
                        </div>
                      )}
                      {vendor.location && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin size={14} />
                          {vendor.location}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {vendor.startingPrice ? (
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>
                          <p className="font-bold text-gray-900">{vendor.startingPrice}</p>
                        </div>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        {/* Group dropdown */}
                        {groups.length > 0 && (
                          <div className="relative z-20">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === vendor.id ? null : vendor.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              title="Add to group"
                            >
                              <FolderPlus size={15} />
                              Groups
                            </button>

                            {openDropdown === vendor.id && (
                              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-44 z-20">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1.5">Add to group</p>
                                {groups.map(group => {
                                  const inGroup = group.vendorIds.includes(vendor.id);
                                  return (
                                    <button
                                      key={group.id}
                                      onClick={() => toggleVendorInGroup(group.id, vendor.id)}
                                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-purple-50 transition-colors"
                                    >
                                      <span className={inGroup ? 'font-medium text-purple-600' : 'text-gray-700'}>
                                        {group.name}
                                      </span>
                                      {inGroup && <Check size={14} className="text-purple-600 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        <Link
                          href={`/vendor-profile/${vendor.id}`}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
