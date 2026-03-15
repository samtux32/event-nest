import dynamic from 'next/dynamic';

const AIEventPlanner = dynamic(() => import('@/components/AIEventPlanner'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  ),
});

export const metadata = { title: 'Plan My Event | Event Nest' };

export default function PlanMyEventPage() {
  return <AIEventPlanner />;
}
