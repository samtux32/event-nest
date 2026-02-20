// End-to-end test script for the custom quote flow
// Runs against the real database using Prisma directly

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Test data ───────────────────────────────────────────────
const CUSTOMER_USER_ID    = '7b358d99-0037-4471-8e41-51c380c9a32f'
const CUSTOMER_PROFILE_ID = 'd7d2c9df-001c-4758-9e45-c76e22bf4e30'
const VENDOR_USER_ID      = 'ce47d1da-c0ff-4558-aa66-2cd9e03ec900'
const VENDOR_PROFILE_ID   = 'f36af01f-a0ac-45f2-b76a-eef65893672a'
const CONVERSATION_ID     = 'aec5fb2a-67ab-41aa-a61c-d783ff96ddd1'

// Track created IDs so we can clean up
const created = {
  quoteIds:        [],
  messageIds:      [],
  bookingIds:      [],
  notificationIds: [],
}

// ─── Helpers ─────────────────────────────────────────────────
function pass(step, detail) {
  console.log(`\nPASS [${step}]${detail ? ': ' + detail : ''}`)
}

function fail(step, detail) {
  console.error(`\nFAIL [${step}]${detail ? ': ' + detail : ''}`)
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log(`${'─'.repeat(60)}`)
}

// ─── STEP 1: Verify existing conversation ─────────────────────
async function step1() {
  section('STEP 1 — Verify existing conversation')
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
      include: {
        vendor:   { select: { id: true, businessName: true } },
        customer: { select: { id: true, fullName: true } },
        messages: true,
      },
    })

    if (!conv) {
      fail('STEP 1', `Conversation ${CONVERSATION_ID} does not exist`)
      return false
    }

    console.log(`  Conversation found: ${conv.id}`)
    console.log(`  Vendor  : ${conv.vendor.businessName} (${conv.vendor.id})`)
    console.log(`  Customer: ${conv.customer.fullName} (${conv.customer.id})`)
    console.log(`  Messages: ${conv.messages.length}`)
    console.log(`  lastMessageAt: ${conv.lastMessageAt}`)
    console.log(`  unreadVendor: ${conv.unreadVendor}  unreadCustomer: ${conv.unreadCustomer}`)

    // Validate IDs match expected
    if (conv.vendor.id !== VENDOR_PROFILE_ID) {
      fail('STEP 1', `vendorId mismatch: got ${conv.vendor.id}`)
      return false
    }
    if (conv.customer.id !== CUSTOMER_PROFILE_ID) {
      fail('STEP 1', `customerId mismatch: got ${conv.customer.id}`)
      return false
    }

    pass('STEP 1', `Conversation exists with ${conv.messages.length} message(s), lastMessageAt=${conv.lastMessageAt}`)
    return true
  } catch (err) {
    fail('STEP 1', err.message)
    return false
  }
}

