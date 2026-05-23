import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './data/mock-products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          };
        }
        return { items: [...state.items, { product, quantity }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'prerna-sarees-cart',
    }
  )
);

export interface WishlistStore {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  setWishlist: (items: Product[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      addToWishlist: (product) => set((state) => {
        if (!state.wishlistItems.find(p => p.id === product.id)) {
          return { wishlistItems: [...state.wishlistItems, product] };
        }
        return state;
      }),
      removeFromWishlist: (productId) => set((state) => ({
        wishlistItems: state.wishlistItems.filter(p => p.id !== productId)
      })),
      isInWishlist: (productId) => {
        const { wishlistItems } = get();
        return wishlistItems.some(p => p.id === productId);
      },
      getWishlistCount: () => {
        const { wishlistItems } = get();
        return wishlistItems.length;
      },
      setWishlist: (items) => set({ wishlistItems: items }),
    }),
    {
      name: 'prerna-sarees-wishlist',
    }
  )
);
