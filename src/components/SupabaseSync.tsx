"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, useWishlistStore } from "@/lib/store";

export function SupabaseSync() {
  const supabase = createClient();

  useEffect(() => {
    const syncData = async (userId: string) => {
      // Fetch cart items
      const { data: cartData } = await supabase
        .from('cart_items')
        .select('quantity, products(*, categories(slug))')
        .eq('user_id', userId);
        
      if (cartData) {
        // Map and replace cart store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = cartData.map((item: any) => ({
          quantity: item.quantity,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          product: { ...(item.products as any), category: (item.products as any).categories.slug }
        }));
        useCartStore.setState({ items });
      }

      // Fetch wishlist items
      const { data: wishlistData } = await supabase
        .from('wishlist_items')
        .select('products(*, categories(slug))')
        .eq('user_id', userId);

      if (wishlistData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = wishlistData.map((item: any) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(item.products as any), category: (item.products as any).categories.slug
        }));
        useWishlistStore.setState({ wishlistItems: items });
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await syncData(session.user.id);
        } else {
          // User logged out, clear stores
          useCartStore.setState({ items: [] });
          useWishlistStore.setState({ wishlistItems: [] });
        }
      }
    );

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        syncData(user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
