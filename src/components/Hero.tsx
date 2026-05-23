import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

const DEFAULTS = {
  title: "Elegance Woven in Tradition",
  subtitle: "Discover our ultra-premium collection of authentic Indian sarees. Crafted for the modern woman who embraces her heritage.",
  image: "/images/products/saree-1.jpg",
};

export async function Hero() {
  let title = DEFAULTS.title;
  let subtitle = DEFAULTS.subtitle;
  let heroImage = DEFAULTS.image;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("key, value")
      .eq("section", "hero");

    if (data) {
      for (const row of data) {
        if (row.key === "title" && row.value) title = row.value;
        if (row.key === "subtitle" && row.value) subtitle = row.value;
        if (row.key === "image_url" && row.value) heroImage = row.value;
      }
    }
  } catch {
    // Fallback to defaults if table doesn't exist yet
  }

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Luxury Silk Saree"
          fill
          className="object-cover object-top opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto h-full flex flex-col items-center justify-center text-center px-4">
        <div 
          className="animate-in fade-in slide-in-from-bottom-8 duration-1000"
          style={{ animationFillMode: 'both' }}
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary mb-6">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, Math.ceil(title.split(" ").length / 2)).join(" ")}
                <br className="hidden md:block" />
                {" "}{title.split(" ").slice(Math.ceil(title.split(" ").length / 2)).join(" ")}
              </>
            ) : title}
          </h1>
        </div>

        <div 
          className="animate-in fade-in slide-in-from-bottom-6 duration-1000"
          style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        >
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-10 font-light">
            {subtitle}
          </p>
        </div>

        <div 
          className="animate-in fade-in zoom-in-95 duration-700"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <Link href="/products">
            <Button size="lg" className="h-14 px-10 text-lg rounded-none bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/20">
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
