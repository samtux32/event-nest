import prisma from '@/lib/prisma';
import VendorPublicProfile from '@/components/VendorPublicProfile';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { businessName: true, categories: true, tagline: true, profileImageUrl: true },
    });

    if (!vendor) {
      return { title: 'Vendor Not Found | Event Nest' };
    }

    const title = `${vendor.businessName} | Event Nest`;
    const description = vendor.tagline || `${vendor.categories?.join(', ')} vendor on Event Nest`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: vendor.profileImageUrl ? [vendor.profileImageUrl] : ['/logo.png'],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: vendor.profileImageUrl ? [vendor.profileImageUrl] : ['/logo.png'],
      },
    };
  } catch {
    return { title: 'Vendor | Event Nest' };
  }
}

export default async function VendorProfilePage({ params }) {
  const { id } = await params;
  return <VendorPublicProfile vendorId={id} />;
}
