import { Suspense } from 'react'
import VendorCalendar from '@/components/VendorCalendar'

export default function CalendarPage() {
  return (
    <Suspense>
      <VendorCalendar />
    </Suspense>
  )
}
