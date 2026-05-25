import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { billData, imageUrl } = await req.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Convert date DD/MM/YY to YYYY-MM-DD
    const dateParts = billData.date.split('/')
    let year = dateParts[2]
    if (year.length === 2) {
      year = '20' + year
    }
    const formattedDate = 
      year + '-' + 
      dateParts[1].padStart(2, '0') + '-' + 
      dateParts[0].padStart(2, '0')
    
    // Check for duplicate
    const { data: existing } = await supabase
      .from('bills')
      .select('id')
      .eq('bill_date', formattedDate)
      .single()
    
    if (existing && !billData.forceReplace) {
      return NextResponse.json({
        success: false,
        duplicate: true,
        existingId: existing.id,
        message: 'Bill for this date already exists'
      })
    }
    
    // Delete existing if replacing
    if (existing && billData.forceReplace) {
      await supabase
        .from('bills')
        .delete()
        .eq('id', existing.id)
    }
    
    // Save new bill
    const { data, error } = await supabase
      .from('bills')
      .insert([{
        bill_date: formattedDate,
        bill_time: billData.time,
        image_url: imageUrl,
        total_tax: billData.total_tax,
        total_amount: billData.total_amount,
        total_bills: billData.total_bills,
        bill_entries: billData.entries,
        is_verified: true
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch(err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
