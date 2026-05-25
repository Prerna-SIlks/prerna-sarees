"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, ChevronDown, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InvoiceButton from "@/components/InvoiceButton";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
  utr_number?: string;
  created_at: string;
  user_id: string;
  customer_name?: string;
  customer_phone?: string;
  tracking_id?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product_title?: string;
}

const TABS = ["All", "Pending Verification", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  pending_verification: "bg-amber-100 text-amber-800 border border-amber-300",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tracking modal state
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [sendingTracking, setSendingTracking] = useState(false);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    
    if (activeTab !== "All") {
      const dbStatus = activeTab.toLowerCase().replace(" ", "_");
      query = query.eq("status", dbStatus);
    }
    
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const viewOrder = async (order: Order) => {
    const supabase = createClient();
    setSelectedOrder(order);
    const { data } = await supabase
      .from("order_items")
      .select("*, products(title)")
      .eq("order_id", order.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data || []).map((item: any) => ({
      ...item,
      product_title: item.products?.title || "Unknown Product",
    }));
    setOrderItems(items);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const handleConfirmPayment = async (order: Order) => {
    setProcessingPayment(true);
    try {
      const supabase = createClient();
      
      // Update DB
      const { error } = await supabase
        .from("orders")
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq("id", order.id);

      if (error) throw error;

      // Send SMS
      const message = `Great news! Your payment of Rs.${order.total_amount} for Prerna Silks order #${order.id.split('-')[0].toUpperCase()} has been verified successfully! Your order is now confirmed and will be shipped within 1-2 business days. You will receive tracking details via SMS. Thank you for shopping with us! - Prerna Silks, Hubli`;
      
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: order.customer_phone, message })
      });

      toast.success("Payment confirmed and customer notified!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder) return;
    
    const finalReason = rejectReason === 'Other' ? otherReason : rejectReason;
    if (!finalReason) {
      toast.error("Please select or enter a rejection reason");
      return;
    }

    setProcessingPayment(true);
    try {
      const supabase = createClient();
      
      // Update DB
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: 'cancelled', 
          payment_status: 'failed',
          rejection_reason: finalReason 
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Send SMS
      const message = `We could not verify your UPI payment for order #${selectedOrder.id.split('-')[0].toUpperCase()}.\nReason: ${finalReason}\nPlease contact us:\nWhatsApp: +91 8660087544\nCall: +91 8660087544\nWe will help resolve this immediately.\n- Prerna Silks, Hubli`;
      
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedOrder.customer_phone, message })
      });

      toast.success("Payment rejected and customer notified.");
      setRejectModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  const openTrackingModal = (order: Order) => {
    setTrackingOrder(order);
    setTrackingId(order.tracking_id || "");
    setTrackingModalOpen(true);
  };

  const handleSendTracking = async (method: 'sms' | 'whatsapp' | 'both') => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }
    
    if (!trackingOrder?.customer_phone) {
      toast.error("Customer phone number not available for this order");
      return;
    }

    setSendingTracking(true);
    
    try {
      // 1. Update DB
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ 
          tracking_id: trackingId,
          status: 'shipped'
        })
        .eq("id", trackingOrder.id);
        
      if (error) throw error;
      
      const message = `Dear ${trackingOrder.customer_name || 'Customer'},\nGreat news! Your Prerna Silks order #${trackingOrder.id.slice(0,8)} has been shipped!\nTracking ID: ${trackingId}\nTrack here: https://www.indiapost.gov.in/\nExpected delivery: 5-7 business days.\n- Prerna Silks, Hubli +91 8660087544`;

      // 2. Send SMS if requested
      if (method === 'sms' || method === 'both') {
        await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: trackingOrder.customer_phone, 
            message 
          })
        });
      }

      // 3. Open WhatsApp if requested
      if (method === 'whatsapp' || method === 'both') {
        const waMessage = encodeURIComponent(`Dear ${trackingOrder.customer_name || 'Customer'},\nYour Prerna Silks order #${trackingOrder.id.slice(0,8)} has been shipped!\nTracking ID: ${trackingId}\nTrack your order here: https://www.indiapost.gov.in/\n- Prerna Silks Team`);
        window.open(`https://wa.me/91${trackingOrder.customer_phone}?text=${waMessage}`, '_blank');
      }

      toast.success("Tracking ID updated and sent!");
      setTrackingModalOpen(false);
      fetchOrders();
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to update/send tracking ID");
    } finally {
      setSendingTracking(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Orders</h1>
      </div>

      {/* Custom Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[10px] ${
              activeTab === tab 
                ? 'border-[#C9A84C] text-[#C9A84C] bg-white' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No orders found for this status.</div>
      ) : (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount & Payment</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map((order) => {
                  const isPendingUPI = order.status === 'pending_verification';
                  
                  return (
                    <tr 
                      key={order.id} 
                      className={`transition-colors ${isPendingUPI ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {order.id.slice(0, 8)}...
                        {order.tracking_id && (
                          <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Tracking Sent
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {order.customer_name || 'Guest'}
                        <div className="text-xs text-gray-500 font-normal">{order.customer_phone || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1a1a2e] text-base">₹{Number(order.total_amount).toLocaleString("en-IN")}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {order.payment_method === 'cod' ? 'COD' : 'UPI'}
                          </span>
                          {isPendingUPI && order.utr_number && (
                            <span className="text-[10px] font-mono bg-white border border-amber-200 px-1.5 py-0.5 rounded text-amber-700">
                              UTR: {order.utr_number}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isPendingUPI ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 shadow-sm animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" /> Verify Payment
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <button 
                            onClick={() => openTrackingModal(order)}
                            className="px-2 py-1.5 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                            title="Send Tracking ID"
                          >
                            <Send className="h-3 w-3" /> Track
                          </button>
                          
                          <button onClick={() => viewOrder(order)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e] transition-colors border shadow-sm bg-white">
                            <Eye className="h-4 w-4" />
                          </button>

                          {!isPendingUPI && (
                            <div className="relative group">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e] transition-colors">
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                {TABS.filter(t => t !== "All").map((s) => {
                                  const val = s.toLowerCase().replace(" ", "_");
                                  return (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(order.id, val)}
                                    className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-50 ${order.status === val ? "font-semibold text-[#d4a853]" : "text-gray-700"}`}
                                  >
                                    {s}
                                  </button>
                                )})}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOpen && trackingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setTrackingModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-serif font-bold text-[#1a1a2e] mb-2">Send Tracking ID</h2>
            <p className="text-sm text-gray-500 mb-6">Customer: {trackingOrder.customer_name} ({trackingOrder.customer_phone})</p>
            
            <div className="space-y-4 mb-8">
              <label className="block text-sm font-medium text-gray-700">Enter Tracking ID (India Post)</label>
              <Input 
                value={trackingId} 
                onChange={e => setTrackingId(e.target.value)} 
                placeholder="e.g. EM123456789IN"
                className="w-full text-lg uppercase tracking-wider"
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleSendTracking('both')}
                disabled={sendingTracking}
                className="w-full bg-[#1a1a2e] hover:bg-[#1a1a2e]/90 text-white"
              >
                Send Both (SMS & WhatsApp)
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleSendTracking('sms')}
                  disabled={sendingTracking}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Send SMS Only
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSendTracking('whatsapp')}
                  disabled={sendingTracking}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  WhatsApp Only
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail & Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[50] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1a1a2e]">Order Details</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">#{selectedOrder.id.split('-')[0].toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-4">
                <InvoiceButton 
                  order={selectedOrder} 
                  canDownload={
                    selectedOrder.payment_method === 'cod' || 
                    ['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status)
                  } 
                />
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-800 bg-white p-2 rounded-full border shadow-sm transition-colors">
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* Payment Verification Highlight Block */}
              {selectedOrder.status === 'pending_verification' && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-8 shadow-sm">
                  <div className="flex items-center gap-2 text-orange-800 mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Action Required: Verify UPI Payment</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-500 font-bold uppercase mb-1">Amount to Verify</p>
                      <p className="text-2xl font-bold text-[#1a1a2e]">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-100">
                      <p className="text-xs text-orange-500 font-bold uppercase mb-1">Customer UTR Number</p>
                      <p className="text-xl font-mono font-bold text-blue-700 tracking-wider bg-blue-50 px-2 py-1 rounded inline-block">
                        {selectedOrder.utr_number || 'Missing'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => handleConfirmPayment(selectedOrder)}
                      disabled={processingPayment}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg shadow-lg shadow-green-600/20"
                    >
                      ✓ Confirm Payment
                    </Button>
                    <Button 
                      onClick={() => setRejectModalOpen(true)}
                      disabled={processingPayment}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 h-12 text-lg"
                    >
                      ✗ Reject Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* General Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Customer</p>
                  <p className="font-semibold text-gray-900 mt-1">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Payment Method</p>
                  <p className="font-semibold text-gray-900 mt-1 uppercase">{selectedOrder.payment_method}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${STATUS_COLORS[selectedOrder.status] || "bg-gray-200 text-gray-800"}`}>
                    {selectedOrder.status.replace("_", " ")}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Date</p>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{new Date(selectedOrder.created_at).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Items List */}
              <h3 className="font-serif font-semibold text-lg text-[#1a1a2e] mb-3">Order Items</h3>
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No items found for this order.</p>
              ) : (
                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Item</th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-600">Qty</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orderItems.map((item) => (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-3 font-medium text-gray-800">{item.product_title}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.price_at_time).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#1a1a2e]">₹{(Number(item.price_at_time) * item.quantity).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider text-xs">Total Amount</td>
                        <td className="px-4 py-4 text-right font-bold text-xl text-[#6B1D1D]">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-serif font-bold text-red-700 mb-2">Reject Payment</h2>
            <p className="text-sm text-gray-600 mb-6">Select a reason for rejection. This will cancel the order and send an SMS to the customer.</p>
            
            <div className="space-y-3 mb-6">
              {['UTR not found', 'Amount mismatch', 'Duplicate order', 'Other'].map(reason => (
                <label key={reason} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${rejectReason === reason ? 'border-red-500 bg-red-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="rejectReason" 
                    value={reason} 
                    checked={rejectReason === reason} 
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 mr-3"
                  />
                  <span className="font-medium text-gray-800">{reason}</span>
                </label>
              ))}
            </div>

            {rejectReason === 'Other' && (
              <div className="mb-6 animate-in slide-in-from-top-2">
                <Input 
                  placeholder="Enter custom reason..." 
                  value={otherReason}
                  onChange={e => setOtherReason(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleRejectPayment}
                disabled={processingPayment || !rejectReason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Rejection
              </Button>
              <Button 
                onClick={() => setRejectModalOpen(false)}
                disabled={processingPayment}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
