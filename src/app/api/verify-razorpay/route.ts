import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id,
      razorpay_payment_id, 
      razorpay_signature,
      orderId
    } = await req.json()
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex')
    
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    // Payment verified! Update order status
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'received',
        payment_status: 'paid',
        payment_id: razorpay_payment_id
      })
      .eq('id', orderId)
    
    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Clear cart in DB now that payment is successful
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (orderData?.user_id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', orderData.user_id)
    }

    return NextResponse.json({ success: true })
    
  } catch(err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
