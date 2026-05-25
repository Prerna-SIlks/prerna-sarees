import { ProductActions } from "@/components/ProductActions";
import { WishlistButton } from "@/components/WishlistButton";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";
import { ProductGallery } from "@/components/ProductGallery";
import { ReviewSection } from "@/components/ReviewSection";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";
import { createAnonClient as createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/data/mock-products";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // Fetch current product
  const { data: p } = await supabase
    .from('products')
    .select('*, categories!inner(slug)')
    .eq('id', params.id)
    .single();

  if (!p) {
    notFound();
  }

  const product = {
    ...p,
    category: p.categories.slug
  };

  const productImages = (() => {
    let imgs: string[] = [];
    const rawImages = product.image_urls || product.images;
    
    let parsedArray: unknown[] = [];
    if (Array.isArray(rawImages)) {
      parsedArray = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        parsedArray = JSON.parse(rawImages);
        if (!Array.isArray(parsedArray)) parsedArray = [];
      } catch {
        parsedArray = [];
      }
    }
    
    if (parsedArray.length > 0) {
      imgs = parsedArray.filter(
        (img: unknown) => img && typeof img === 'string' && img.length > 0
      ) as string[];
    }
    
    if (imgs.length === 0 && product.image_url) {
      imgs = [product.image_url];
    }
    
    return imgs;
  })();

  // Fetch similar products (same category)
  let { data: similarProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', p.category_id)
    .neq('id', p.id)
    .limit(6);

  // Fill with random products if not enough
  if (!similarProducts || similarProducts.length < 6) {
    const limit = 6 - (similarProducts?.length || 0);
    const { data: randomProducts } = await supabase
      .from('products')
      .select('*')
      .neq('id', p.id)
      .limit(limit);
      
    if (randomProducts) {
      const existingIds = new Set(similarProducts?.map(sp => sp.id) || []);
      const newRandom = randomProducts.filter(rp => !existingIds.has(rp.id));
      similarProducts = [...(similarProducts || []), ...newRandom].slice(0, 6);
    }
  }

  return (
    <div className="bg-white">
      {/* Track this product view */}
      <RecentlyViewedTracker product={product} />

      <div className="max-w-[1200px] mx-auto px-6 py-[32px]">
        
        {/* Breadcrumbs */}
        <div className="text-[11px] tracking-widest uppercase font-medium text-[#1A0A0A]/60 mb-8 font-sans">
          <Link href="/" className="hover:text-[#6B1D1D] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[#6B1D1D] transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-[#6B1D1D] transition-colors">{product.category.replace("-", " ")}</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1A0A0A]">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px]">
          
          {/* LEFT: image gallery */}
          <div className="w-full">
            <ProductGallery 
              title={product.title} 
              images={productImages} 
            />
          </div>

          {/* RIGHT: product info */}
          <div className="w-full flex flex-col justify-start">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A0A0A] mb-2">{product.title}</h1>
            
            {/* Star Rating & Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#C9A84C] text-sm">
                {"★★★★★"}
              </div>
              <span className="text-xs text-[#1A0A0A]/60 tracking-wider uppercase font-medium">
                (12 Reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-[#6B1D1D] tracking-wide mb-6">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {/* Craft / Fabric / Color Pills */}
            <div className="flex border border-[#eeeeee] mb-8 w-full rounded-sm overflow-hidden">
              <div className="flex-1 flex flex-col items-center py-3 px-2 sm:px-4 border-r border-[#eeeeee]">
                <span className="text-[10px] text-[#888888] uppercase tracking-wider mb-1">Craft</span>
                <span className="text-[#1A0A0A] font-bold text-sm text-center">{product.craft || "Woven"}</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3 px-2 sm:px-4 border-r border-[#eeeeee]">
                <span className="text-[10px] text-[#888888] uppercase tracking-wider mb-1">Fabric</span>
                <span className="text-[#1A0A0A] font-bold text-sm text-center">{product.fabric || "Silk"}</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-3 px-2 sm:px-4">
                <span className="text-[10px] text-[#888888] uppercase tracking-wider mb-1">Color</span>
                <span className="text-[#1A0A0A] font-bold text-sm text-center">{(product as unknown as Record<string, string>).color || "Assorted"}</span>
              </div>
            </div>
            
            <p className="text-[#1A0A0A]/80 text-[14px] mb-8 leading-relaxed font-sans line-clamp-3">
              {product.description}
            </p>

            <Separator className="mb-8 bg-[#eeeeee]" />

            <ProductActions product={product as unknown as Product} />

            {/* Accordions */}
            <Accordion defaultValue={["details"]} className="w-full">
              <AccordionItem value="details" className="border-black/10">
                <AccordionTrigger className="text-[#1A0A0A] hover:text-[#C9A84C] uppercase tracking-widest text-xs font-bold data-[state=open]:text-[#C9A84C]">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="text-[#1A0A0A]/70 leading-relaxed pt-2 pb-6 space-y-2">
                  <p>{product.description}</p>
                  <ul className="list-disc pl-5 mt-4 space-y-1">
                    <li><span className="font-medium text-[#1A0A0A]">Fabric:</span> {product.fabric}</li>
                    <li><span className="font-medium text-[#1A0A0A]">Type:</span> {product.type}</li>
                    <li><span className="font-medium text-[#1A0A0A]">Occasion:</span> {product.occasion}</li>
                    <li><span className="font-medium text-[#1A0A0A]">Craft/Weave:</span> {product.craft || "Traditional Handwoven"}</li>
                    <li><span className="font-medium text-[#1A0A0A]">Origin:</span> {product.origin || "India"}</li>
                    <li><span className="font-medium text-[#1A0A0A]">Dimensions:</span> 5.5m x 1.1m</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care" className="border-black/10">
                <AccordionTrigger className="text-[#1A0A0A] hover:text-[#C9A84C] uppercase tracking-widest text-xs font-bold data-[state=open]:text-[#C9A84C]">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent className="text-[#1A0A0A]/70 leading-relaxed pt-2 pb-6">
                  {product.care_instructions ? (
                    <p>{product.care_instructions}</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Dry clean recommended</li>
                      <li>Store in muslin cloth</li>
                      <li>Avoid direct sunlight</li>
                      <li>Iron on reverse side at low heat</li>
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="border-black/10">
                <AccordionTrigger className="text-[#1A0A0A] hover:text-[#C9A84C] uppercase tracking-widest text-xs font-bold data-[state=open]:text-[#C9A84C]">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="text-[#1A0A0A]/70 leading-relaxed pt-2 pb-6">
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    <li>Free shipping on orders above ₹2,000</li>
                    <li>Delivered in 5-7 business days</li>
                    <li>Easy 7-day returns</li>
                  </ul>
                  <Link href="/returns" className="text-[#6B1D1D] hover:underline font-medium text-xs tracking-wider uppercase">
                    View Return Policy
                  </Link>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size" className="border-black/10">
                <AccordionTrigger className="text-[#1A0A0A] hover:text-[#C9A84C] uppercase tracking-widest text-xs font-bold data-[state=open]:text-[#C9A84C]">
                  Size Guide
                </AccordionTrigger>
                <AccordionContent className="text-[#1A0A0A]/70 leading-relaxed pt-2 pb-6">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Standard saree length: 5.5 metres</li>
                    <li>Running blouse piece: 0.8 metres included</li>
                    <li>Petticoat not included</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="py-24 bg-[#FDF8F0] border-t border-[#C9A84C]/20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-serif tracking-[0.1em] font-medium text-[#6B1D1D] uppercase">
                ——✦ YOU MAY ALSO LIKE ✦——
              </h2>
            </div>
            
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-8 lg:pb-0 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {similarProducts.map((sp) => (
                <Link href={`/products/${sp.id}`} key={sp.id} className="group block shrink-0 w-[280px] lg:w-auto snap-center">
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden mb-4 bg-white shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image
                      src={sp.image_urls[0]}
                      alt={sp.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white text-[#1A0A0A] px-6 py-2 rounded-sm font-bold tracking-widest uppercase text-xs shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Quick View
                      </span>
                    </div>
                    {/* Wishlist Icon */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <WishlistButton 
                        product={{...sp, category: sp.category_id}} 
                        variant="ghost" 
                        className="bg-white/90 hover:bg-[#6B1D1D] hover:text-white rounded-full h-8 w-8 p-0 text-[#1A0A0A]" 
                      />
                    </div>
                  </div>
                  <div className="text-center space-y-1 px-2">
                    <h3 className="font-serif font-medium text-[#1A0A0A] text-lg line-clamp-1">{sp.title}</h3>
                    <p className="text-[#6B1D1D] font-bold tracking-wider">₹{sp.price.toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <div className="container mx-auto px-4 md:px-8 pb-24">
        <ReviewSection productId={product.id} />
      </div>

    </div>
  );
}
