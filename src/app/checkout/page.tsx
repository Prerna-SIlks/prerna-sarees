"use client";

import { useCartStore } from "@/lib/store";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

// Load Razorpay script dynamically and wait for it
const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

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

  const sendSMS = async (phone: string, message: string) => {
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
    } catch (e) {
      console.error("Failed to send SMS", e);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to place an order.");
        router.push("/login?returnUrl=/checkout");
        return;
      }

      // Get the access token for the API call
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        toast.error("Session expired. Please login again.");
        router.push("/login?returnUrl=/checkout");
        return;
      }

      // Step 1: Create order in DB (Pending for Razorpay, Received for COD)
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          items, 
          totalAmount: total,
          address,
          paymentMethod
        })
      });
      
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "Checkout failed");
      
      const ourOrderId = checkoutData.orderId;
      const customerName = `${address.firstName} ${address.lastName}`.trim();
      const productNames = items.map(i => i.product.title).join(", ");
      
      const customerMessage = `Dear ${customerName}, Your order #${ourOrderId.slice(0,8)} has been placed successfully with Prerna Silks! Total: Rs.${total}. Payment: ${paymentMethod.toUpperCase()}. You will receive your tracking ID within 1 hour on this number. Thank you for shopping with us! - Prerna Silks, Hubli`;
      
      const adminMessage = `NEW ORDER ALERT!\nOrder #${ourOrderId.slice(0,8)}\nCustomer: ${customerName}\nPhone: ${address.phone}\nAmount: Rs.${total}\nPayment: ${paymentMethod.toUpperCase()}\nItems: ${productNames}\nAddress: ${address.street}, ${address.city}`;

      if (paymentMethod === 'cod') {
        // Clear cart
        clearCart();
        
        // Send SMS notifications
        await Promise.all([
          sendSMS(address.phone, customerMessage),
          sendSMS('8660087544', adminMessage)
        ]);
        
        toast.success("Order placed successfully!");
        router.push('/order-success?id=' + ourOrderId);
      } else if (paymentMethod === 'razorpay') {
        // Step 2: Load Razorpay script first
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error('Payment gateway failed to load. Please try again.');
          setIsLoading(false);
          return;
        }

        // Step 3: Create Razorpay Order
        const rzpayRes = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, orderId: ourOrderId })
        });
        
        const rzpayData = await rzpayRes.json();
        console.log('Razorpay order created:', rzpayData);
        
        if (!rzpayData.success) {
          toast.error('Payment failed: ' + rzpayData.error);
          setIsLoading(false);
          return;
        }
        
        // Step 4: Open Razorpay Modal
        const options = {
          key: rzpayData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzpayData.amount,
          currency: rzpayData.currency,
          name: 'Prerna Silks',
          description: 'Saree Purchase',
          order_id: rzpayData.razorpayOrderId,
          prefill: {
            name: customerName,
            email: address.email,
            contact: address.phone
          },
          theme: { color: '#6B1D1D' },
          handler: async function (response: Record<string, string>) {
            try {
              console.log('Payment success:', response);
              // Verify payment
              const verifyRes = await fetch('/api/verify-razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: ourOrderId
                })
              });
              const verifyData = await verifyRes.json();
              console.log('Verify result:', verifyData);
              
              if (verifyData.success) {
                clearCart();
                
                // Send SMS
                await Promise.all([
                  sendSMS(address.phone, customerMessage),
                  sendSMS('8660087544', adminMessage)
                ]);
                
                toast.success("Payment successful!");
                router.push('/order-success?id=' + ourOrderId);
              } else {
                toast.error("Payment verification failed");
                setIsLoading(false);
              }
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Payment verification failed";
              toast.error(msg);
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: function() {
              setIsLoading(false);
              toast.error("Payment cancelled");
            }
          }
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response);
          toast.error('Payment failed: ' + response.error.description);
          setIsLoading(false);
        });
        rzp.open();
        
      }
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-12">
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
                <div className="space-y-2 md:col-span-2 hidden">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={address.lastName} onChange={handleInputChange} className="h-12" />
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
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                
                {/* Option A - RAZORPAY */}
                <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'razorpay' ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-md' : 'border-gray-200 hover:border-[#C9A84C]/50'}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mt-1 mr-4 h-5 w-5 text-[#6B1D1D] focus:ring-[#C9A84C]" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="block font-bold text-lg text-[#1a1a2e]">Pay Online</span>
                      <div className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">RAZORPAY</div>
                    </div>
                    <span className="text-sm text-gray-600 block mb-2">Pay securely via UPI, Cards, Netbanking, Wallets</span>
                    {/* Fake Razorpay Logos inline */}
                    <div className="flex gap-2 opacity-80">
                      <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">UPI</div>
                      <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                      <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">MC</div>
                    </div>
                  </div>
                </label>

                {/* Option B - CASH ON DELIVERY */}
                <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'cod' ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-md' : 'border-gray-200 hover:border-[#C9A84C]/50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 mr-4 h-5 w-5 text-[#6B1D1D] focus:ring-[#C9A84C]" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="block font-bold text-lg text-[#1a1a2e]">Cash on Delivery</span>
                      <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">No extra charges</span>
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
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full h-14 mt-8 text-lg font-bold tracking-wide bg-gradient-to-r from-[#6B1D1D] to-[#8a2525] hover:from-[#5a1818] hover:to-[#6B1D1D] text-[#F5E6C8] shadow-xl shadow-[#6B1D1D]/20 transition-all rounded-xl"
              >
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Place Order Securely"}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Encrypted Checkout
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
