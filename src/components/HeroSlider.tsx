"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  isActive: boolean;
  gradient: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    title: "Draped in Timeless Elegance",
    subtitle: "Handpicked sarees from across India, crafted for the modern woman.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    imageUrl: "",
    isActive: true,
    gradient: "#6B1D1D",
  }
];

export function HeroSlider({ initialSlides = [] }: { initialSlides?: HeroSlide[] }) {
  const activeSlides = initialSlides.length > 0 
    ? initialSlides.filter(s => s.isActive)
    : DEFAULT_SLIDES;
  
  const slidesToRender = activeSlides.length > 0 ? activeSlides : DEFAULT_SLIDES;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative w-full h-[100vh] overflow-hidden group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slidesToRender.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
              {slide.imageUrl ? (
                <div 
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.imageUrl})` }}
                />
              ) : (
                <div 
                  className="absolute inset-0 z-0"
                  style={{ background: `linear-gradient(to right, #1A0A0A, ${slide.gradient || '#6B1D1D'})` }}
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 z-0" />

              <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-8 md:px-16 md:w-2/3">
                <span className="text-[#C9A84C] text-sm md:text-sm font-bold tracking-widest uppercase mb-4 animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-both">
                  THE PRERNA EDIT
                </span>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl text-[#F5E6C8] mb-6 leading-[1.1] animate-in slide-in-from-bottom-6 duration-1000 delay-150 fade-in fill-mode-both font-serif font-bold italic">
                  {slide.title}
                </h1>
                
                <p className="text-lg md:text-xl text-[#F5E6C8]/80 max-w-xl font-light mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-300 fade-in fill-mode-both">
                  {slide.subtitle}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-500 fade-in fill-mode-both">
                  {slide.ctaText && slide.ctaLink && (
                    <Link href={slide.ctaLink}>
                      <Button size="lg" className="h-14 px-10 text-sm tracking-widest uppercase font-bold rounded-none bg-[#C9A84C] text-[#1A0A0A] hover:bg-[#b8912e] transition-all shadow-xl shadow-black/20">
                        {slide.ctaText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-[#1A0A0A]/20 text-[#F5E6C8] border border-[#F5E6C8]/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1A0A0A]/60 z-20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-[#1A0A0A]/20 text-[#F5E6C8] border border-[#F5E6C8]/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1A0A0A]/60 z-20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {slidesToRender.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? "w-8 h-2 bg-[#C9A84C]"
                : "w-2 h-2 bg-[#F5E6C8]/50 hover:bg-[#F5E6C8]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
