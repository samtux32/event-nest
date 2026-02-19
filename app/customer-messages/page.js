import { Suspense } from 'react'
import CustomerMessages from '@/components/CustomerMessages'

export const metadata = { title: 'Messages | Event Nest' }

export default function CustomerMessagesPage() {
  return (
    <Suspense>
      <CustomerMessages />
    </Suspense>
  )
}
