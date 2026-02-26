'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lightbulb, Heart, Calendar, Users } from 'lucide-react';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Baby Shower', 'Anniversary', 'Budget-Friendly'];

const ARTICLES = [
  {
    id: 1,
    title: '10 Wedding Trends for 2026',
    category: 'Wedding',
    excerpt: 'From sustainable florals to interactive food stations, here are the top wedding trends making waves this year.',
    tips: [
      'Sustainable and dried flower arrangements are replacing traditional bouquets',
      'Interactive food stations (build-your-own tacos, pizza bars) are a hit with guests',
      'Micro-weddings (under 50 guests) continue to grow in popularity',
      'Bold colour palettes — think deep burgundy, emerald green, and burnt orange',
      'Live musicians during the ceremony instead of recorded music',
      'Personalised wedding favours that guests actually want to keep',
      'Outdoor ceremonies with indoor receptions as a best-of-both option',
      'Video guest books replacing traditional sign-in books',
      'Late-night snack stations for the evening party',
      'Hiring a day-of coordinator to reduce stress',
    ],
    icon: Heart,
    colour: 'purple',
  },
  {
    id: 2,
    title: 'Planning a Birthday Party on a Budget',
    category: 'Budget-Friendly',
    excerpt: 'You don\'t need to spend a fortune to throw an amazing birthday party. Here\'s how to keep costs down without sacrificing fun.',
    tips: [
      'Host at home or in a free public space like a park',
      'Make your own decorations — Pinterest is full of DIY ideas',
      'Cook or bake yourself instead of hiring a caterer for small parties',
      'Create a collaborative Spotify playlist instead of hiring a DJ',
      'Set a clear budget before you start and track every expense',
      'Ask friends and family to help with setup and food',
      'Use digital invitations instead of printed ones',
      'Focus spending on one "wow" element (like an amazing cake)',
    ],
    icon: Sparkles,
    colour: 'amber',
  },
  {
    id: 3,
    title: 'How to Choose the Right Photographer',
    category: 'Wedding',
    excerpt: 'Your photographer captures memories that last forever. Here\'s what to look for when choosing one.',
    tips: [
      'Review their full portfolio, not just the highlights reel',
      'Ask to see a complete wedding album to judge consistency',
      'Meet them in person or video call — personality matters on the day',
      'Check if they have a second shooter for larger events',
      'Clarify what\'s included: how many hours, edited photos, prints?',
      'Ask about their backup equipment policy',
      'Read reviews from other couples, not just testimonials on their site',
      'Book early — the best photographers fill up 12+ months ahead',
    ],
    icon: Calendar,
    colour: 'blue',
  },
  {
    id: 4,
    title: 'Corporate Team Building Ideas That Actually Work',
    category: 'Corporate',
    excerpt: 'Skip the trust falls. Here are corporate event ideas your team will genuinely enjoy.',
    tips: [
      'Cooking classes — teams work together and eat the results',
      'Escape rooms with mixed teams from different departments',
      'Outdoor adventure days (hiking, kayaking, obstacle courses)',
      'Volunteer days — give back while bonding as a team',
      'Creative workshops (pottery, art, cocktail making)',
      'Quiz nights with themed rounds and prizes',
      'Hire a professional host to keep energy high',
      'Always include good food and drinks — it makes everything better',
    ],
    icon: Users,
    colour: 'green',
  },
  {
    id: 5,
    title: 'Baby Shower Planning Guide',
    category: 'Baby Shower',
    excerpt: 'Everything you need to know about planning the perfect baby shower, from themes to games to food.',
    tips: [
      'Plan for 4-6 weeks before the due date',
      'Choose a theme that reflects the parents\' personality',
      'Set up a gift registry to avoid duplicate gifts',
      'Plan 2-3 games or activities max — don\'t over-schedule',
      'Finger food works better than a sit-down meal',
      'Create a nappy cake as a centrepiece that doubles as a gift',
      'Set up a "wishes for baby" station where guests write advice cards',
      'Consider a gender-neutral theme if the parents are keeping it a surprise',
    ],
    icon: Heart,
    colour: 'pink',
  },
  {
    id: 6,
    title: 'Anniversary Celebration Ideas by Milestone',
    category: 'Anniversary',
    excerpt: 'From your 1st to your 50th, here are celebration ideas for every major anniversary milestone.',
    tips: [
      '1st anniversary: Intimate dinner at the restaurant where you first met',
      '5th anniversary: Weekend getaway to somewhere new together',
      '10th anniversary: Renew your vows with close friends and family',
      '25th (Silver): Throw a party with a silver theme and photo slideshow',
      '50th (Gold): Host a grand celebration with all the family',
      'Create a memory book with photos and stories from each year',
      'Commission a custom piece of art or jewellery as a keepsake',
      'Hire a photographer to capture the celebration professionally',
    ],
    icon: Sparkles,
    colour: 'rose',
  },
];

const COLOUR_MAP = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  amber:  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  blue:   { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  green:  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  pink:   { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  rose:   { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function InspirationPage() {
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filter === 'All' ? ARTICLES : ARTICLES.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Event Inspiration</h1>
          <p className="text-purple-100 text-lg">Ideas, tips, and guides to help you plan the perfect event</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {filtered.map((article) => {
            const Icon = article.icon;
            const colours = COLOUR_MAP[article.colour] || COLOUR_MAP.purple;
            const isExpanded = expandedId === article.id;

            return (
              <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colours.bg}`}>
                    <Icon size={18} className={colours.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900">{article.title}</h2>
                    </div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${colours.bg} ${colours.text}`}>
                      {article.category}
                    </span>
                    <p className="text-sm text-gray-500">{article.excerpt}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className={`text-gray-300 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <ul className="space-y-3">
                      {article.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colours.bg} ${colours.text}`}>
                            {i + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <p className="text-sm text-gray-500">Ready to start planning?</p>
                      <div className="flex gap-2">
                        <Link
                          href="/marketplace"
                          className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Find Vendors
                        </Link>
                        <Link
                          href="/plan-my-event"
                          className="text-sm px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                        >
                          AI Planner
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
