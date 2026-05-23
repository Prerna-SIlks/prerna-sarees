"use client";
import { Product } from "@/lib/data/mock-products";

import { useWishlistStore, useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMoveToCart = (product: Product) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
    toast("Moved to Cart", {
      description: `${product.title} has been moved to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-lg">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-xl font-medium text-foreground mb-4">Your wishlist is empty.</p>
          <Link href="/products">
            <Button className="h-12 px-8 text-lg">Explore Collection</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <Card key={product.id} className="border-none rounded-none bg-transparent shadow-none">
              <CardContent className="p-0">
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-md bg-muted">
                    <Image 
                      src={product.image_urls[0]} 
                      alt={product.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 mb-4">
                    <h3 className="font-serif font-medium text-lg truncate text-foreground group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-muted-foreground text-sm flex justify-between">
                      <span>{product.fabric}</span>
                      <span className="text-primary font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
                    onClick={() => handleMoveToCart(product)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> Move to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-none border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      removeFromWishlist(product.id);
                      toast("Removed from Wishlist", {
                        description: `${product.title} has been removed.`,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