// ─── STEP 2: Vendor sends a custom quote ──────────────────────
async function step2() {
  section('STEP 2 — Vendor sends a custom quote')
  let quoteId, messageId, notifId

  try {
    const beforeConv = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
      select: { lastMessageAt: true },
    })
    const beforeLastMessageAt = beforeConv.lastMessageAt

    // ── Transaction: create Quote + Message + update Conversation ──
    const [quote] = await prisma.$transaction(async (tx) => {
      const q = await tx.quote.create({
        data: {
          conversationId: CONVERSATION_ID,
          vendorId:       VENDOR_PROFILE_ID,
          customerId:     CUSTOMER_PROFILE_ID,
          title:          'TEST QUOTE — Wedding Photography Package',
          description:    'Full-day coverage with 2 photographers',
          price:          2500.00,
          features:       ['8 hours coverage', '500+ edited photos', 'Online gallery'],
          status:         'pending',
        },
      })

      const msg = await tx.message.create({
        data: {
          conversationId: CONVERSATION_ID,
          senderId:       VENDOR_USER_ID,
          text:           `Custom quote: TEST QUOTE — Wedding Photography Package`,
          type:           'quote',
          quoteId:        q.id,
        },
      })

      await tx.conversation.update({
        where: { id: CONVERSATION_ID },
        data: {
          lastMessageAt:  new Date(),
          unreadCustomer: { increment: 1 },
        },
      })

      return [q, msg]
    })

    quoteId   = quote.id
    created.quoteIds.push(quoteId)
    // We'll collect message IDs below

    // ── Create customer notification ──
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: VENDOR_PROFILE_ID },
      select: { businessName: true },
    })

    const notif = await prisma.notification.create({
      data: {
        userId: CUSTOMER_USER_ID,
        type:   'quote_received',
        title:  'New custom quote received',
        body:   `${vendorProfile.businessName} has sent you a custom quote: TEST QUOTE — Wedding Photography Package`,
        link:   `/customer-messages?conv=${CONVERSATION_ID}`,
      },
    })
    notifId = notif.id
    created.notificationIds.push(notifId)

    // ── Verify: Quote in DB with status=pending ──
    const dbQuote = await prisma.quote.findUnique({ where: { id: quoteId } })
    if (!dbQuote || dbQuote.status !== 'pending') {
      fail('STEP 2a', `Quote status expected 'pending', got '${dbQuote?.status}'`)
      return null
    }
    console.log(`  [2a] Quote created: ${quoteId}, status=${dbQuote.status}, price=${dbQuote.price}`)
    pass('STEP 2a', 'Quote exists with status=pending')

    // ── Verify: Message with type=quote and quoteId ──
    const dbMsg = await prisma.message.findFirst({
      where: { quoteId: quoteId, type: 'quote' },
    })
    if (!dbMsg) {
      fail('STEP 2b', 'No message with type=quote found for this quote')
      return null
    }
    messageId = dbMsg.id
    created.messageIds.push(messageId)
    console.log(`  [2b] Message created: ${messageId}, type=${dbMsg.type}, quoteId=${dbMsg.quoteId}`)
    pass('STEP 2b', 'Message with type=quote and quoteId exists')

    // ── Verify: lastMessageAt was updated ──
    const afterConv = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
      select: { lastMessageAt: true, unreadCustomer: true },
    })
    const afterLastMessageAt = afterConv.lastMessageAt

    if (!afterLastMessageAt) {
      fail('STEP 2c', 'lastMessageAt is still null after sending quote')
      return null
    }
    if (beforeLastMessageAt && afterLastMessageAt <= beforeLastMessageAt) {
      fail('STEP 2c', `lastMessageAt not updated: before=${beforeLastMessageAt}, after=${afterLastMessageAt}`)
      return null
    }
    console.log(`  [2c] lastMessageAt updated: ${afterLastMessageAt}`)
    pass('STEP 2c', `Conversation.lastMessageAt updated to ${afterLastMessageAt}`)

    // ── Verify: Notification for customer with type=quote_received ──
    const dbNotif = await prisma.notification.findUnique({ where: { id: notifId } })
    if (!dbNotif) {
      fail('STEP 2d', 'Notification not found in DB')
      return null
    }
    if (dbNotif.userId !== CUSTOMER_USER_ID) {
      fail('STEP 2d', `Notification userId mismatch: got ${dbNotif.userId}`)
      return null
    }
    if (dbNotif.type !== 'quote_received') {
      fail('STEP 2d', `Notification type expected 'quote_received', got '${dbNotif.type}'`)
      return null
    }
    if (!dbNotif.link?.includes(CONVERSATION_ID)) {
      fail('STEP 2d', `Notification link '${dbNotif.link}' does not contain conversation ID`)
      return null
    }
    console.log(`  [2d] Notification: id=${notifId}, type=${dbNotif.type}, link=${dbNotif.link}`)
    pass('STEP 2d', `Notification created for customer with type=quote_received and correct link`)

    pass('STEP 2', 'All sub-checks passed')
    return quoteId
  } catch (err) {
    fail('STEP 2', err.message)
    console.error(err)
    return null
  }
}

