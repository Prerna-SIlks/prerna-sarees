"use client";

import { useCartStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, QrCode, Copy, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    saveAddress: false
  });
  
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  // UPI QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [upiOrderId, setUpiOrderId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Auto-fill user email if logged in
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAddress(prev => ({ ...prev, email: user.email || "" }));
      } else {
        toast.error("Please login to proceed with checkout.");
        router.push("/login?returnUrl=/checkout");
      }
    };
    fetchUser();
  }, [router, supabase.auth]);

  // Handle QR Timer
  useEffect(() => {
    if (showQRModal) {
      setTimeLeft(600);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setShowQRModal(false);
            toast.error("Payment session expired. Please try again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showQRModal]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-4">Checkout</h1>
        <p className="text-gray-600 mb-8">Your cart is empty.</p>
        <Link href="/products">
          <Button variant="outline" className="h-12 px-8 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-colors">
            Return to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setAddress(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    if (!address.firstName || !address.street || !address.city || !address.state) {
      toast.error("Please fill all required fields.");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return false;
    }
    return true;
  };

  const handlePlaceOrderClick = () => {
    if (!validateForm()) return;

    if (paymentMethod === 'upi') {
      const newOrderId = crypto.randomUUID();
      setUpiOrderId(newOrderId);
      setShowQRModal(true);
    } else {
      // Proceed directly to checkout API for COD
      submitOrder(crypto.randomUUID(), "");
    }
  };

  const submitOrder = async (orderId: string, utr: string) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to place an order.");
        router.push("/login?returnUrl=/checkout");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast.error("Session expired. Please login again.");
        router.push("/login?returnUrl=/checkout");
        return;
      }

      // Create order in DB via backend route
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          orderId,
          items, 
          totalAmount: total,
          address,
          paymentMethod,
          utrNumber: utr
        })
      });
      
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "Checkout failed");
      
      clearCart();
      setShowQRModal(false);
      
      if (paymentMethod === 'cod') {
        toast.success("Order placed successfully!");
      } else {
        toast.success("Payment submitted for verification!");
      }
      
      router.push('/order-success?id=' + orderId);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleUPIConfirm = () => {
    if (utrNumber.trim().length < 10) {
      toast.error("Please enter a valid UTR / Transaction ID (minimum 10 characters).");
      return;
    }
    submitOrder(upiOrderId, utrNumber);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "";
  const upiString = `upi://pay?pa=${upiId}&pn=Prerna Silks&am=${total}&cu=INR&tn=Order ${upiOrderId.split('-')[0]}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-12 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <Link href="/cart" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#6B1D1D] mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
        </Link>
        
        <h1 className="text-3xl font-serif font-bold text-[#1a1a2e] tracking-tight mb-8">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Form */}
          <div className="flex-1 space-y-10">
            
            {/* STEP 1: Delivery Details */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#C9A84C]/20">
              <h2 className="text-xl font-serif font-semibold text-[#1a1a2e] mb-2">STEP 1 - Delivery Details</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your contact and shipping information.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="firstName">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" required value={address.firstName} onChange={handleInputChange} className="h-12" placeholder="First Name" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="phone" type="tel" name="phone" maxLength={10} required value={address.phone} onChange={handleInputChange} className="h-12" placeholder="10-digit mobile number" />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" name="email" value={address.email} onChange={handleInputChange} className="h-12 bg-gray-50 text-gray-500" readOnly />
                </div>
                <div className="space-y-2 md:col-span-2 mt-4">
                  <Label htmlFor="street">Address Line 1 <span className="text-red-500">*</span></Label>
                  <Input id="street" name="street" required value={address.street} onChange={handleInputChange} className="h-12" placeholder="House number, building, street, etc." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input id="addressLine2" name="addressLine2" value={address.addressLine2} onChange={handleInputChange} className="h-12" placeholder="Locality, landmark, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input id="city" name="city" required value={address.city} onChange={handleInputChange} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                  <select 
                    id="state" 
                    name="state" 
                    required 
                    value={address.state} 
                    onChange={handleInputChange}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code <span className="text-red-500">*</span></Label>
                  <Input id="pincode" name="pincode" maxLength={6} required value={address.pincode} onChange={handleInputChange} className="h-12" />
                </div>
                
                <div className="space-y-2 md:col-span-2 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="saveAddress" 
                      checked={address.saveAddress} 
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-[#6B1D1D] focus:ring-[#6B1D1D]" 
                    />
                    <span className="text-sm font-medium text-gray-700">Save this address for future orders</span>
                  </label>
                </div>
              </div>
            </section>

            {/* STEP 2: Payment Selection */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#C9A84C]/20">
              <h2 className="text-xl font-serif font-semibold text-[#1a1a2e] mb-2">STEP 2 - Payment Selection</h2>
              <p className="text-sm text-gray-500 mb-6">Choose how you want to pay.</p>
              
              <div className="space-y-4">
                
                {/* Option 1 - UPI PAYMENT */}
                <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'upi' ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-md' : 'border-gray-200 hover:border-[#C9A84C]/50'}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="mt-1 mr-4 h-5 w-5 text-[#6B1D1D] focus:ring-[#C9A84C]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="h-5 w-5 text-[#6B1D1D]" />
                      <span className="block font-bold text-lg text-[#1a1a2e]">Pay via UPI</span>
                    </div>
                    <span className="text-sm text-gray-600 block mb-3">Scan QR code and pay instantly</span>
                    <div className="flex gap-2 opacity-80">
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 border">GPay</div>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 border">PhonePe</div>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 border">Paytm</div>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700 border">Any UPI App</div>
                    </div>
                  </div>
                </label>

                {/* Option 2 - CASH ON DELIVERY */}
                <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'cod' ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-md' : 'border-gray-200 hover:border-[#C9A84C]/50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 mr-4 h-5 w-5 text-[#6B1D1D] focus:ring-[#C9A84C]" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="block font-bold text-lg text-[#1a1a2e]">Cash on Delivery</span>
                      <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-green-200">No extra charges</span>
                    </div>
                    <span className="text-sm text-gray-600">Pay when your order arrives at your doorstep</span>
                  </div>
                </label>
                
              </div>
            </section>
            
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-[#C9A84C]/30 sticky top-28">
              <h2 className="text-xl font-serif font-bold text-[#1a1a2e] border-b pb-4 mb-6">Order Summary</h2>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-gray-200">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4 group">
                    <div className="relative h-20 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100">
                      <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-sm font-medium text-[#1a1a2e] line-clamp-2 leading-tight">{product.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1a1a2e] py-1">₹{(product.price * quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-[#1a1a2e]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Free above ₹2000</span>
                  ) : (
                    <span className="font-medium text-[#1a1a2e]">₹{shipping}</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-dashed border-gray-300">
                <span className="text-lg font-bold text-[#1a1a2e]">Total Amount</span>
                <span className="text-3xl font-bold text-[#6B1D1D]">₹{total.toLocaleString("en-IN")}</span>
              </div>
              
              <Button 
                onClick={handlePlaceOrderClick}
                disabled={isLoading}
                className="w-full h-14 mt-8 text-lg font-bold tracking-wide bg-gradient-to-r from-[#6B1D1D] to-[#8a2525] hover:from-[#5a1818] hover:to-[#6B1D1D] text-[#F5E6C8] shadow-xl shadow-[#6B1D1D]/20 transition-all rounded-xl"
              >
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Place Order"}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* QR Code Modal for UPI Payment */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#6B1D1D] p-4 text-center">
              <h2 className="text-xl font-serif font-bold text-[#F5E6C8]">Complete Your Payment</h2>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col items-center">
              <div className="mb-2 text-center">
                <span className="text-4xl font-bold text-[#6B1D1D]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-6 flex items-center gap-2 border border-red-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                QR code valid for {formatTime(timeLeft)} minutes
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm mb-6">
                <QRCodeSVG 
                  value={upiString} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* UPI ID Display */}
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mb-8 w-full justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium uppercase">UPI ID</span>
                  <span className="font-mono text-sm font-semibold text-gray-800">{upiId}</span>
                </div>
                <button 
                  onClick={copyUpiId} 
                  className="text-[#6B1D1D] hover:bg-red-50 p-2 rounded-md transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Instructions */}
              <div className="w-full space-y-2 mb-6">
                <p className="text-sm font-bold text-gray-800">How to pay?</p>
                <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside pl-1 marker:text-[#C9A84C] marker:font-bold">
                  <li>Open any UPI app (GPay, PhonePe, Paytm)</li>
                  <li>Scan the QR code above</li>
                  <li>Pay <span className="font-bold">₹{total}</span></li>
                  <li>Enter your transaction ID below</li>
                </ol>
              </div>

              {/* UTR Input */}
              <div className="w-full space-y-2 mb-8">
                <Label htmlFor="utr" className="text-sm font-bold text-[#1a1a2e]">Enter UTR / Transaction ID <span className="text-red-500">*</span></Label>
                <Input 
                  id="utr" 
                  value={utrNumber} 
                  onChange={(e) => setUtrNumber(e.target.value)} 
                  placeholder="12 digit transaction number" 
                  className="h-12 border-gray-300 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <p className="text-xs text-gray-500">Find this in your UPI app after successful payment.</p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <Button 
                  onClick={handleUPIConfirm} 
                  disabled={isLoading}
                  className="w-full h-12 bg-[#C9A84C] hover:bg-[#b89741] text-[#1a1a2e] font-bold text-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  I have paid →
                </Button>
                <Button 
                  onClick={() => {
                    setShowQRModal(false);
                    setUpiOrderId("");
                    setUtrNumber("");
                  }} 
                  variant="ghost" 
                  className="w-full h-10 text-gray-500 hover:text-red-600"
                  disabled={isLoading}
                >
                  Cancel Payment
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
