"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CheckCircle2, ChevronRight, Package, Truck, Info, Hourglass, Phone } from "lucide-react";
import InvoiceButton from "@/components/InvoiceButton";

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
  utr_number?: string;
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

  const isPendingVerification = order.status === 'pending_verification';

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          {isPendingVerification ? (
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-30"></div>
              <Hourglass className="w-12 h-12 text-amber-600 relative z-10 animate-pulse" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
              <CheckCircle2 className="w-12 h-12 text-green-600 relative z-10" />
            </div>
          )}
          
          <h1 className="text-4xl font-serif font-bold text-[#1a1a2e] mb-2">
            {isPendingVerification ? "Payment Under Review" : "Order Placed Successfully!"}
          </h1>
          
          {isPendingVerification ? (
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#6B1D1D] px-6 py-3 rounded-lg inline-block font-medium mb-4">
              Your order has been placed! We are verifying your payment.
            </div>
          ) : (
            <p className="text-gray-600 text-lg mb-4">Thank you, <span className="font-semibold text-[#1a1a2e]">{order.customer_name}</span>! Your order is confirmed.</p>
          )}
          
          <div className="flex justify-center mt-6">
            <InvoiceButton 
              order={order} 
              canDownload={!isPendingVerification} 
            />
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
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-bold text-[#1a1a2e]">#{order.id.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900 uppercase">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
                </span>
              </div>
              {order.utr_number && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">UTR Number</span>
                  <span className="font-mono text-[#6B1D1D] font-bold">{order.utr_number}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[10px] tracking-wider ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.payment_status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-[#6B1D1D] text-lg">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Delivery Right */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
            {isPendingVerification ? (
              <>
                <h3 className="text-lg font-serif font-semibold text-[#1a1a2e] mb-6">What happens next?</h3>
                
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                  <div className="relative pl-6">
                    <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-1"></div>
                    <p className="font-bold text-gray-900 text-sm">Order placed</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute w-4 h-4 bg-[#C9A84C] rounded-full -left-[9px] top-1 ring-4 ring-[#C9A84C]/20 animate-pulse"></div>
                    <p className="font-bold text-[#C9A84C] text-sm">Payment verification</p>
                    <p className="text-xs text-gray-500 mt-1">Our team is reviewing your UTR</p>
                  </div>
                  <div className="relative pl-6 opacity-50">
                    <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-1"></div>
                    <p className="font-bold text-gray-600 text-sm">Order confirmed</p>
                  </div>
                  <div className="relative pl-6 opacity-50">
                    <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[9px] top-1"></div>
                    <p className="font-bold text-gray-600 text-sm">Shipped</p>
                  </div>
                </div>

                <div className="mt-8 bg-red-50 p-4 rounded-xl border border-[#6B1D1D]/30">
                  <p className="text-sm text-[#6B1D1D] font-medium mb-3">
                    Our team will verify your payment within 1 hour. You will receive an SMS confirmation on <span className="font-bold">{order.customer_phone}</span> once verified.
                  </p>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Questions? Contact us:</span>
                    <div className="flex items-center gap-4">
                      <a href="tel:+918660087544" className="flex items-center text-sm font-semibold text-[#1a1a2e] hover:text-[#6B1D1D]">
                        <Phone className="w-4 h-4 mr-1" /> Call Us
                      </a>
                      <a href="https://wa.me/918660087544" target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-green-700 hover:text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Tracking Info Box - only show if not pending verification */}
        {!isPendingVerification && (
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
        )}

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
            <span className="font-medium text-gray-600">Total</span>
            <span className="text-2xl font-bold text-[#6B1D1D]">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/products">
            <Button variant="outline" className="h-12 px-8 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-colors">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/profile">
            <Button className="h-12 px-8 bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white">
              View Order Details
            </Button>
          </Link>
          {isPendingVerification && (
            <a href="https://wa.me/918660087544" target="_blank" rel="noreferrer">
              <Button className="h-12 px-8 bg-[#25D366] hover:bg-[#128C7E] text-white">
                WhatsApp Us
              </Button>
            </a>
          )}
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
