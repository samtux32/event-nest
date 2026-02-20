'use client';

import React, { useState, useEffect } from 'react';
import VendorHeader from '@/components/VendorHeader';
import {
  TrendingUp,
  MessageSquare,
  CalendarDays,
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
  Package,
  Loader2
} from 'lucide-react';

const SOURCE_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
const EVENT_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-gray-400'];

export default function VendorAnalytics() {
  const [timePeriod, setTimePeriod] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${timePeriod}`)
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timePeriod]);

  // Derived from real data
  const funnel = data ? [
    { label: 'Views', count: data.profileViews, color: 'bg-purple-600' },
    { label: 'Inquiries', count: data.inquiries, color: 'bg-blue-500' },
    { label: 'Bookings', count: data.bookings, color: 'bg-green-500' },
  ] : [];

  const inquirySources = data
    ? Object.entries(data.sourceCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([source, count], i) => ({
          source,
          count,
          percentage: data.inquiries > 0 ? Math.round((count / data.inquiries) * 100) : 0,
          color: SOURCE_COLORS[i] || 'bg-gray-400',
        }))
    : [];

  const topEventTypes = (data?.topEventTypes || []).map((e, i) => ({
    ...e,
    color: EVENT_COLORS[i] || 'bg-gray-400',
  }));

  const peakDays = data?.peakDays || [];

  const renderChart = () => {
    if (!data?.chartData?.length) return null;
    const chartData = data.chartData;
    const maxViews = Math.max(...chartData.map(d => Math.max(d.views, d.inquiries, d.bookings)), 1);
    const width = 1000;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const stepX = chartData.length > 1 ? chartWidth / (chartData.length - 1) : chartWidth;

    const createPath = (key) => chartData.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartHeight - (d[key] / maxViews) * chartHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const yTicks = [];
    for (let i = 0; i <= 5; i++) {
      yTicks.push(Math.round((maxViews / 5) * i * 10) / 10);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        {yTicks.map((tick, i) => {
          const y = padding.top + chartHeight - (tick / maxViews) * chartHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{tick}</text>
            </g>
          );
        })}
        {chartData.map((d, i) => (
          <text key={i} x={padding.left + i * stepX} y={height - 8} textAnchor="middle" fill="#9ca3af" fontSize="10">
            {d.date}
          </text>
        ))}
        <path d={createPath('views')} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={createPath('inquiries')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={createPath('bookings')} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
    if (value === 0 || value == null) return <span className="text-gray-400 text-sm">—</span>;
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
      <VendorHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title & Time Period */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1">Analytics Dashboard</h1>
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
                  timePeriod === period.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : !data ? (
          <div className="text-center py-24 text-gray-500">Failed to load analytics</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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

              <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={18} className="text-gray-500" />
                      <p className="text-gray-600 font-medium">Revenue</p>
                    </div>
                    <p className="text-5xl font-bold mb-1">£{data.revenue.toLocaleString()}</p>
                    {data.avgBookingValue > 0 && (
                      <p className="text-gray-500 text-sm">Avg: £{data.avgBookingValue.toLocaleString()}</p>
                    )}
                  </div>
                  <ChangeIndicator value={data.revenueChange} />
                </div>
              </div>
            </div>

            {/* CONVERSION FUNNEL */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Conversion Funnel</h2>
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

            {/* ACTIVITY OVER TIME CHART */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Activity Over Time</h2>
              </div>
              {data.chartData?.length > 0 ? (
                <>
                  {renderChart()}
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
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <TrendingUp className="mx-auto mb-3" size={32} />
                  <p className="text-sm">No activity data for this period</p>
                </div>
              )}
            </div>

            {/* INQUIRY SOURCES + PEAK DAYS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Inquiry Sources */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Target size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">Where Inquiries Come From</h2>
                </div>
                {inquirySources.length > 0 ? (
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
                          <div className={`h-full rounded-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="mx-auto mb-3" size={32} />
                    <p className="text-sm">No inquiry data yet</p>
                  </div>
                )}
              </div>

              {/* Peak Days */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">Busiest Days</h2>
                </div>
                {peakDays.some(d => d.views > 0) ? (
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
                            <div className="h-full rounded-full bg-purple-500" style={{ width: `${day.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarDays className="mx-auto mb-3" size={32} />
                    <p className="text-sm">No view data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* TOP EVENT TYPES + PERFORMANCE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Top Event Types */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Package size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">Top Event Types</h2>
                </div>
                {topEventTypes.length > 0 ? (
                  <div className="space-y-4">
                    {topEventTypes.map(event => (
                      <div key={event.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${event.color}`} />
                          <span className="text-sm font-medium text-gray-700">{event.type}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{event.count} booking{event.count !== 1 ? 's' : ''}</span>
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Rating</span>
                      <div className="flex items-center gap-1">
                        {data.averageRating != null ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">{data.averageRating.toFixed(1)}</span>
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">No reviews yet</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: data.averageRating != null ? `${(data.averageRating / 5) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {data.inquiries > 0 ? ((data.bookings / data.inquiries) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${data.inquiries > 0 ? Math.min((data.bookings / data.inquiries) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{data.totalReviews}</span> total review{data.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOOKING STATUS BREAKDOWN (all-time) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Booking Status Overview</h2>
                <span className="text-sm text-gray-500 font-normal">All time</span>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Inquiries', key: 'new_inquiry', color: 'bg-purple-50', textColor: 'text-purple-700' },
                  { label: 'Pending', key: 'pending', color: 'bg-yellow-50', textColor: 'text-yellow-700' },
                  { label: 'Confirmed', key: 'confirmed', color: 'bg-green-50', textColor: 'text-green-700' },
                  { label: 'Completed', key: 'completed', color: 'bg-blue-50', textColor: 'text-blue-700' },
                  { label: 'Cancelled', key: 'cancelled', color: 'bg-gray-50', textColor: 'text-gray-600' },
                ].map(status => (
                  <div key={status.label} className={`${status.color} rounded-xl p-5 text-center`}>
                    <p className={`text-3xl font-bold ${status.textColor} mb-1`}>
                      {data.statusBreakdown?.[status.key] ?? 0}
                    </p>
                    <p className={`text-sm font-medium ${status.textColor}`}>{status.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
