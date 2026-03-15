import dynamic from 'next/dynamic';

const VendorAnalytics = dynamic(() => import('@/components/VendorAnalytics'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  ),
});

export const metadata = { title: 'Analytics | Event Nest' }

export default function AnalyticsPage() {
  return <VendorAnalytics />;
}
