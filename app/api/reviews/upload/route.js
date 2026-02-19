import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (user.user_metadata?.role !== 'customer') return NextResponse.json({ error: 'Customers only' }, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const path = `${user.id}/review-${Date.now()}.${ext}`

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from('review-photos')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

    const { data: { publicUrl } } = admin.storage.from('review-photos').getPublicUrl(path)
    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Review photo upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
