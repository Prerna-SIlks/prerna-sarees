import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID?.slice(0, 10))

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Razorpay credentials not configured' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const { amount, orderId } = await req.json()

    console.log('Amount received:', amount, 'OrderId:', orderId)

    if (!amount || !orderId) {
      return NextResponse.json({ success: false, error: 'Amount and orderId are required' }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise, integer only
      currency: 'INR',
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString()
      }
    })

    console.log('Razorpay order created:', order.id)

    return NextResponse.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    })
  } catch(err: unknown) {
    console.error('Razorpay order creation error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
