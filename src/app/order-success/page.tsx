"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CheckCircle2, ChevronRight, Package, Truck, Info } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product: {
    title: string;
    image_urls: string[];
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: Record<string, string>;
  created_at: string;
  items: OrderItem[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const supabase = createClient();
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error("Order not found", orderError);
        setLoading(false);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:products(title, image_urls)')
        .eq('order_id', orderId);
        
      if (!itemsError && itemsData) {
        setOrder({
          ...orderData,
          items: itemsData
        });
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B1D1D]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] py-20 px-4 text-center">
        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-8">We couldn&apos;t find the details for this order.</p>
        <Link href="/products">
          <Button className="bg-[#6B1D1D] text-[#F5E6C8] hover:bg-[#6B1D1D]/90">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 className="w-12 h-12 text-green-600 relative z-10" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#1a1a2e] mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-lg mb-2">Thank you, <span className="font-semibold text-[#1a1a2e]">{order.customer_name}</span>! Your order is confirmed.</p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="font-mono font-bold text-[#1a1a2e]">#{order.id.split('-')[0].toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Order Details Left */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-[#1a1a2e]">Order Details</h2>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Order Date & Time</span>
                <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900 uppercase">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[10px] ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment_status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-[#6B1D1D] text-lg">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info Right */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-[#1a1a2e]">Delivery Info</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {order.delivery_address?.street}<br/>
                  {order.delivery_address?.addressLine2 && <>{order.delivery_address?.addressLine2}<br/></>}
                  {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.pincode}<br/>
                  Phone: {order.customer_phone}
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Estimated Delivery: 5-7 business days</h4>
                  <p className="text-xs text-amber-700">You will receive a tracking ID via SMS within 1 hour once your order is processed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Info Box */}
        <div className="bg-[#1a1a2e] text-white p-6 md:p-8 rounded-2xl shadow-lg border border-[#C9A84C]/50 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-serif font-bold text-[#C9A84C] mb-2">Track Your Order</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Once shipped, you will receive a tracking ID via SMS/WhatsApp on <span className="font-semibold text-white">{order.customer_phone}</span>. 
              Use it at India Post tracking: indiapost.gov.in
            </p>
          </div>
          <a 
            href="https://www.indiapost.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative z-10 whitespace-nowrap bg-[#C9A84C] hover:bg-[#d4a853] text-[#1a1a2e] font-bold px-6 py-3 rounded-lg transition-all flex items-center shadow-[0_0_20px_rgba(201,168,76,0.3)]"
          >
            Track on India Post <ChevronRight className="w-4 h-4 ml-2" />
          </a>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-12">
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <h2 className="text-lg font-serif font-semibold text-[#1a1a2e]">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50/30 transition-colors">
                <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                  {item.product?.image_urls?.[0] ? (
                    <Image src={item.product.image_urls[0]} alt={item.product.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1a1a2e] line-clamp-1">{item.product?.title || 'Unknown Product'}</h3>
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-[#1a1a2e]">
                  ₹{(Number(item.price_at_time) * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            <span className="font-medium text-gray-600">Total Paid / Payable</span>
            <span className="text-2xl font-bold text-[#6B1D1D]">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/products">
            <Button variant="outline" className="h-12 px-8 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-colors">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/profile">
            <Button className="h-12 px-8 bg-[#6B1D1D] hover:bg-[#6B1D1D]/90 text-[#F5E6C8]">
              View All Orders
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B1D1D]"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
