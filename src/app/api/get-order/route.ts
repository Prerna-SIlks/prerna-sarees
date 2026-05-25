import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            title,
            category_id,
            categories (
              name,
              slug
            )
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return NextResponse.json({ order });
  } catch (error: unknown) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
