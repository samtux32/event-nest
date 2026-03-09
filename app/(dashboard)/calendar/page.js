import { Suspense } from 'react'
import VendorCalendar from '@/components/VendorCalendar'

export const metadata = { title: 'Calendar | Event Nest' }

export default function CalendarPage() {
  return (
    <Suspense>
      <VendorCalendar />
    </Suspense>
  )
}
