"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store";
import { Product } from "@/lib/data/mock-products";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface WishlistButtonProps {
  product: Product;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function WishlistButton({ product, variant = "outline", size = "icon", className, showText = false }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <Button variant={variant} size={size} className={className} disabled>
      <Heart className="h-5 w-5" />
      {showText && <span className="ml-2">Add to Wishlist</span>}
    </Button>
  );

  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (inWishlist) {
      removeFromWishlist(product.id);
      toast("Removed from Wishlist", {
        description: `${product.title} has been removed from your wishlist.`,
      });
      if (user) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      }
    } else {
      addToWishlist(product);
      toast("Added to Wishlist", {
        description: `${product.title} has been added to your wishlist.`,
      });
      if (user) {
        await supabase.from('wishlists').insert({
          user_id: user.id,
          product_id: product.id
        });
      }
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleToggleWishlist}
      className={className}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={`h-5 w-5 ${inWishlist ? "fill-primary text-primary" : ""}`} 
      />
      {showText && <span className="ml-2">{inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}</span>}
    </Button>
  );
}
