import BookingRequest from '@/components/BookingRequest'

export default async function BookingPage({ params }) {
  const { vendorId } = await params
  return <BookingRequest vendorId={vendorId} />
}
