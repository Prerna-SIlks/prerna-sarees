import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const folder = formData.get('folder') as string
    
    if (!file || !bucket) {
      return NextResponse.json({ success: false, error: 'Missing file or bucket' }, { status: 400 })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
    )
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets?.find(b => b.name === bucket)) {
      await supabase.storage.createBucket(bucket, { public: true })
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName
    
    const buffer = await file.arrayBuffer()
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
      })
      
    if (uploadError) {
      throw uploadError
    }
    
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
      
    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl 
    })
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Admin upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
