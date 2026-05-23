"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { Product } from "@/lib/data/mock-products";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function AddToCartButton({ product, className }: { product: Product, className?: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    addItem(product, 1);
    toast("Added to Cart", {
      description: `${product.title} has been added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => document.getElementById("cart-trigger")?.click(),
      },
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Find existing cart item to get current quantity
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();
        
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });
      }
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button 
      size="lg" 
      onClick={handleAddToCart}
      className={className || "flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg rounded-none shadow-xl shadow-primary/20"}
    >
      <ShoppingBag className="mr-2 h-5 w-5" /> 
      {added ? "Added to Cart" : "Add to Cart"}
    </Button>
  );
}
