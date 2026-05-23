import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Use service role client to bypass RLS — we verify the user via their access token
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user identity via access token sent from the client
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Checkout auth error:", authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, totalAmount, address, paymentMethod } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const customerName = `${address?.firstName || ''} ${address?.lastName || ''}`.trim();
    
    let initialStatus = 'pending';
    let initialPaymentStatus = 'pending';
    
    if (paymentMethod === 'cod') {
      initialStatus = 'received';
      initialPaymentStatus = 'cod';
    }

    // 1. Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        customer_name: customerName,
        customer_phone: address?.phone || '',
        delivery_address: address || {},
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItemsData = items.map((item: { product: { id: string, price: number }, quantity: number }) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // 3. Clear user's cart in DB only for COD (Razorpay clears after verification)
    if (paymentMethod === 'cod') {
      const { error: clearError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearError) throw clearError;
    }

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
