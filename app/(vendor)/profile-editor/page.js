import dynamic from 'next/dynamic';

const VendorProfileEditor = dynamic(() => import('@/components/VendorProfileEditor'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  ),
});

export const metadata = { title: 'Edit Profile | Event Nest' }

export default function ProfileEditorPage() {
  return <VendorProfileEditor />;
}
