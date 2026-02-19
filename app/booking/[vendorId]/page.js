import BookingRequest from '@/components/BookingRequest'

export const metadata = { title: 'Book Vendor | Event Nest' }

export default async function BookingPage({ params }) {
  const { vendorId } = await params
  return <BookingRequest vendorId={vendorId} />
}
