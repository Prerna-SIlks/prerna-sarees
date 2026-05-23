"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface RecentProduct {
  id: string;
  title: string;
  price: number;
  image_url: string;
  fabric: string;
}

export function trackRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  const key = "prerna-recently-viewed";
  const stored = JSON.parse(localStorage.getItem(key) || "[]") as RecentProduct[];
  const filtered = stored.filter((p) => p.id !== product.id);
  filtered.unshift(product);
  localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
}

export function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const key = "prerna-recently-viewed";
    const stored = JSON.parse(localStorage.getItem(key) || "[]") as RecentProduct[];
    setProducts(stored.filter((p) => p.id !== currentProductId).slice(0, 4));
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-serif font-bold text-primary mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted mb-3">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="font-serif font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">{product.title}</h3>
            <p className="text-xs text-muted-foreground">{product.fabric}</p>
            <p className="text-sm text-primary font-semibold">₹{product.price.toLocaleString("en-IN")}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
