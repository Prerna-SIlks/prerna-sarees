"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Menu, LogOut, ShoppingBag, UserCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "./CartSheet";
import { SearchDialog } from "./SearchDialog";
import { HeaderWishlistIcon } from "./HeaderWishlistIcon";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/lib/store";
import { Product } from "@/lib/data/mock-products";

interface AuthUser {
  email: string;
  initial: string;
}

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const setWishlist = useWishlistStore(state => state.setWishlist);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const email = authUser.email || "";
        const name = authUser.user_metadata?.first_name || email.split("@")[0];
        setUser({ email, initial: (name[0] || email[0]).toUpperCase() });
        
        // Fetch wishlist items from Supabase
        const { data: wlData } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', authUser.id);
          
        if (wlData && wlData.length > 0) {
          const productIds = wlData.map(item => item.product_id);
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
            
          if (productsData) {
            setWishlist(productsData as Product[]);
          }
        }
      } else {
        setUser(null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || "";
        const name = session.user.user_metadata?.first_name || email.split("@")[0];
        setUser({ email, initial: (name[0] || email[0]).toUpperCase() });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const fabrics = [
    ["Silk", "Banarasi", "Kanjivaram", "Chanderi", "Georgette"],
    ["Cotton", "Linen", "Net", "Organza", "Chiffon"]
  ];

  const occasions = ["Bridal", "Festive", "Casual", "Party", "Office", "Wedding Guest", "Gift"];

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#FDF8F0] shadow-lg py-2"
      style={{ willChange: 'transform' }}
    >
      <div className="container mx-auto px-4 md:px-8">
        
        {/* ROW 1: Top Bar (Currency | Logo | Icons) */}
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Currency & Wishlist */}
          <div className="flex-1 flex items-center gap-4">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" className="px-0 md:hidden hover:bg-transparent">
                    <Menu className="h-6 w-6 text-[#1A0A0A]" />
                  </Button>
                }
              />
              <SheetContent side="left" className="pr-0 bg-[#FDF8F0]">
                <MobileNav user={user} onLogout={handleLogout} fabrics={fabrics} occasions={occasions} />
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-4 text-xs font-medium tracking-widest text-[#1A0A0A] uppercase">
              <span>INR | ENG</span>
              <div className="h-3 w-px bg-[#C9A84C]/40" />
              <HeaderWishlistIcon />
            </div>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="font-serif font-bold text-[#6B1D1D] tracking-[0.15em] uppercase text-3xl">
              Prerna Silks
            </span>
            <span className="font-serif italic text-[#C9A84C] text-[10px] tracking-widest mt-1">
              Weaving Elegance Since Generations
            </span>
          </Link>

          {/* Right: Search, Account, Cart */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-3">
            <SearchDialog />

            {/* Auth Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-8 w-8 rounded-full bg-[#6B1D1D] text-[#F5E6C8] flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-[#C9A84C]/50 transition-all"
                >
                  {user.initial}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-[#FDF8F0] border border-[#C9A84C]/30 rounded shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-[#C9A84C]/20 mb-1">
                      <p className="text-xs text-[#1A0A0A]/70 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#1A0A0A] hover:bg-[#C9A84C]/10 transition-colors">
                      <UserCircle className="h-4 w-4 text-[#C9A84C]" /> My Profile
                    </Link>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#1A0A0A] hover:bg-[#C9A84C]/10 transition-colors">
                      <ShoppingBag className="h-4 w-4 text-[#C9A84C]" /> My Orders
                    </Link>
                    <div className="border-t border-[#C9A84C]/20 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#6B1D1D] hover:bg-[#6B1D1D]/5 transition-colors w-full">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="hover:bg-[#C9A84C]/10 text-[#1A0A0A]">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {user?.email !== 'prernasilks@gmail.com' && <CartSheet />}
          </div>
        </div>

        {/* ROW 2: Mega Menu Navigation (Desktop Only) */}
        <div 
          className="hidden md:flex items-center justify-center gap-10 text-[13px] font-semibold tracking-widest uppercase border-t border-[#C9A84C]/20 h-14"
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          {/* Fabric Dropdown */}
          <div className="h-full flex items-center group/nav" onMouseEnter={() => setActiveMegaMenu('fabric')}>
            <span className="flex items-center gap-1 cursor-pointer text-[#1A0A0A] hover:text-[#6B1D1D] transition-colors">
              Fabric <ChevronDown className="h-3 w-3" />
            </span>
            
            {activeMegaMenu === 'fabric' && (
              <div className="absolute top-full left-0 w-full bg-[#FDF8F0] border-t border-[#C9A84C]/30 shadow-2xl animate-in fade-in slide-in-from-top-1 z-40">
                <div className="container mx-auto px-8 py-10 flex">
                  <div className="flex-1 flex gap-16">
                    <div>
                      <h4 className="font-serif italic text-lg text-[#C9A84C] mb-6 capitalize">Heritage Silks</h4>
                      <ul className="space-y-4">
                        {fabrics[0].map(f => (
                          <li key={f}><Link href={`/products?fabric=${f.toLowerCase()}`} className="text-sm font-medium text-[#1A0A0A] hover:text-[#6B1D1D] hover:underline underline-offset-4">{f}</Link></li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif italic text-lg text-[#C9A84C] mb-6 capitalize">Everyday Elegance</h4>
                      <ul className="space-y-4">
                        {fabrics[1].map(f => (
                          <li key={f}><Link href={`/products?fabric=${f.toLowerCase()}`} className="text-sm font-medium text-[#1A0A0A] hover:text-[#6B1D1D] hover:underline underline-offset-4">{f}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="w-1/3 relative h-64 rounded-sm overflow-hidden bg-[#1A0A0A]">
                    <Image src="/images/products/saree-2.jpg" alt="Fabric" fill className="object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <h3 className="font-serif text-3xl text-[#F5E6C8] uppercase tracking-widest drop-shadow-lg">The Silk<br/>Edit</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Occasion Dropdown */}
          <div className="h-full flex items-center group/nav" onMouseEnter={() => setActiveMegaMenu('occasion')}>
            <span className="flex items-center gap-1 cursor-pointer text-[#1A0A0A] hover:text-[#6B1D1D] transition-colors">
              Occasion <ChevronDown className="h-3 w-3" />
            </span>
            
            {activeMegaMenu === 'occasion' && (
              <div className="absolute top-full left-0 w-full bg-[#FDF8F0] border-t border-[#C9A84C]/30 shadow-2xl animate-in fade-in slide-in-from-top-1 z-40">
                <div className="container mx-auto px-8 py-10 flex">
                  <div className="flex-1 grid grid-cols-2 gap-x-16 gap-y-4">
                    {occasions.map(occ => (
                      <Link key={occ} href={`/products?occasion=${occ.toLowerCase()}`} className="text-sm font-medium text-[#1A0A0A] hover:text-[#6B1D1D] hover:underline underline-offset-4 block py-1">
                        {occ}
                      </Link>
                    ))}
                  </div>
                  <div className="w-1/3 relative h-64 rounded-sm overflow-hidden bg-[#6B1D1D]">
                    <Image src="/images/occasions/bridal.png" alt="Bridal" fill className="object-cover opacity-70" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center border-4 border-[#C9A84C]/30 m-4">
                      <h3 className="font-serif text-3xl text-[#F5E6C8] uppercase tracking-widest drop-shadow-lg">Bridal<br/>Grandeur</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/products?sort=newest" className="text-[#1A0A0A] hover:text-[#6B1D1D] transition-colors" onMouseEnter={() => setActiveMegaMenu(null)}>
            New Arrivals
          </Link>
          <Link href="/products?sort=bestselling" className="text-[#1A0A0A] hover:text-[#6B1D1D] transition-colors" onMouseEnter={() => setActiveMegaMenu(null)}>
            Best Sellers
          </Link>
          <Link href="/products?sale=true" className="text-[#6B1D1D] flex items-center gap-1 hover:text-[#6B1D1D]/80 transition-colors" onMouseEnter={() => setActiveMegaMenu(null)}>
            Sale <span className="bg-[#6B1D1D] text-[#F5E6C8] text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">UPTO 50%</span>
          </Link>
        </div>

      </div>
    </header>
  );
}

function MobileNav({ user, onLogout, fabrics, occasions }: { user: AuthUser | null; onLogout: () => void; fabrics: string[][]; occasions: string[] }) {
  return (
    <div className="flex flex-col h-full bg-[#FDF8F0]">
      <div className="p-6 border-b border-[#C9A84C]/20">
        <Link href="/" className="flex flex-col items-start">
          <span className="text-2xl font-bold font-serif text-[#6B1D1D] tracking-[0.15em] uppercase">Prerna Silks</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h4 className="font-serif italic text-lg text-[#C9A84C] mb-4">Shop By Fabric</h4>
          <div className="grid grid-cols-2 gap-3">
            {[...fabrics[0], ...fabrics[1]].map(f => (
              <Link key={f} href={`/products?fabric=${f.toLowerCase()}`} className="text-sm font-medium text-[#1A0A0A] hover:text-[#6B1D1D]">{f}</Link>
            ))}
          </div>
        </div>
        
        <div className="border-t border-[#C9A84C]/20 pt-6">
          <h4 className="font-serif italic text-lg text-[#C9A84C] mb-4">Shop By Occasion</h4>
          <div className="grid grid-cols-2 gap-3">
            {occasions.map(occ => (
              <Link key={occ} href={`/products?occasion=${occ.toLowerCase()}`} className="text-sm font-medium text-[#1A0A0A] hover:text-[#6B1D1D]">{occ}</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#C9A84C]/20 pt-6 flex flex-col gap-4">
          <Link href="/products?sort=newest" className="text-sm font-bold tracking-widest uppercase text-[#1A0A0A]">New Arrivals</Link>
          <Link href="/products?sort=bestselling" className="text-sm font-bold tracking-widest uppercase text-[#1A0A0A]">Best Sellers</Link>
          <Link href="/products?sale=true" className="text-sm font-bold tracking-widest uppercase text-[#6B1D1D]">Sale</Link>
        </div>
      </div>

      <div className="p-6 border-t border-[#C9A84C]/20 bg-white">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#6B1D1D] text-[#F5E6C8] flex items-center justify-center text-sm font-bold">
                {user.initial}
              </div>
              <span className="text-sm text-[#1A0A0A] font-medium truncate">{user.email}</span>
            </div>
            <Link href="/profile" className="block text-sm font-bold tracking-widest uppercase text-[#1A0A0A] mb-3">My Account</Link>
            <button onClick={onLogout} className="text-sm font-bold tracking-widest uppercase text-red-600">Logout</button>
          </>
        ) : (
          <Link href="/login" className="block text-center w-full bg-[#6B1D1D] text-[#F5E6C8] py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#6B1D1D]/90">
            Login / Register
          </Link>
        )}
      </div>
    </div>
  );
}
