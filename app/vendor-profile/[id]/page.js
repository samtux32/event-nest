'use client';

import { use } from 'react';
import VendorPublicProfile from '@/components/VendorPublicProfile';

export default function VendorProfilePage({ params }) {
  const { id } = use(params);
  return <VendorPublicProfile vendorId={id} />;
}
