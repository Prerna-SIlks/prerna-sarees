"use client";

import { useWishlistStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeaderWishlistIcon() {
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? wishlistItems.length : 0;

  return (
    <Link href="/wishlist">
      <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
        <Heart className="h-5 w-5" />
        <span className="sr-only">Wishlist</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    </Link>
  );
}
