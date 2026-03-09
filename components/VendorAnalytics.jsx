'use client';

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { formatCurrency } from '@/lib/currency';
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
  Loader2,
  Download,
  Users,
  RefreshCw,
  Zap,
  PieChart,
  Wallet,
  ArrowRight,
  Repeat,
  XCircle,
  Timer,
} from 'lucide-react';

const SOURCE_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
const EVENT_COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500', 'bg-gray-400'];
const REVENUE_BAR_COLORS = ['text-purple-600', 'text-blue-600', 'text-green-600', 'text-orange-500', 'text-pink-500'];

export default function VendorAnalytics() {
  const [timePeriod, setTimePeriod] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${timePeriod}`)
      .then(r => r.json())
      .then(json => { if (!json.error) setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timePeriod]);

  const fmt = (amount) => formatCurrency(amount, 'GBP');

  // Derived funnel
  const funnel = data ? [
    { label: 'Views', count: data.profileViews, color: 'bg-purple-600' },
    { label: 'Inquiries', count: data.inquiries, color: 'bg-blue-500' },
    { label: 'Bookings', count: data.bookings, color: 'bg-green-500' },
  ] : [];

  const inquirySources = data
    ? Object.entries(data.sourceCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
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

  // Revenue by month chart
  const renderRevenueChart = () => {
    const months = data?.revenueByMonth || [];
    if (!months.length) return null;
    const maxRevenue = Math.max(...months.map(m => m.revenue), 1);
    const barWidth = Math.max(20, Math.min(40, 800 / months.length - 8));

    return (
      <div className="overflow-x-auto">
        <div className="flex items-end gap-1.5 min-w-fit" style={{ height: 200 }}>
          {months.map((m, i) => {
            const h = maxRevenue > 0 ? (m.revenue / maxRevenue) * 160 : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1" style={{ width: barWidth }}>
                {m.revenue > 0 && (
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    £{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}
                  </span>
                )}
                <div
                  className="bg-purple-500 rounded-t-md w-full transition-all duration-500"
                  style={{ height: Math.max(h, m.revenue > 0 ? 4 : 0) }}
                  title={`${m.month}: ${fmt(m.revenue)} (${m.bookings} booking${m.bookings !== 1 ? 's' : ''})`}
                />
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Activity line chart
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
    if (value === 0 || value == null) return <span className="text-gray-400 text-sm">&mdash;</span>;
    const isPositive = value > 0;
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const MetricCard = ({ icon: Icon, label, value, sub, color = 'text-gray-500' }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <div className={`p-2 rounded-lg bg-white border border-gray-200 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  const periodLabel = timePeriod === 'all' ? 'all time' : `last ${timePeriod} days`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setExportError(null);
                try {
                  const res = await fetch('/api/analytics/export');
                  if (!res.ok) throw new Error();
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'analytics.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {
                  setExportError('Export failed. Please try again.');
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download size={15} />
              Export CSV
            </button>
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              {[
                { value: '7', label: '7D' },
                { value: '30', label: '30D' },
                { value: '90', label: '90D' },
                { value: '365', label: '1Y' },
                { value: 'all', label: 'All' },
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setTimePeriod(period.value)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    timePeriod === period.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {exportError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{exportError}</span>
            <button onClick={() => setExportError(null)} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : !data ? (
          <div className="text-center py-24 text-gray-500">Failed to load analytics</div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 border-l-4 border-l-purple-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={18} className="text-gray-500" />
                      <p className="text-gray-600 font-medium">Profile Views</p>
                    </div>
                    <p className="text-4xl font-bold mb-1">{(data.profileViews || 0).toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{periodLabel}</p>
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
                    <p className="text-4xl font-bold mb-1">{data.inquiries}</p>
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
                    <p className="text-4xl font-bold mb-1">{data.bookings}</p>
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
                    <p className="text-4xl font-bold mb-1">{fmt(data.revenue)}</p>
                    {(data.avgBookingValue ?? 0) > 0 && (
                      <p className="text-gray-500 text-sm">Avg: {fmt(data.avgBookingValue)}</p>
                    )}
                  </div>
                  <ChangeIndicator value={data.revenueChange} />
                </div>
              </div>
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Wallet size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Financial Summary</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-5">
                  <p className="text-sm text-green-700 font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-800">{fmt(data.revenue)}</p>
                  <p className="text-xs text-green-600 mt-1">{data.bookings} confirmed booking{data.bookings !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-5">
                  <p className="text-sm text-purple-700 font-medium mb-1">Upcoming (Forecast)</p>
                  <p className="text-2xl font-bold text-purple-800">{fmt(data.upcomingRevenue || 0)}</p>
                  <p className="text-xs text-purple-600 mt-1">From confirmed future bookings</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-5">
                  <p className="text-sm text-blue-700 font-medium mb-1">Avg Booking Value</p>
                  <p className="text-2xl font-bold text-blue-800">{fmt(data.avgBookingValue)}</p>
                  <p className="text-xs text-blue-600 mt-1">{periodLabel}</p>
                </div>
              </div>
            </div>

            {/* REVENUE BY MONTH */}
            {(data.revenueByMonth?.length > 0) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 size={20} className="text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Revenue by Month</h2>
                  <span className="text-sm text-gray-500 font-normal">Last 12 months</span>
                </div>
                {renderRevenueChart()}
              </div>
            )}

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
                              &darr; {dropOff.toFixed(1)}% drop-off
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

            {/* RESPONSE & QUOTE METRICS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Zap size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Response & Quote Performance</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Timer}
                  label="Avg Response Time"
                  value={data.avgResponseTime != null ? (data.avgResponseTime < 24 ? `${data.avgResponseTime}h` : `${Math.round(data.avgResponseTime / 24)}d`) : '—'}
                  sub={data.avgResponseTime != null ? (data.avgResponseTime <= 2 ? 'Excellent' : data.avgResponseTime <= 12 ? 'Good' : 'Could improve') : 'No data yet'}
                  color={data.avgResponseTime != null && data.avgResponseTime <= 2 ? 'text-green-600' : 'text-gray-500'}
                />
                <MetricCard
                  icon={MessageSquare}
                  label="Response Rate"
                  value={data.responseRate != null ? `${data.responseRate}%` : '—'}
                  sub={data.responseRate != null ? `${periodLabel}` : 'No conversations yet'}
                  color={data.responseRate >= 80 ? 'text-green-600' : 'text-gray-500'}
                />
                <MetricCard
                  icon={CheckCircle2}
                  label="Quote Acceptance"
                  value={data.quoteAcceptanceRate != null ? `${data.quoteAcceptanceRate}%` : '—'}
                  sub="All-time acceptance rate"
                  color={data.quoteAcceptanceRate >= 50 ? 'text-green-600' : 'text-gray-500'}
                />
                <MetricCard
                  icon={Clock}
                  label="Avg Time to Confirm"
                  value={data.avgTimeToConfirm != null ? `${data.avgTimeToConfirm}d` : '—'}
                  sub="From inquiry to confirmed"
                  color="text-gray-500"
                />
              </div>
            </div>

            {/* OPERATIONAL METRICS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <PieChart size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Business Health</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  icon={Repeat}
                  label="Repeat Customers"
                  value={`${data.repeatCustomerRate || 0}%`}
                  sub="Customers who booked more than once"
                  color={data.repeatCustomerRate > 0 ? 'text-purple-600' : 'text-gray-500'}
                />
                <MetricCard
                  icon={XCircle}
                  label="Cancellation Rate"
                  value={`${data.cancellationRate || 0}%`}
                  sub="All-time cancellations"
                  color={data.cancellationRate <= 10 ? 'text-green-600' : 'text-red-500'}
                />
                <MetricCard
                  icon={Target}
                  label="Conversion Rate"
                  value={data.inquiries > 0 ? `${((data.bookings / data.inquiries) * 100).toFixed(1)}%` : '—'}
                  sub={`${data.bookings} of ${data.inquiries} inquiries`}
                  color={data.inquiries > 0 && (data.bookings / data.inquiries) >= 0.3 ? 'text-green-600' : 'text-gray-500'}
                />
              </div>
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

            {/* TOP EVENT TYPES + REVENUE BY EVENT TYPE */}
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
                    <p className="text-sm">No bookings yet</p>
                  </div>
                )}
              </div>

              {/* Revenue by Event Type */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign size={20} className="text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">Revenue by Event Type</h2>
                </div>
                {(data.revenueByEventType?.length > 0) ? (
                  <div className="space-y-4">
                    {data.revenueByEventType.map((item, i) => {
                      const maxRev = data.revenueByEventType[0]?.revenue || 1;
                      const pct = Math.round((item.revenue / maxRev) * 100);
                      return (
                        <div key={item.type}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700">{item.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{fmt(item.revenue)}</span>
                              <span className="text-xs text-gray-500">{item.count} booking{item.count !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${EVENT_COLORS[i] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <DollarSign className="mx-auto mb-3" size={32} />
                    <p className="text-sm">No revenue data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* PERFORMANCE SCORE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
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
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">{data.totalReviews}</span> total review{data.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Avg Booking Value</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(data.avgBookingValue)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Upcoming Revenue</span>
                    <span className="text-sm font-bold text-purple-600">{fmt(data.upcomingRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Quote Acceptance</span>
                    <span className="text-sm font-bold text-gray-900">{data.quoteAcceptanceRate != null ? `${data.quoteAcceptanceRate}%` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Repeat Customers</span>
                    <span className="text-sm font-bold text-gray-900">{data.repeatCustomerRate || 0}%</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
