'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Check, Plus } from 'lucide-react';

export default function WishlistButton({ vendorId, isWishlisted, onToggle, className, size = 20, style = 'icon' }) {
  const [groups, setGroups] = useState(null); // null = not loaded, [] = no groups
  const [showDropdown, setShowDropdown] = useState(false);
  const [vendorGroups, setVendorGroups] = useState([]); // group IDs this vendor is in
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showDropdown]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/wishlist/groups');
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
        setVendorGroups(data.groups.filter(g => g.vendorIds.includes(vendorId)).map(g => g.id));
      }
    } catch {
      setGroups([]);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Load groups if not loaded yet
    let currentGroups = groups;
    if (currentGroups === null) {
      await fetchGroups();
      // fetchGroups sets state async, so we need to get the value from the fetch directly
      try {
        const res = await fetch('/api/wishlist/groups');
        const data = await res.json();
        currentGroups = data.groups || [];
      } catch {
        currentGroups = [];
      }
    }

    // If groups exist, show the dropdown for managing
    if (currentGroups.length > 0) {
      if (!isWishlisted) onToggle(); // add to general wishlist first
      setShowDropdown(prev => !prev);
    } else {
      // No groups — just toggle
      onToggle();
    }
  };

  const toggleGroup = async (groupId) => {
    const inGroup = vendorGroups.includes(groupId);
    setVendorGroups(prev => inGroup ? prev.filter(id => id !== groupId) : [...prev, groupId]);
    try {
      await fetch(`/api/wishlist/groups/${groupId}/vendors`, {
        method: inGroup ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      });
    } catch {
      setVendorGroups(prev => inGroup ? [...prev, groupId] : prev.filter(id => id !== groupId));
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/wishlist/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const data = await res.json();
      if (data.group) {
        setGroups(prev => [...(prev || []), data.group]);
        // Auto-add vendor to the new group
        await toggleGroup(data.group.id);
        setNewGroupName('');
      }
    } catch {} finally {
      setCreating(false);
    }
  };

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      {style === 'icon' ? (
        <button
          onClick={handleClick}
          className="hover:scale-110 transition-transform"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={size}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
          />
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            size={size}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      )}

      {showDropdown && groups && groups.length > 0 && (
        <div className="absolute z-50 right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 text-left">
          {isWishlisted && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); setShowDropdown(false); }}
              className="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <Heart size={14} className="fill-red-500" />
              Remove from wishlist
            </button>
          )}
          <p className="px-3 pb-1.5 pt-1 text-xs font-semibold text-gray-400 uppercase border-t border-gray-100 mt-1">Groups</p>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGroup(g.id); }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-purple-50 flex items-center justify-between"
            >
              <span className="truncate">{g.name}</span>
              {vendorGroups.includes(g.id) && <Check size={14} className="text-purple-600 flex-shrink-0" />}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1 px-3">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createGroup(); e.stopPropagation(); }}
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                placeholder="New group..."
                className="flex-1 text-sm py-1.5 px-2 outline-none border border-gray-200 rounded-lg focus:border-purple-400"
              />
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); createGroup(); }}
                disabled={!newGroupName.trim() || creating}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
