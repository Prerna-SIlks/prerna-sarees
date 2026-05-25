import { Product } from "@/lib/data/mock-products";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProductFilters } from "@/components/ProductFilters";
import { WishlistButton } from "@/components/WishlistButton";
import { ProductSortDropdown } from "@/components/ProductSortDropdown";

import { createAnonClient as createClient } from "@/lib/supabase/server";

export default async function ProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = createClient();
  
  let query = supabase.from('products').select('*, categories!inner(slug)');

  const categoryParam = searchParams.category;
  if (typeof categoryParam === 'string') {
    query = query.eq('categories.slug', categoryParam);
  }

  const typeParam = searchParams.type;
  if (typeof typeParam === 'string') {
    query = query.ilike('type', typeParam);
  }
  
  const occasionParam = searchParams.occasion;
  if (typeof occasionParam === 'string') {
    query = query.ilike('occasion', occasionParam);
  }

  const fabricParam = searchParams.fabric;
  if (typeof fabricParam === 'string') {
    query = query.ilike('fabric', fabricParam);
  }

  // Price range filtering
  const minPrice = searchParams.minPrice;
  if (typeof minPrice === 'string') {
    query = query.gte('price', Number(minPrice));
  }
  const maxPrice = searchParams.maxPrice;
  if (typeof maxPrice === 'string') {
    query = query.lte('price', Number(maxPrice));
  }

  // Color filtering
  const colorsParam = searchParams.colors;
  if (typeof colorsParam === 'string' && colorsParam.trim().length > 0) {
    const colors = colorsParam.split(',').filter(c => c.trim().length > 0);
    if (colors.length > 0) {
      const orQuery = colors.map(c => `color.ilike.%${c}%`).join(',');
      query = query.or(orQuery);
    }
  }

  // Sort
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : '';
  if (sortParam === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sortParam === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else if (sortParam === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: productsData } = await query;
  
  const filteredProducts = (productsData || []).map((p: unknown) => {
    const product = p as Record<string, unknown>;
    const categoryObj = product.categories as { slug: string };
    return {
      ...product,
      category: categoryObj.slug
    };
  }) as unknown as Product[];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0">
          <ProductFilters />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">Our Collection</h1>
              <p className="text-muted-foreground">Showing {filteredProducts.length} luxurious sarees.</p>
            </div>
            <ProductSortDropdown />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-muted-foreground font-serif">No products match your filters.</p>
              <Link href="/products" className="text-primary mt-4 inline-block underline">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isNew = product.created_at ? new Date(product.created_at as string) > thirtyDaysAgo : false;
                const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock < 5;
                return (
                  <Link href={`/products/${product.id}`} key={product.id} className="group block">
                    <Card className="border-none rounded-none bg-transparent shadow-none transition-transform duration-300 group-hover:-translate-y-1">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4] overflow-hidden mb-4 rounded-md bg-muted">
                          {/* Primary image */}
                          <Image 
                            src={product.image_urls[0]} 
                            alt={product.title} 
                            fill 
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          {/* Badges */}
                          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                            {isNew && (
                              <span className="bg-[#d4a853] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                                New
                              </span>
                            )}
                            {isLowStock && (
                              <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                                Low Stock
                              </span>
                            )}
                          </div>
                          {/* Wishlist button */}
                          <div className="absolute top-2 right-2 z-10">
                            <WishlistButton 
                              product={product} 
                              variant="ghost" 
                              className="bg-white/50 backdrop-blur-sm hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/80 rounded-full h-8 w-8 p-0" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif font-medium text-lg truncate text-foreground group-hover:text-primary transition-colors">{product.title}</h3>
                          <p className="text-muted-foreground text-sm flex justify-between">
                            <span>{product.fabric}</span>
                            <span className="text-primary font-semibold">₹{product.price.toLocaleString("en-IN")}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
