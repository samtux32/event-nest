import { NextResponse } from 'next/server'

/**
 * Validate a request body against a zod schema.
 * Returns { data } on success, { error, response } on failure.
 */
export async function validateBody(request, schema) {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      return {
        error: messages,
        response: NextResponse.json({ error: messages }, { status: 400 }),
      }
    }
    return { data: result.data }
  } catch {
    return {
      error: 'Invalid JSON body',
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    }
  }
}
