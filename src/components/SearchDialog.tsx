"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  title: string;
  fabric: string;
  price: number;
  image_urls: string[];
}

export function SearchDialog() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, title, fabric, price, image_urls")
      .or(`title.ilike.%${searchQuery}%,fabric.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`)
      .limit(6);

    setResults((data as SearchResult[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl top-[20%] translate-y-0">
        <div className="flex items-center border-b border-border px-3 pb-2 pt-2">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none border-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search by name, category, or fabric..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="max-h-[300px]">
          {loading ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Searching...</p>
          ) : query.length >= 2 && results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No products found.</p>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {results.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-border">
                    <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{product.title}</span>
                    <span className="text-xs text-muted-foreground">{product.fabric} • ₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
