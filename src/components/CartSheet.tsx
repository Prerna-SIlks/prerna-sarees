"use client";

import { useCartStore } from "@/lib/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const { items, removeItem, updateQuantity, getCartTotal, getCartCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = getCartCount();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle className="font-serif text-xl text-primary">Your Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 px-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-lg font-medium text-foreground">Your cart is empty.</p>
              <SheetTrigger render={
                <Link href="/products" className="text-primary hover:underline">
                  Continue Shopping
                </Link>
              } />
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 pr-6">
                <div className="space-y-6 pt-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-4">
                      <div className="relative aspect-square h-20 w-20 min-w-fit overflow-hidden rounded-md border border-border">
                        <Image
                          src={product.image_urls[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-foreground">{product.title}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 rounded-md border border-border p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-4 text-center text-sm">{quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-medium text-primary">
                            ₹{(product.price * quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="pr-6 pt-4">
                <Separator className="mb-4" />
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-foreground">Subtotal</span>
                  <span className="font-bold text-primary">₹{getCartTotal().toLocaleString("en-IN")}</span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full h-12 text-lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