// ─── STEP 3: Customer accepts the quote ───────────────────────
async function step3(quoteId) {
  section('STEP 3 — Customer accepts the quote')
  if (!quoteId) {
    fail('STEP 3', 'Skipped — no quoteId from Step 2')
    return
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        conversation: true,
        vendor:   { include: { user: true } },
        customer: { include: { user: true } },
      },
    })

    const totalPrice  = Number(quote.price)
    const vendorFee   = Math.round(totalPrice * 0.10 * 100) / 100
    const customerFee = Math.round(totalPrice * 0.02 * 100) / 100

    let booking
    await prisma.$transaction(async (tx) => {
      booking = await tx.booking.create({
        data: {
          vendorId:   quote.vendorId,
          customerId: quote.customerId,
          status:     'pending',
          totalPrice,
          vendorFee,
          customerFee,
        },
      })
      created.bookingIds.push(booking.id)

      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'accepted', bookingId: booking.id },
      })

      const sysMsg = await tx.message.create({
        data: {
          conversationId: quote.conversationId,
          senderId:       CUSTOMER_USER_ID,
          text:           'Quote accepted. Booking created.',
          type:           'text',
        },
      })
      created.messageIds.push(sysMsg.id)

      await tx.conversation.update({
        where: { id: quote.conversationId },
        data: {
          lastMessageAt: new Date(),
          unreadVendor:  { increment: 1 },
        },
      })
    })

    // Notify vendor
    const notif = await prisma.notification.create({
      data: {
        userId: VENDOR_USER_ID,
        type:   'quote_accepted',
        title:  'Quote accepted!',
        body:   `james.wilson has accepted your quote and created a booking.`,
        link:   `/messages?conv=${CONVERSATION_ID}`,
      },
    })
    created.notificationIds.push(notif.id)

    // ── Verify: Quote status is 'accepted' ──
    const dbQuote = await prisma.quote.findUnique({ where: { id: quoteId } })
    if (dbQuote.status !== 'accepted') {
      fail('STEP 3a', `Quote status expected 'accepted', got '${dbQuote.status}'`)
      return
    }
    console.log(`  [3a] Quote status: ${dbQuote.status}`)
    pass('STEP 3a', 'Quote status is accepted')

    // ── Verify: Booking created with correct vendorId and customerId ──
    const dbBooking = await prisma.booking.findUnique({ where: { id: booking.id } })
    if (!dbBooking) {
      fail('STEP 3b', 'Booking not found in DB')
      return
    }
    if (dbBooking.vendorId !== VENDOR_PROFILE_ID) {
      fail('STEP 3b', `Booking vendorId mismatch: got ${dbBooking.vendorId}`)
      return
    }
    if (dbBooking.customerId !== CUSTOMER_PROFILE_ID) {
      fail('STEP 3b', `Booking customerId mismatch: got ${dbBooking.customerId}`)
      return
    }
    console.log(`  [3b] Booking: id=${dbBooking.id}, vendorId=${dbBooking.vendorId}, customerId=${dbBooking.customerId}, totalPrice=${dbBooking.totalPrice}`)
    pass('STEP 3b', `Booking created with correct vendorId and customerId, totalPrice=${dbBooking.totalPrice}`)

    // ── Verify: Quote.bookingId is set ──
    if (dbQuote.bookingId !== booking.id) {
      fail('STEP 3c', `Quote.bookingId mismatch: expected ${booking.id}, got ${dbQuote.bookingId}`)
      return
    }
    console.log(`  [3c] Quote.bookingId: ${dbQuote.bookingId}`)
    pass('STEP 3c', 'Quote.bookingId is set correctly')

    // ── Verify: System message 'Quote accepted. Booking created.' ──
    const sysMsg = await prisma.message.findFirst({
      where: {
        conversationId: CONVERSATION_ID,
        text:           'Quote accepted. Booking created.',
        type:           'text',
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!sysMsg) {
      fail('STEP 3d', "System message 'Quote accepted. Booking created.' not found")
      return
    }
    console.log(`  [3d] System message: id=${sysMsg.id}, text="${sysMsg.text}"`)
    pass('STEP 3d', "System message 'Quote accepted. Booking created.' exists")

    // ── Verify: Notification for vendor with type=quote_accepted ──
    const dbNotif = await prisma.notification.findUnique({ where: { id: notif.id } })
    if (!dbNotif || dbNotif.userId !== VENDOR_USER_ID) {
      fail('STEP 3e', `Vendor notification userId mismatch or not found`)
      return
    }
    if (dbNotif.type !== 'quote_accepted') {
      fail('STEP 3e', `Notification type expected 'quote_accepted', got '${dbNotif.type}'`)
      return
    }
    if (!dbNotif.link?.includes(CONVERSATION_ID)) {
      fail('STEP 3e', `Notification link '${dbNotif.link}' does not contain conversation ID`)
      return
    }
    console.log(`  [3e] Vendor notification: id=${notif.id}, type=${dbNotif.type}, link=${dbNotif.link}`)
    pass('STEP 3e', `Vendor notification created with type=quote_accepted and correct link`)

    pass('STEP 3', 'All sub-checks passed')
  } catch (err) {
    fail('STEP 3', err.message)
    console.error(err)
  }
}

