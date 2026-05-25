import { HeroSlide, HeroSlider } from "@/components/HeroSlider";
import { Product } from "@/lib/data/mock-products";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/WishlistButton";
import { ShoppingCart, Camera } from "lucide-react";

import { createAnonClient as createClient } from "@/lib/supabase/server";

const DEFAULT_CATEGORIES = [
  { name: "Silk Sarees", image: "/images/products/saree-2.jpg", link: "/products?category=silk-sarees" },
  { name: "Banarasi Sarees", image: "/images/products/saree-3.jpg", link: "/products?category=banarasi-sarees" },
  { name: "Cotton Sarees", image: "/images/products/saree-4.jpg", link: "/products?category=cotton-sarees" },
  { name: "Designer Sarees", image: "/images/products/saree-5.jpg", link: "/products?category=designer-sarees" },
  { name: "Bridal Sarees", image: "/images/products/saree-6.jpg", link: "/products?category=bridal-sarees" },
  { name: "Casual Wear", image: "/images/products/saree-7.jpg", link: "/products?category=casual-wear" },
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  // Fetch featured products (prefer is_featured = true, fallback to first 8)
  let featuredProducts: Product[] = [];
  const { data: featuredData } = await supabase
    .from("products")
    .select("*, categories!inner(slug)")
    .eq("is_featured", true)
    .order("featured_sort_order", { ascending: true, nullsFirst: false })
    .limit(8);

  if (featuredData && featuredData.length > 0) {
    featuredProducts = featuredData.map((p: unknown) => {
      const product = p as Record<string, unknown>;
      const categoryObj = product.categories as { slug: string };
      return { ...product, category: categoryObj.slug };
    }) as unknown as Product[];
  } else {
    // Fallback: fetch any 8 products
    const { data: fallbackData } = await supabase
      .from("products")
      .select("*, categories!inner(slug)")
      .limit(8);
    featuredProducts = (fallbackData || []).map((p: unknown) => {
      const product = p as Record<string, unknown>;
      const categoryObj = product.categories as { slug: string };
      return { ...product, category: categoryObj.slug };
    }) as unknown as Product[];
  }

  // Fetch category images from homepage_content
  let categories = DEFAULT_CATEGORIES;
  let occasions: { name: string, subtitle: string, image: string, link: string, isActive: boolean }[] = [];
  let occasionFeaturedImage = "/images/products/saree-2.jpg";
  let lookbook: { image: string, caption: string, link: string }[] = [];
  let videoBannerUrl = "";
  let reelsData: { id: string; videoUrl: string; productId: string; productTitle?: string; productImage?: string }[] = [];
  let heroSlidesData: HeroSlide[] = [];
  try {
    const { data: homeData } = await supabase
      .from("homepage_content")
      .select("section, key, value, image_url, sort_order")
      .in("section", ["category", "video_banner", "reels", "hero_slides", "occasions", "lookbook"]);

    if (homeData) {
      const parsedSlides = homeData
        .filter((d) => d.section === "hero_slides")
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(s => {
          try {
            return JSON.parse(s.value || "{}");
          } catch { return null; }
        }).filter(Boolean);
      
      if (parsedSlides.length > 0) {
        heroSlidesData = parsedSlides;
      }
      const catData = homeData.filter((d) => d.section === "category").sort((a, b) => a.sort_order - b.sort_order);
      if (catData.length > 0) {
        categories = catData.map((c) => ({
          name: c.value || c.key,
          image: c.image_url || "/images/products/saree-2.jpg",
          link: `/products?category=${c.key}`,
        }));
      }

      
      const videoData = homeData.find((d) => d.section === "video_banner" && d.key === "hero_video");
      if (videoData) videoBannerUrl = videoData.image_url || "";

      const occsData = homeData.filter(d => d.section === "occasions").sort((a,b) => a.sort_order - b.sort_order);
      if (occsData.length > 0) {
        const featured = occsData.find(o => o.key === "occasion_featured");
        if (featured) occasionFeaturedImage = featured.image_url || occasionFeaturedImage;
        
        occasions = occsData.filter(o => o.key !== "occasion_featured").map(o => {
          try {
            const val = JSON.parse(o.value || "{}");
            return {
              name: val.name || "",
              subtitle: val.caption || "",
              image: o.image_url || "",
              link: val.link || "#",
              isActive: val.isActive !== false
            };
          } catch {
            return { name: "", subtitle: "", image: "", link: "#", isActive: true };
          }
        });
      }

      const lbData = homeData.filter(d => d.section === "lookbook").sort((a,b) => a.sort_order - b.sort_order);
      if (lbData.length > 0) {
        lookbook = lbData.filter(l => l.image_url).map(l => {
          try {
            const val = JSON.parse(l.value || "{}");
            return { image: l.image_url, caption: val.caption || "", link: val.link || "#" };
          } catch {
            return { image: l.image_url, caption: "", link: "#" };
          }
        });
      }


      reelsData = homeData
        .filter((d) => d.section === "reels")
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => ({
          id: r.key,
          videoUrl: r.image_url,
          productId: r.value,
        }));
    }
  } catch {
    // Use defaults
  }

  // Fetch product details for reels
  if (reelsData.length > 0) {
    const productIds = reelsData.map((r) => r.productId).filter(Boolean);
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from("products")
        .select("id, title, image_urls")
        .in("id", productIds);
      
      if (productsData) {
        reelsData = reelsData.map((r) => {
          const p = productsData.find((p) => p.id === r.productId);
          return {
            ...r,
            productTitle: p?.title || "Exclusive Product",
            productImage: p?.image_urls?.[0] || "/images/products/saree-2.jpg",
          };
        });
      }
    }
  }

  

  if (occasions.length === 0) {
    occasions = [
      { name: "Bridal", subtitle: "Begin Forever Beautifully", image: "/images/products/saree-6.jpg", link: "/products?occasion=bridal", isActive: true },
      { name: "Festive", subtitle: "Celebrate in Colour", image: "/images/products/saree-3.jpg", link: "/products?occasion=festive", isActive: true },
      { name: "Casual", subtitle: "Effortless Everyday Grace", image: "/images/products/saree-4.jpg", link: "/products?occasion=casual", isActive: true },
      { name: "Party", subtitle: "Shine Every Night", image: "/images/products/saree-5.jpg", link: "/products?occasion=party wear", isActive: true },
      { name: "Office", subtitle: "Poised & Professional", image: "/images/products/saree-7.jpg", link: "/products?occasion=formal", isActive: true },
      { name: "Wedding Guest", subtitle: "Arrive Unforgettable", image: "/images/products/saree-2.jpg", link: "/products?occasion=festive", isActive: true },
    ];
  }
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF8F0]">
      <HeroSlider initialSlides={heroSlidesData} />

      <div className="w-full h-px bg-[#C9A84C]/30 my-8" />

      {/* Shop by Category (Bento Grid) */}
      <section className="py-24 bg-[#FDF8F0]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-sans tracking-[0.2em] font-medium text-[#1A0A0A] uppercase mb-4">Shop Categories</h2>
            <div className="h-px w-24 bg-[#6B1D1D] mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {/* 1 Large Card (Left) */}
            <Link href={categories[0]?.link || "#"} className="group relative block overflow-hidden rounded-sm lg:col-span-2 lg:row-span-2">
              <Image src={categories[0]?.image || "/images/products/saree-2.jpg"} alt={categories[0]?.name || "Silk Sarees"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/80 via-transparent to-transparent group-hover:from-[#1A0A0A] transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="text-white font-serif text-3xl md:text-4xl">{categories[0]?.name || "Silk Sarees"}</h3>
              </div>
            </Link>

            {/* 2 Medium Cards (Top Right) */}
            <Link href={categories[1]?.link || "#"} className="group relative block overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image src={categories[1]?.image || "/images/products/saree-3.jpg"} alt={categories[1]?.name || "Banarasi"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/80 via-transparent to-transparent group-hover:from-[#1A0A0A] transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-white font-serif text-2xl">{categories[1]?.name || "Banarasi"}</h3>
              </div>
            </Link>
            
            <Link href={categories[2]?.link || "#"} className="group relative block overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image src={categories[2]?.image || "/images/products/saree-4.jpg"} alt={categories[2]?.name || "Kanjivaram"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/80 via-transparent to-transparent group-hover:from-[#1A0A0A] transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-white font-serif text-2xl">{categories[2]?.name || "Cotton"}</h3>
              </div>
            </Link>

            {/* 2 Medium Cards (Bottom Right) */}
            <Link href={categories[3]?.link || "#"} className="group relative block overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image src={categories[3]?.image || "/images/products/saree-5.jpg"} alt={categories[3]?.name || "Bridal"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/80 via-transparent to-transparent group-hover:from-[#1A0A0A] transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-white font-serif text-2xl">{categories[3]?.name || "Designer"}</h3>
              </div>
            </Link>
            
            <Link href={categories[4]?.link || "#"} className="group relative block overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image src={categories[4]?.image || "/images/products/saree-6.jpg"} alt={categories[4]?.name || "Designer"} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/80 via-transparent to-transparent group-hover:from-[#1A0A0A] transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-white font-serif text-2xl">{categories[4]?.name || "Bridal"}</h3>
              </div>
            </Link>

            {/* 1 Wide Card (Bottom) */}
            <Link href="/products?sort=newest" className="group relative block overflow-hidden rounded-sm lg:col-span-4 lg:row-span-1 min-h-[250px]">
              <Image src="/images/products/saree-1.jpg" alt="New Arrivals" fill className="object-cover object-top transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#6B1D1D]/40 mix-blend-multiply group-hover:bg-[#6B1D1D]/60 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-[#F5E6C8] text-sm tracking-[0.3em] uppercase mb-2">Just In</span>
                <h3 className="text-[#FDF8F0] font-serif text-4xl md:text-5xl">New Arrivals</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="flex-1 w-full text-center md:text-left flex items-center justify-center md:justify-start gap-4">
              <div className="hidden md:block h-px w-12 bg-[#C9A84C]" />
              <h2 className="text-2xl md:text-3xl font-sans font-medium tracking-[0.2em] text-[#1A0A0A] uppercase">Featured Collection</h2>
              <div className="hidden md:block h-px w-12 bg-[#C9A84C]" />
            </div>
            <Link href="/products" className="mt-6 md:mt-0 text-[#6B1D1D] border-b border-[#6B1D1D] pb-1 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors font-medium tracking-widest uppercase text-xs">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => {
              const isNew = product.created_at ? new Date(product.created_at as string) > thirtyDaysAgo : false;
              const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock < 5;
              return (
                <Link href={`/products/${product.id}`} key={product.id} className="group block">
                  <Card className="border-none rounded-none bg-transparent shadow-none transition-transform duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-sm">
                        <Image 
                          src={product.image_urls[0]} 
                          alt={product.title} 
                          fill 
                          className="object-cover transition-all duration-1000 group-hover:scale-110"
                        />
                        {/* Quick Add overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                          <button className="w-full bg-[#FDF8F0] text-[#1A0A0A] py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#6B1D1D] hover:text-[#F5E6C8] transition-colors flex items-center justify-center gap-2">
                            <ShoppingCart className="h-4 w-4" /> Quick Add
                          </button>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 pointer-events-none" />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
                          {isNew && (
                            <span className="bg-[#6B1D1D] text-[#F5E6C8] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                              New
                            </span>
                          )}
                          {isLowStock && (
                            <span className="bg-[#C9A84C] text-[#1A0A0A] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 z-20">
                          <WishlistButton 
                            product={product} 
                            variant="ghost" 
                            className="bg-white/80 backdrop-blur-sm hover:bg-[#6B1D1D] hover:text-white rounded-full h-8 w-8 p-0" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="font-serif font-medium text-lg truncate px-2 text-[#1A0A0A]">{product.title}</h3>
                        <p className="text-[#1A0A0A]/60 text-sm">{product.fabric}</p>
                        <p className="text-[#6B1D1D] font-bold tracking-wider">₹{product.price.toLocaleString("en-IN")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Banner Section */}
      <section className="w-full relative h-[60vh] md:h-[80vh] overflow-hidden bg-[#6B1D1D] flex items-center justify-center">
        {videoBannerUrl ? (
          <video 
            src={videoBannerUrl} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3a0f0f] to-[#6B1D1D]" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <h2 className="text-4xl md:text-6xl font-serif text-[#F5E6C8] mb-8 uppercase tracking-widest drop-shadow-lg">
            The Prerna Edit
          </h2>
          <Link 
            href="/products"
            className="group relative inline-flex items-center justify-center px-8 py-3 bg-[#C9A84C] text-[#1A0A0A] font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(201,168,76,0.5)]"
          >
            SHOP NOW <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* Shop by Occasion — Vastranand Style */}
      <section className="py-24 bg-[#FDF8F0] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif tracking-[0.1em] font-medium text-[#6B1D1D] uppercase">
              ——✦ SHOP BY OCCASION ✦——
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Left: Featured Card (40%) */}
            <div className="lg:w-[40%] relative overflow-hidden min-h-[500px] lg:min-h-full rounded-md shadow-2xl group">
              <Image 
                src={occasionFeaturedImage || "/images/products/saree-2.jpg"}
                alt="Weaves for Every Occasion" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col items-center justify-center text-center">
                <h3 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Weaves for Every Occasion
                </h3>
                <p className="text-white/90 text-lg font-serif italic mb-8">
                  From bridal grandeur to festive joy
                </p>
                <Link 
                  href="/products"
                  className="bg-[#C9A84C] text-[#1A0A0A] px-8 py-3 rounded-none font-bold tracking-widest uppercase text-sm hover:bg-[#b8912e] transition-colors"
                >
                  Explore All
                </Link>
              </div>
            </div>

            {/* Right: Grid of Occasion Cards (60%) */}
            <div className="lg:w-[60%] grid grid-cols-2 md:grid-cols-3 gap-6">
              {occasions.map((occ, idx) => (
                <Link href={occ.link} key={idx} className="group block">
                  <div className="relative overflow-hidden h-[300px] md:h-[350px] rounded-md transition-all duration-500 shadow-lg">
                    <Image 
                      src={occ.image || "/images/products/saree-3.jpg"} 
                      alt={occ.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    <div className="absolute inset-0 p-5 flex flex-col justify-end items-center text-center z-20">
                      <h4 className="font-serif text-2xl font-bold text-white mb-1">
                        {occ.name}
                      </h4>
                      <p className="text-[#F5E6C8] text-xs font-serif italic tracking-wide">
                        {occ.subtitle}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shop The Look / Reels */}
      {reelsData && reelsData.length > 0 && (
        <section className="py-24 bg-[#FDF8F0] overflow-hidden">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif tracking-[0.1em] font-medium text-[#6B1D1D] uppercase">
                ——✦ SHOP THE LOOK ✦——
              </h2>
            </div>
            
            <div className="flex overflow-x-auto pb-8 gap-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {reelsData.map((reel, idx) => (
                <div key={idx} className="relative shrink-0 w-[260px] md:w-[300px] aspect-[9/16] rounded-xl overflow-hidden snap-center group cursor-pointer shadow-lg bg-black">
                  {reel.videoUrl ? (
                    <video 
                      src={reel.videoUrl} 
                      muted 
                      loop 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                  ) : (
                    <Image src={reel.productImage || "/images/products/saree-2.jpg"} alt={reel.productTitle || "Product"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  {/* Hover Shop Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <Link href={`/products/${reel.productId}`} className="bg-[#C9A84C] text-[#1A0A0A] px-6 py-2 rounded-sm font-bold tracking-widest uppercase text-xs hover:bg-[#b8912e] transition-colors shadow-xl">
                      Shop Now
                    </Link>
                  </div>
                  
                  {/* Bottom Product Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-0">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 border border-white/20">
                      <Image src={reel.productImage || "/images/products/saree-2.jpg"} alt={reel.productTitle || "Product"} fill className="object-cover" />
                    </div>
                    <p className="text-white font-medium text-sm line-clamp-2 drop-shadow-md">
                      {reel.productTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-[#F5E6C8] relative">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-2xl font-sans tracking-[0.2em] font-medium text-[#1A0A0A] uppercase mb-4">A Legacy of Trust</h2>
            <div className="h-px w-24 bg-[#6B1D1D] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-[#C9A84C] text-6xl font-serif leading-none h-10">&quot;</span>
              <div className="flex justify-center mb-6 text-[#C9A84C] text-lg">
                {"★★★★★"}
              </div>
              <p className="italic font-serif text-[#1A0A0A] text-xl md:text-2xl mb-8 leading-relaxed">&quot;The Kanjivaram saree I ordered was absolutely stunning. Perfect for my daughter&apos;s wedding!&quot;</p>
              <p className="font-bold tracking-widest uppercase text-xs text-[#6B1D1D]">— Meena Sharma, Bangalore</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[#C9A84C] text-6xl font-serif leading-none h-10">&quot;</span>
              <div className="flex justify-center mb-6 text-[#C9A84C] text-lg">
                {"★★★★★"}
              </div>
              <p className="italic font-serif text-[#1A0A0A] text-xl md:text-2xl mb-8 leading-relaxed">&quot;Quality is exceptional. The silk feels so rich and the colors are exactly as shown.&quot;</p>
              <p className="font-bold tracking-widest uppercase text-xs text-[#6B1D1D]">— Priya Patel, Mumbai</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[#C9A84C] text-6xl font-serif leading-none h-10">&quot;</span>
              <div className="flex justify-center mb-6 text-[#C9A84C] text-lg">
                {"★★★★★"}
              </div>
              <p className="italic font-serif text-[#1A0A0A] text-xl md:text-2xl mb-8 leading-relaxed">&quot;Fast delivery to Hubli! The saree was beautifully packed. Will definitely order again.&quot;</p>
              <p className="font-bold tracking-widest uppercase text-xs text-[#6B1D1D]">— Anita Desai, Dharwad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram / Lookbook Strip */}
      <section className="pt-24 pb-0 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-sans tracking-[0.2em] font-medium text-[#1A0A0A] uppercase mb-4">Our Lookbook</h2>
          <div className="h-px w-24 bg-[#6B1D1D] mx-auto mb-6" />
          <p className="text-[#1A0A0A]/60 font-medium tracking-widest uppercase text-xs">Follow us @prernasilks</p>
        </div>
        <div className="flex w-full overflow-x-auto scrollbar-hide">
          {lookbook.map((lb, idx) => (
            <Link href={lb.link || "/products"} key={idx} className="group relative block w-1/2 md:w-1/3 lg:w-1/6 aspect-square shrink-0 border border-transparent hover:border-[#C9A84C] transition-all z-0 hover:z-10 bg-gray-100 flex items-center justify-center">
              {lb.image ? (
                <Image src={lb.image} alt={lb.caption || `Lookbook ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              ) : (
                <Camera className="h-12 w-12 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-[#1A0A0A]/0 group-hover:bg-[#1A0A0A]/30 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-xs font-bold">Shop the Look</span>
              </div>
            </Link>
          ))}
          {lookbook.length === 0 && (
            <div className="w-full py-12 text-center text-gray-400">No lookbook images found. Add some from the admin panel!</div>
          )}
        </div>
      </section>
    </div>
  );
}
