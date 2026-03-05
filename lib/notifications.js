import prisma from './prisma'
import { sendPushToUser } from './push'

/**
 * Create an in-app notification and send a push notification (fire-and-forget).
 * Drop-in replacement for prisma.notification.create().
 */
export async function createNotification({ userId, type, title, body, link }) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, link },
  })

  // Fire-and-forget push
  sendPushToUser(userId, {
    title,
    body: body || '',
    url: link || '/',
  }).catch(() => {})

  return notification
}

/**
 * Same as createNotification but for use inside a Prisma transaction.
 * Creates the DB notification via the transaction client, sends push after.
 */
export async function createNotificationInTx(tx, { userId, type, title, body, link }) {
  const notification = await tx.notification.create({
    data: { userId, type, title, body, link },
  })

  // Fire-and-forget push (outside transaction — uses global prisma for subscription lookup)
  sendPushToUser(userId, {
    title,
    body: body || '',
    url: link || '/',
  }).catch(() => {})

  return notification
}