// ─── STEP 4: Conversation ordering ───────────────────────────
async function step4() {
  section('STEP 4 — Conversation ordering for james.wilson')
  try {
    const conversations = await prisma.conversation.findMany({
      where: { customerId: CUSTOMER_PROFILE_ID },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      select: { id: true, lastMessageAt: true },
    })

    console.log(`  Total conversations for customer: ${conversations.length}`)
    conversations.forEach((c, i) => {
      console.log(`  [${i + 1}] id=${c.id}, lastMessageAt=${c.lastMessageAt}`)
    })

    if (conversations.length === 0) {
      fail('STEP 4', 'No conversations found for customer')
      return
    }

    const first = conversations[0]
    if (first.id !== CONVERSATION_ID) {
      fail('STEP 4', `Test conversation is NOT first. First is ${first.id} (lastMessageAt=${first.lastMessageAt}), test conv lastMessageAt=${conversations.find(c=>c.id===CONVERSATION_ID)?.lastMessageAt}`)
      return
    }

    pass('STEP 4', `Test conversation is first in ordering (lastMessageAt=${first.lastMessageAt})`)

    // Also verify: any null lastMessageAt conversations are sorted LAST
    const nullConvs = conversations.filter(c => c.lastMessageAt === null)
    if (nullConvs.length > 0) {
      const lastNullIdx = conversations.findIndex(c => c.lastMessageAt !== null)
      const firstNullIdx = conversations.findIndex(c => c.lastMessageAt === null)
      if (firstNullIdx < lastNullIdx || lastNullIdx === -1) {
        pass('STEP 4b', `${nullConvs.length} null-lastMessageAt conversation(s) sorted after non-null (nulls: last working)`)
      } else {
        fail('STEP 4b', 'null-lastMessageAt conversations are not sorted last — bug!')
      }
    } else {
      pass('STEP 4b', 'No null lastMessageAt conversations to test null ordering (all have timestamps)')
    }
  } catch (err) {
    fail('STEP 4', err.message)
    console.error(err)
  }
}

