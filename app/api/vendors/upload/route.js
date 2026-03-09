import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { validateFileExtension } from '@/lib/sanitize'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Only vendors can upload files' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type') // 'cover' | 'profile' | 'portfolio' | 'document'

    if (!file || !type) {
      return NextResponse.json({ error: 'file and type are required' }, { status: 400 })
    }

    if (!['cover', 'profile', 'portfolio', 'document'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
    }

    const isDocument = type === 'document'
    const bucket = isDocument ? 'vendor-documents' : 'vendor-images'
    const ext = validateFileExtension(file.name, isDocument ? 'document' : 'image')
    if (!ext) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }
    const path = `${user.id}/${type}-${Date.now()}.${ext}`

    // Use service role client for uploads (bypasses RLS)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({ url: publicUrl, path })
  } catch (err) {
    console.error('Upload handler error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
