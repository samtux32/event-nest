'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  MessageSquare,
  CalendarDays,
  User,
  Eye,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Target,
  BarChart3,
  Activity,
  Package
} from 'lucide-react';

export default function VendorAnalytics() {
  const [timePeriod, setTimePeriod] = useState('30');

  // ── Sample Data (changes based on time period) ──
  const dataByPeriod = {
    '7': {
      profileViews: 8,
      profileViewsChange: 12.5,
      inquiries: 3,
      inquiriesChange: 50,
      bookings: 1,
      bookingsChange: 0,
      revenue: 1200,
      revenueChange: 0,
      avgBookingValue: 1200,
      conversionRate: 12.5,
      responseRate: 100,
      avgResponseTime: '1.5 hours',
      chartData: [
        { date: 'Feb 05', views: 0, inquiries: 0, bookings: 0 },
        { date: 'Feb 06', views: 2, inquiries: 1, bookings: 0 },
        { date: 'Feb 07', views: 1, inquiries: 0, bookings: 0 },
        { date: 'Feb 08', views: 3, inquiries: 1, bookings: 1 },
        { date: 'Feb 09', views: 1, inquiries: 1, bookings: 0 },
        { date: 'Feb 10', views: 0, inquiries: 0, bookings: 0 },
        { date: 'Feb 11', views: 1, inquiries: 0, bookings: 0 },
      ]
    },
    '30': {
      profileViews: 47,
      profileViewsChange: 23.7,
      inquiries: 12,
      inquiriesChange: 33.3,
      bookings: 4,
      bookingsChange: 100,
      revenue: 5400,
      revenueChange: 100,
      avgBookingValue: 1350,
      conversionRate: 8.5,
      responseRate: 92,
      avgResponseTime: '2 hours',
      chartData: [
        { date: 'Jan 13', views: 0, inquiries: 0, bookings: 0 },
        { date: 'Jan 15', views: 1, inquiries: 0, bookings: 0 },
        { date: 'Jan 17', views: 2, inquiries: 1, bookings: 0 },
        { date: 'Jan 19', views: 1, inquiries: 0, bookings: 0 },
        { date: 'Jan 21', views: 3, inquiries: 1, bookings: 1 },
        { date: 'Jan 23', views: 2, inquiries: 1, bookings: 0 },
        { date: 'Jan 25', views: 4, inquiries: 2, bookings: 1 },
        { date: 'Jan 27', views: 3, inquiries: 1, bookings: 0 },
        { date: 'Jan 29', views: 5, inquiries: 1, bookings: 0 },
        { date: 'Jan 31', views: 3, inquiries: 0, bookings: 0 },
        { date: 'Feb 02', views: 6, inquiries: 2, bookings: 1 },
        { date: 'Feb 04', views: 4, inquiries: 1, bookings: 0 },
        { date: 'Feb 06', views: 8, inquiries: 1, bookings: 1 },
        { date: 'Feb 08', views: 3, inquiries: 1, bookings: 0 },
        { date: 'Feb 11', views: 2, inquiries: 0, bookings: 0 },
      ]
    },
    '90': {
      profileViews: 156,
      profileViewsChange: 45.8,
      inquiries: 38,
      inquiriesChange: 52.0,
      bookings: 11,
      bookingsChange: 83.3,
      revenue: 14850,
      revenueChange: 78.6,
      avgBookingValue: 1350,
      conversionRate: 7.1,
      responseRate: 89,
      avgResponseTime: '2.5 hours',
      chartData: [
        { date: 'Nov 15', views: 2, inquiries: 0, bookings: 0 },
        { date: 'Nov 22', views: 3, inquiries: 1, bookings: 0 },
        { date: 'Nov 29', views: 5, inquiries: 2, bookings: 1 },
        { date: 'Dec 06', views: 8, inquiries: 3, bookings: 1 },
        { date: 'Dec 13', views: 12, inquiries: 4, bookings: 1 },
        { date: 'Dec 20', views: 15, inquiries: 3, bookings: 2 },
        { date: 'Dec 27', views: 10, inquiries: 2, bookings: 0 },
        { date: 'Jan 03', views: 8, inquiries: 2, bookings: 1 },
        { date: 'Jan 10', views: 14, inquiries: 4, bookings: 1 },
        { date: 'Jan 17', views: 18, inquiries: 5, bookings: 1 },
        { date: 'Jan 24', views: 20, inquiries: 4, bookings: 1 },
        { date: 'Jan 31', views: 16, inquiries: 3, bookings: 1 },
        { date: 'Feb 07', views: 15, inquiries: 3, bookings: 1 },
        { date: 'Feb 11', views: 10, inquiries: 2, bookings: 0 },
      ]
    }
  };

  const data = dataByPeriod[timePeriod];

  // Funnel data
  const funnel = [
    { label: 'Views', count: data.profileViews, color: 'bg-purple-600' },
    { label: 'Inquiries', count: data.inquiries, color: 'bg-blue-500' },
    { label: 'Quotes Sent', count: Math.round(data.inquiries * 0.83), color: 'bg-indigo-500' },
    { label: 'Accepted', count: Math.round(data.bookings * 1.2), color: 'bg-violet-500' },
    { label: 'Bookings', count: data.bookings, color: 'bg-green-500' },
  ];

  // Peak days data
  const peakDays = [
    { day: 'Monday', views: 18, percentage: 65 },
    { day: 'Saturday', views: 16, percentage: 58 },
    { day: 'Sunday', views: 14, percentage: 50 },
    { day: 'Tuesday', views: 12, percentage: 43 },
    { day: 'Wednesday', views: 10, percentage: 36 },
  ];

  // Inquiry sources
  const inquirySources = [
    { source: 'Search Results', count: Math.round(data.inquiries * 0.45), percentage: 45, color: 'bg-purple-500' },
    { source: 'Category Browse', count: Math.round(data.inquiries * 0.25), percentage: 25, color: 'bg-blue-500' },
    { source: 'Direct Link', count: Math.round(data.inquiries * 0.18), percentage: 18, color: 'bg-green-500' },
    { source: 'Wishlist', count: Math.round(data.inquiries * 0.12), percentage: 12, color: 'bg-orange-500' },
  ];

  // Top event types
  const topEventTypes = [
    { type: 'Wedding', count: Math.round(data.bookings * 0.55), color: 'bg-purple-500' },
    { type: 'Corporate', count: Math.round(data.bookings * 0.25), color: 'bg-blue-500' },
    { type: 'Birthday', count: Math.round(data.bookings * 0.12), color: 'bg-green-500' },
    { type: 'Other', count: Math.round(data.bookings * 0.08), color: 'bg-gray-400' },
  ];

  // Simple chart rendering with SVG
  const renderChart = () => {
    const chartData = data.chartData;
    const maxViews = Math.max(...chartData.map(d => d.views), 1);
    const width = 1000;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const stepX = chartWidth / (chartData.length - 1 || 1);

    const createPath = (key) => {
      return chartData.map((d, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + chartHeight - (d[key] / maxViews) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    const yTicks = [];
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      yTicks.push(Math.round((maxViews / tickCount) * i * 10) / 10);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + chartHeight - (tick / maxViews) * chartHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{tick}</text>
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {chartData.map((d, i) => {
          const x = padding.left + i * stepX;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fill="#9ca3af" fontSize="10">
              {d.date}
            </text>
          );
        })}

        {/* Lines */}
        <path d={createPath('views')} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={createPath('inquiries')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={createPath('bookings')} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {chartData.map((d, i) => {
          const x = padding.left + i * stepX;
          return (
            <g key={i}>
              <circle cx={x} cy={padding.top + chartHeight - (d.views / maxViews) * chartHeight} r="3.5" fill="#7c3aed" />
              <circle cx={x} cy={padding.top + chartHeight - (d.inquiries / maxViews) * chartHeight} r="3.5" fill="#3b82f6" />
              <circle cx={x} cy={padding.top + chartHeight - (d.bookings / maxViews) * chartHeight} r="3.5" fill="#22c55e" />
            </g>
          );
        })}
      </svg>
    );
  };

  const ChangeIndicator = ({ value }) => {
    if (value === 0) return <span className="text-gray-500 text-sm">No change</span>;
    const isPositive = value > 0;
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-20 h-20 rounded-xl object-cover" />
            <div className="font-bold text-lg leading-tight">Event<br/>Nest</div>
          </div>

            <nav className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <a href="#" className="flex items-center gap-2 text-purple-600 font-medium">
                <TrendingUp size={20} />
                Analytics
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Calendar size={20} />
                Bookings
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <MessageSquare size={20} />
                Inquiries
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <CalendarDays size={20} />
                Calendar
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <User size={20} />
                Profile
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">
                Customer View
              </Link>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                S
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title & Time Period */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {[
              { value: '7', label: '7 Days' },
              { value: '30', label: '30 Days' },
              { value: '90', label: '90 Days' },
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  timePeriod === period.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* STAT CARDS                          */}
        {/* ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Profile Views */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={18} className="text-gray-500" />
                  <p className="text-gray-600 font-medium">Profile Views</p>
                </div>
                <p className="text-5xl font-bold mb-1">{data.profileViews}</p>
                <p className="text-gray-500 text-sm">Last {timePeriod} days</p>
              </div>
              <ChangeIndicator value={data.profileViewsChange} />
            </div>
          </div>

          {/* Inquiries */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={18} className="text-gray-500" />
                  <p className="text-gray-600 font-medium">Inquiries</p>
                </div>
                <p className="text-5xl font-bold mb-1">{data.inquiries}</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {data.profileViews > 0 ? ((data.inquiries / data.profileViews) * 100).toFixed(1) : 0}% of views
                </span>
              </div>
              <ChangeIndicator value={data.inquiriesChange} />
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-gray-500" />
                  <p className="text-gray-600 font-medium">Bookings</p>
                </div>
                <p className="text-5xl font-bold mb-1">{data.bookings}</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {data.inquiries > 0 ? ((data.bookings / data.inquiries) * 100).toFixed(0) : 0}% conversion
                </span>
              </div>
              <ChangeIndicator value={data.bookingsChange} />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={18} className="text-gray-500" />
                  <p className="text-gray-600 font-medium">Revenue</p>
                </div>
                <p className="text-5xl font-bold mb-1">£{data.revenue.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Avg: £{data.avgBookingValue.toLocaleString()}</p>
              </div>
              <ChangeIndicator value={data.revenueChange} />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* CONVERSION FUNNEL                   */}
        {/* ═══════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity size={20} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Conversion Funnel Analysis</h2>
          </div>

          <div className="space-y-5">
            {funnel.map((step, index) => {
              const percentage = funnel[0].count > 0 ? (step.count / funnel[0].count) * 100 : 0;
              const dropOff = index > 0 && funnel[index - 1].count > 0
                ? ((funnel[index - 1].count - step.count) / funnel[index - 1].count) * 100
                : 0;

              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{step.label}</span>
                      <span className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {step.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{percentage.toFixed(1)}% of total</span>
                      {index > 0 && dropOff > 0 && (
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                          ↓ {dropOff.toFixed(1)}% drop-off
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${step.color}`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* ACTIVITY OVER TIME CHART            */}
        {/* ═══════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Activity Over Time</h2>
          </div>

          {renderChart()}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-sm text-gray-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Inquiries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Bookings</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* TWO COLUMN: INQUIRY SOURCES + PEAK  */}
        {/* ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Inquiry Sources */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Target size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Where Inquiries Come From</h2>
            </div>

            <div className="space-y-4">
              {inquirySources.map(source => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{source.count}</span>
                      <span className="text-xs text-gray-500">{source.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${source.color}`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Days */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Busiest Days</h2>
            </div>

            <div className="space-y-4">
              {peakDays.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className={`text-sm font-bold w-6 text-center ${index === 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{day.day}</span>
                      <span className="text-sm text-gray-500">{day.views} views</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: `${day.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* TWO COLUMN: TOP EVENTS + PERF       */}
        {/* ═══════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Top Event Types */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Package size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">Top Event Types</h2>
            </div>

            {data.bookings > 0 ? (
              <div className="space-y-4">
                {topEventTypes.map(event => (
                  <div key={event.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${event.color}`} />
                      <span className="text-sm font-medium text-gray-700">{event.type}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{event.count} bookings</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CalendarDays className="mx-auto mb-3" size={32} />
                <p className="text-sm">No bookings yet to show event types</p>
              </div>
            )}
          </div>

          {/* Performance Score */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Score</h2>

            <div className="space-y-5">
              {/* Average Rating */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900">4.9</span>
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: '98%' }} />
                </div>
              </div>

              {/* Response Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Response Rate</span>
                  <span className="text-lg font-bold text-green-600">{data.responseRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${data.responseRate}%` }} />
                </div>
              </div>

              {/* Avg Response Time */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-purple-600" />
                    <span className="text-lg font-bold text-purple-600">{data.avgResponseTime}</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">127</span> total reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* BOOKING STATUS BREAKDOWN            */}
        {/* ═══════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Booking Status Overview</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Pending', count: 3, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
              { label: 'Confirmed', count: data.bookings, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
              { label: 'Completed', count: Math.max(0, data.bookings - 1), color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
              { label: 'Cancelled', count: 0, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
            ].map(status => (
              <div key={status.label} className={`${status.bgColor} rounded-xl p-5 text-center`}>
                <p className={`text-3xl font-bold ${status.textColor} mb-1`}>{status.count}</p>
                <p className={`text-sm font-medium ${status.textColor}`}>{status.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