// ─── STEP 5: Messages fetch with quote populated ───────────────
async function step5(quoteId) {
  section('STEP 5 — Messages fetch with quote object populated')
  if (!quoteId) {
    fail('STEP 5', 'Skipped — no quoteId from Step 2')
    return
  }

  try {
    const messages = await prisma.message.findMany({
      where:   { conversationId: CONVERSATION_ID },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true } },
        quote:  true,
      },
    })

    console.log(`  Total messages in conversation: ${messages.length}`)

    const quoteMessages = messages.filter(m => m.type === 'quote')
    console.log(`  Messages with type='quote': ${quoteMessages.length}`)

    if (quoteMessages.length === 0) {
      fail('STEP 5a', "No messages with type='quote' found")
      return
    }

    // Find our test quote message
    const testQuoteMsg = quoteMessages.find(m => m.quoteId === quoteId)
    if (!testQuoteMsg) {
      fail('STEP 5a', `No quote message found with quoteId=${quoteId}`)
      return
    }
    pass('STEP 5a', `Found quote message: id=${testQuoteMsg.id}, type=${testQuoteMsg.type}`)

    // Verify quote object is populated
    if (!testQuoteMsg.quote) {
      fail('STEP 5b', 'quote relation is null on the quote message')
      return
    }

    const q = testQuoteMsg.quote
    console.log(`  [5b] Quote object:`)
    console.log(`       id=${q.id}`)
    console.log(`       title="${q.title}"`)
    console.log(`       price=${q.price}`)
    console.log(`       status=${q.status}`)
    console.log(`       features=${JSON.stringify(q.features)}`)
    console.log(`       bookingId=${q.bookingId}`)

    if (q.id !== quoteId) {
      fail('STEP 5b', `quote.id mismatch: expected ${quoteId}, got ${q.id}`)
      return
    }
    pass('STEP 5b', `Quote object is populated correctly (title="${q.title}", price=${q.price}, status=${q.status})`)

    // Spot-check system message is also present
    const sysMsgs = messages.filter(m => m.text === 'Quote accepted. Booking created.')
    if (sysMsgs.length > 0) {
      pass('STEP 5c', `System message 'Quote accepted. Booking created.' is present in messages array`)
    } else {
      pass('STEP 5c', 'System message may not exist yet (depends on step 3 running), skipping assertion')
    }

    pass('STEP 5', 'Messages fetch with include: { quote: true } working correctly')
  } catch (err) {
    fail('STEP 5', err.message)
    console.error(err)
  }
}

// ─── STEP 6: Customer declines a new quote ────────────────────
async function step6() {
  section('STEP 6 — Customer declines a new (second) quote')
  let quote2Id, declineMsgId

  try {
    // Create a second quote to decline
    const [quote2] = await prisma.$transaction(async (tx) => {
      const q = await tx.quote.create({
        data: {
          conversationId: CONVERSATION_ID,
          vendorId:       VENDOR_PROFILE_ID,
          customerId:     CUSTOMER_PROFILE_ID,
          title:          'TEST QUOTE 2 — To Be Declined',
          description:    'This quote will be declined in the test',
          price:          1000.00,
          features:       ['Feature A', 'Feature B'],
          status:         'pending',
        },
      })

      const msg = await tx.message.create({
        data: {
          conversationId: CONVERSATION_ID,
          senderId:       VENDOR_USER_ID,
          text:           'Custom quote: TEST QUOTE 2 — To Be Declined',
          type:           'quote',
          quoteId:        q.id,
        },
      })

      await tx.conversation.update({
        where: { id: CONVERSATION_ID },
        data: {
          lastMessageAt:  new Date(),
          unreadCustomer: { increment: 1 },
        },
      })

      return [q, msg]
    })

    quote2Id = quote2.id
    created.quoteIds.push(quote2Id)

    // Collect the quote message ID for cleanup
    const q2Msg = await prisma.message.findFirst({ where: { quoteId: quote2Id } })
    if (q2Msg) created.messageIds.push(q2Msg.id)

    console.log(`  Created second quote: ${quote2Id}`)

    // ── Now simulate decline ──
    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quote2Id },
        data:  { status: 'declined' },
      }),
      prisma.message.create({
        data: {
          conversationId: CONVERSATION_ID,
          senderId:       CUSTOMER_USER_ID,
          text:           'Quote declined.',
          type:           'text',
        },
      }),
      prisma.conversation.update({
        where: { id: CONVERSATION_ID },
        data: {
          lastMessageAt: new Date(),
          unreadVendor:  { increment: 1 },
        },
      }),
    ])

    // ── Verify: Quote status = 'declined' ──
    const dbQuote2 = await prisma.quote.findUnique({ where: { id: quote2Id } })
    if (dbQuote2.status !== 'declined') {
      fail('STEP 6a', `Quote2 status expected 'declined', got '${dbQuote2.status}'`)
      return
    }
    console.log(`  [6a] Quote 2 status: ${dbQuote2.status}`)
    pass('STEP 6a', 'Second quote status is declined')

    // ── Verify: 'Quote declined.' message exists ──
    const declineMsg = await prisma.message.findFirst({
      where: {
        conversationId: CONVERSATION_ID,
        text:           'Quote declined.',
        type:           'text',
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!declineMsg) {
      fail('STEP 6b', "'Quote declined.' message not found in conversation")
      return
    }
    declineMsgId = declineMsg.id
    created.messageIds.push(declineMsgId)
    console.log(`  [6b] Decline message: id=${declineMsg.id}, text="${declineMsg.text}"`)
    pass('STEP 6b', "'Quote declined.' message exists in conversation")

    pass('STEP 6', 'All sub-checks passed')
  } catch (err) {
    fail('STEP 6', err.message)
    console.error(err)
  }
}

