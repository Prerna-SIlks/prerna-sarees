import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Use service role client to bypass RLS
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

    const { orderId, items, totalAmount, address, paymentMethod, utrNumber } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const customerName = `${address?.firstName || ''} ${address?.lastName || ''}`.trim();
    
    let initialStatus = 'pending';
    let initialPaymentStatus = 'pending';
    let utr = null;
    
    if (paymentMethod === 'cod') {
      initialStatus = 'confirmed';
      initialPaymentStatus = 'pending';
    } else if (paymentMethod === 'upi') {
      initialStatus = 'pending_verification';
      initialPaymentStatus = 'pending';
      utr = utrNumber || null;
    }

    // 1. Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId, // use the UUID generated on the client
        user_id: user.id,
        total_amount: totalAmount,
        status: initialStatus,
        payment_method: paymentMethod,
        payment_status: initialPaymentStatus,
        customer_name: customerName,
        customer_phone: address?.phone || '',
        delivery_address: address || {},
        utr_number: utr
      })
      .select('id')
      .single();

    if (orderError) {
      console.error("Order insertion error:", orderError);
      throw orderError;
    }

    // 2. Insert order items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // 3. Clear user's cart in DB
    const { error: clearError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (clearError) throw clearError;

    // 4. Send SMS Notifications (Non-blocking)
    const productNames = items.map((i: { product: { title: string } }) => i.product.title).join(", ");
    const shortOrderId = order.id.split('-')[0].toUpperCase();
    const adminPhone = process.env.ADMIN_PHONE || '8660087544';
    
    let customerSms = '';
    let adminSms = '';

    if (paymentMethod === 'upi') {
      customerSms = `Dear ${customerName}, Your order #${shortOrderId} has been received at Prerna Silks!\nAmount: Rs.${totalAmount}\nUTR: ${utr}\nOur team will verify your UPI payment within 1 hour and confirm your order via SMS.\nQuestions? WhatsApp: +91 8660087544\n- Prerna Silks, Hubli`;
      
      adminSms = `NEW UPI ORDER - Action Required!\nOrder #${shortOrderId}\nCustomer: ${customerName}\nPhone: ${address?.phone}\nAmount: Rs.${totalAmount}\nUTR: ${utr}\nItems: ${productNames}\nAddress: ${address?.city}, ${address?.state}\nACTION: Verify payment and confirm at: prernasilks.vercel.app/admin/orders`;
    } else {
      customerSms = `Dear ${customerName}, Your COD order #${shortOrderId} has been confirmed at Prerna Silks!\nAmount: Rs.${totalAmount} (Pay on delivery)\nItems: ${productNames}\nDelivery to: ${address?.city}\nTrack updates on: prernasilks.vercel.app\n- Prerna Silks, Hubli`;
      
      adminSms = `NEW COD ORDER!\nOrder #${shortOrderId}\nCustomer: ${customerName}\nPhone: ${address?.phone}\nAmount: Rs.${totalAmount}\nItems: ${productNames}\nAddress: ${address?.street}, ${address?.city}\n- Prerna Silks Website`;
    }

    // Fire and forget SMS
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    Promise.all([
      fetch(`${origin}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: address.phone, message: customerSms })
      }),
      fetch(`${origin}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone, message: adminSms })
      })
    ]).catch(err => console.error("Error sending SMS:", err));

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
