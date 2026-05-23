"use client";

import { useState, useEffect } from "react";
import { Zap, Minus, Plus, Heart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Product } from "@/lib/data/mock-products";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch session on mount to check if user is admin
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'prernasilks@gmail.com') {
        setIsAdmin(true);
      }
    };
    checkUser();
  }, []);

  const handleAction = async (isBuyNow = false) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      if (isBuyNow) {
        toast("Login Required", { description: "Please login to continue your purchase." });
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      } else {
        toast("Login Required", { description: "Please login to add items to cart." });
        setTimeout(() => {
          router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        }, 1500);
        return;
      }
    }

    // Add to cart state
    addItem(product, quantity);

    // Add to DB
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();
      
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity: quantity
      });
    }

    if (isBuyNow) {
      router.push("/checkout");
    } else {
      toast("Added to Cart", {
        description: `${quantity} x ${product.title} has been added.`,
        action: {
          label: "View Cart",
          onClick: () => document.getElementById("cart-trigger")?.click(),
        },
      });
    }
  };

  return (
    <div className="flex flex-col mb-8">
      {/* Quantity Selector */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="w-10 h-10 flex items-center justify-center border border-[#E5E0D8] hover:border-[#C9A84C] transition-colors"
        >
          <Minus className="w-4 h-4 text-[#1A0A0A]" />
        </button>
        <div className="w-[60px] h-10 flex items-center justify-center border-t border-b border-[#E5E0D8] text-[#1A0A0A] font-medium font-sans">
          {quantity}
        </div>
        <button 
          onClick={() => setQuantity(q => q + 1)}
          className="w-10 h-10 flex items-center justify-center border border-[#E5E0D8] hover:border-[#C9A84C] transition-colors"
        >
          <Plus className="w-4 h-4 text-[#1A0A0A]" />
        </button>
      </div>

      {/* Buttons */}
      {isAdmin ? (
        <div className="w-full bg-red-50 text-red-800 border border-red-200 p-4 text-center font-medium text-sm rounded-md">
          Admin accounts cannot place orders
        </div>
      ) : (
        <div className="flex flex-row gap-[8px] w-full">
          <button 
            onClick={() => handleAction(false)}
            className="w-[55%] h-[52px] bg-transparent border-[2px] border-[#C9A84C] text-[#C9A84C] uppercase tracking-[0.1em] text-[14px] font-sans font-medium flex items-center justify-center gap-2 hover:bg-[#C9A84C] hover:text-[#1A0A0A] transition-all duration-300"
          >
            <Heart className="w-5 h-5" />
            Add to Bag
          </button>
          
          <button 
            onClick={() => handleAction(true)}
            className="w-[45%] h-[52px] bg-[#6B1D1D] text-white uppercase tracking-[0.1em] text-[14px] font-sans font-medium flex items-center justify-center gap-2 hover:bg-[#4A1212] transition-all duration-300"
          >
            <Zap className="w-5 h-5 fill-current" />
            Buy Now
          </button>
        </div>
      )}

      {/* Trust Badges below buttons */}
      <div className="mt-4 text-center">
        <p className="text-[#888888] text-xs tracking-wide">
          Authentic Handpicked · Free Shipping · Easy Returns
        </p>
      </div>
    </div>
  );
}
