"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Package, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InvoiceButton from "@/components/InvoiceButton";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product_title?: string;
  product_image?: string;
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login?returnUrl=/profile";
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    
    setExpandedOrder(orderId);
    
    if (!orderItems[orderId]) {
      const { data, error } = await supabase
        .from("order_items")
        .select("*, products(title, image_urls)")
        .eq("order_id", orderId);
        
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = data.map((item: any) => ({
          ...item,
          product_title: item.products?.title,
          product_image: item.products?.image_urls?.[0]
        }));
        
        setOrderItems(prev => ({ ...prev, [orderId]: items }));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 mr-1.5" />;
      case 'cancelled': return <XCircle className="h-4 w-4 mr-1.5" />;
      default: return <Clock className="h-4 w-4 mr-1.5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FDF8F0]">
        <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin mb-4" />
        <p className="text-[#1A0A0A]/60 font-medium tracking-widest uppercase text-xs">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#6B1D1D] mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-[#C9A84C]/20 overflow-hidden">
          <div className="bg-[#1A0A0A] px-8 py-10 text-center">
            <h1 className="text-3xl font-serif text-[#F5E6C8] tracking-widest uppercase mb-2">My Account</h1>
            <p className="text-[#C9A84C] text-sm">View your order history and account details</p>
          </div>
          
          <div className="p-8">
            <h2 className="text-xl font-serif font-bold text-[#1A0A0A] mb-6 flex items-center">
              <Package className="h-5 w-5 mr-3 text-[#C9A84C]" /> Order History
            </h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6 font-medium">You haven&apos;t placed any orders yet.</p>
                <Link href="/products" className="inline-block bg-[#6B1D1D] text-[#F5E6C8] px-8 py-3 font-bold tracking-widest uppercase text-sm hover:bg-[#1A0A0A] transition-colors rounded-sm">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#C9A84C]/50">
                    {/* Order Header */}
                    <div 
                      className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between cursor-pointer"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div className="flex gap-8 items-center w-full md:w-auto mb-4 md:mb-0">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                          <p className="text-sm font-semibold text-[#1A0A0A]">
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric"
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                          <p className="text-sm font-semibold text-[#1A0A0A]">₹{order.total_amount.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order #</p>
                          <p className="text-sm font-mono text-gray-600">{order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        <span className="text-xs text-[#C9A84C] font-semibold uppercase tracking-widest hover:text-[#6B1D1D] transition-colors">
                          {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Order Details (Expanded) */}
                    {expandedOrder === order.id && (
                      <div className="p-6 border-t border-gray-100 bg-white">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">Items in your order</h4>
                        
                        {!orderItems[order.id] ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-5 w-5 text-[#C9A84C] animate-spin" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {orderItems[order.id].map((item) => (
                              <div key={item.id} className="flex gap-4 items-center">
                                <div className="relative h-20 w-16 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                                  {item.product_image ? (
                                    <Image src={item.product_image} alt={item.product_title || 'Product'} fill className="object-cover" />
                                  ) : (
                                    <Package className="h-6 w-6 m-auto text-gray-300 absolute inset-0" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Link href={`/products`} className="text-[#1A0A0A] font-serif font-medium hover:text-[#6B1D1D] transition-colors">
                                    {item.product_title || "Unknown Product"}
                                  </Link>
                                  <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                    <span>Qty: {item.quantity}</span>
                                    <span>₹{item.price_at_time.toLocaleString("en-IN")} each</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-6 flex justify-end">
                          <InvoiceButton 
                            order={order} 
                            canDownload={
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (order as any).payment_method === 'cod' || 
                              ['confirmed', 'shipped', 'delivered'].includes(order.status)
                            } 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
