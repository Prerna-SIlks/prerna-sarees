import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Remove color from updateData since it doesn't exist in the products table schema
    // and causes the update to fail.
    if ('color' in updateData) {
      delete updateData.color;
    }
    
    if (id === 'new') {
       const { data, error } = await supabase
        .from('products')
        .insert(updateData)
        .select()
        
       if (error) {
         console.error('Insert error details:', error);
         throw new Error(error.message || JSON.stringify(error));
       }
       return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Update error details:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    
    return NextResponse.json({ success: true, data })
  } catch(err: unknown) {
    console.error('API Update Error:', err)
    const errorObj = err as Record<string, unknown>
    const errorMessage = errorObj?.message || (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err))
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
