import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Determine file type
    let attachmentType = 'file'
    if (file.type.startsWith('image/')) attachmentType = 'image'
    else if (file.type === 'application/pdf') attachmentType = 'pdf'

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from('chat-attachments')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('chat-attachments').getPublicUrl(path)

    return NextResponse.json({ url: publicUrl, name: file.name, attachmentType })
  } catch (err) {
    console.error('Message upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