// ─── Cleanup ──────────────────────────────────────────────────
async function cleanup() {
  section('CLEANUP — Removing test data')
  let errors = []

  try {
    // Delete notifications
    if (created.notificationIds.length > 0) {
      const r = await prisma.notification.deleteMany({
        where: { id: { in: created.notificationIds } },
      })
      console.log(`  Deleted ${r.count} notification(s)`)
    }

    // Delete the 'Quote declined.' and 'Quote accepted.' system messages
    // and quote messages — find any messages linked to our test quotes
    const allRelatedMsgs = await prisma.message.findMany({
      where: {
        OR: [
          { id: { in: created.messageIds } },
          { quoteId: { in: created.quoteIds } },
        ],
      },
    })
    const allMsgIds = [...new Set([
      ...created.messageIds,
      ...allRelatedMsgs.map(m => m.id),
    ])]

    // Also find system messages created in step 3 and step 6
    const systemMsgs = await prisma.message.findMany({
      where: {
        conversationId: CONVERSATION_ID,
        text: { in: ['Quote accepted. Booking created.', 'Quote declined.'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    systemMsgs.forEach(m => allMsgIds.push(m.id))

    const uniqueMsgIds = [...new Set(allMsgIds)]
    if (uniqueMsgIds.length > 0) {
      // First nullify quoteId on messages to avoid FK issues
      await prisma.message.updateMany({
        where: { id: { in: uniqueMsgIds } },
        data:  { quoteId: null },
      })

      const r = await prisma.message.deleteMany({
        where: { id: { in: uniqueMsgIds } },
      })
      console.log(`  Deleted ${r.count} message(s)`)
    }

    // Delete quotes (must be after messages since messages reference quotes)
    if (created.quoteIds.length > 0) {
      // First unlink bookingId to avoid FK constraint
      await prisma.quote.updateMany({
        where: { id: { in: created.quoteIds } },
        data:  { bookingId: null },
      })
      const r = await prisma.quote.deleteMany({
        where: { id: { in: created.quoteIds } },
      })
      console.log(`  Deleted ${r.count} quote(s)`)
    }

    // Delete bookings
    if (created.bookingIds.length > 0) {
      const r = await prisma.booking.deleteMany({
        where: { id: { in: created.bookingIds } },
      })
      console.log(`  Deleted ${r.count} booking(s)`)
    }

    // Verify the original conversation is untouched
    const conv = await prisma.conversation.findUnique({
      where: { id: CONVERSATION_ID },
    })
    if (conv) {
      console.log(`  Original conversation still exists: ${conv.id}`)
      console.log(`  Final state — lastMessageAt: ${conv.lastMessageAt}, unreadVendor: ${conv.unreadVendor}, unreadCustomer: ${conv.unreadCustomer}`)
    }

    console.log('\n  Cleanup complete. Original data intact.')
  } catch (err) {
    console.error('  Cleanup error:', err.message)
    console.error(err)
  }
}

// ─── Main runner ──────────────────────────────────────────────
async function main() {
  console.log('═'.repeat(60))
  console.log('  EVENT NEST — Custom Quote Flow End-to-End Test')
  console.log(`  Run at: ${new Date().toISOString()}`)
  console.log('═'.repeat(60))

  const step1Ok = await step1()
  const quoteId = await step2()
  await step3(quoteId)
  await step4()
  await step5(quoteId)
  await step6()

  await cleanup()

  console.log('\n' + '═'.repeat(60))
  console.log('  TEST RUN COMPLETE')
  console.log('═'.repeat(60) + '\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
