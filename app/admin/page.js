'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || profile?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (profile?.role !== 'admin') return null;

  return <AdminDashboard />;
}
