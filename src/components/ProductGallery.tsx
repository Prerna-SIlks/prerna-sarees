"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  title: string;
  mainImage: string;
  images: string[];
}

interface PlaceholderImage {
  src: string;
  filter: string;
}

// Sub-component for zoomable images
function ZoomableImage({ src, alt, filterStyle }: { src: string, alt: string, filterStyle?: React.CSSProperties }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const isZoomed = useRef(false);

  const onMouseEnter = () => {
    isZoomed.current = true;
    if (imgRef.current) {
      // ONLY transition transform. transform-origin will update instantly.
      imgRef.current.style.transition = 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
      imgRef.current.style.transform = 'scale(2)';
    }
  };

  const onMouseLeave = () => {
    isZoomed.current = false;
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
      imgRef.current.style.transform = 'scale(1)';
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed.current || !imgRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div 
      className="flex-1 h-[600px] relative overflow-hidden rounded-[8px] cursor-crosshair bg-[#FDF8F0]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ willChange: 'transform', ...filterStyle }}
        priority
        unoptimized
      />
    </div>
  );
}

export function ProductGallery({ title, mainImage, images }: ProductGalleryProps) {
  const hasExtraImages = images && images.length > 0;
  
  const galleryImages: string[] | PlaceholderImage[] = hasExtraImages 
    ? [mainImage, ...images].slice(0, 6) 
    : [
        { src: mainImage, filter: "" },
        { src: mainImage, filter: "contrast(1.1) saturate(1.2)" },
        { src: mainImage, filter: "brightness(0.95) saturate(0.9) hue-rotate(10deg)" },
        { src: mainImage, filter: "scale(1.5) translate(10%, 10%)" }
      ];

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImageSrc = hasExtraImages 
    ? (galleryImages as string[])[activeIndex] 
    : (galleryImages as PlaceholderImage[])[activeIndex].src;
    
  const activeImageStyle = hasExtraImages 
    ? {} 
    : { filter: (galleryImages as PlaceholderImage[])[activeIndex].filter };

  // Determine the constant image (third column)
  // Usually the second image, or fallback to the first if only one exists.
  const constantImageSrc = hasExtraImages && images.length > 0 
    ? images[0] 
    : (hasExtraImages ? mainImage : (galleryImages as PlaceholderImage[])[1].src);

  const constantImageStyle = hasExtraImages 
    ? {} 
    : { filter: (galleryImages as PlaceholderImage[])[1].filter };

  return (
    <div className="flex flex-col md:flex-row gap-[12px] w-full">
      
      {/* PART A - Thumbnail column (left) */}
      <div className="flex md:flex-col gap-[8px] md:w-[80px] shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-hide pb-2 md:pb-0 h-auto md:h-[600px]">
        {galleryImages.map((img, idx) => {
          const src = hasExtraImages ? (img as string) : (img as PlaceholderImage).src;
          const style = hasExtraImages ? {} : { filter: (img as PlaceholderImage).filter };
          const isActive = idx === activeIndex;

          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-[76px] h-[96px] shrink-0 rounded-[6px] overflow-hidden border-[2px] transition-all duration-300 ${
                isActive ? "border-[#C9A84C]" : "border-transparent hover:border-[#C9A84C80]"
              }`}
            >
              <Image src={src} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" style={style} />
            </button>
          );
        })}
      </div>

      {/* PART B - Main Image (Dynamic) */}
      <ZoomableImage src={activeImageSrc} alt={`${title} - view ${activeIndex + 1}`} filterStyle={activeImageStyle} />

      {/* PART C - Constant Image (Static Secondary) */}
      <div className="hidden lg:block flex-1">
        <ZoomableImage src={constantImageSrc} alt={`${title} - secondary view`} filterStyle={constantImageStyle} />
      </div>

    </div>
  );
}
