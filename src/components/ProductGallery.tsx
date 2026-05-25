"use client";

import { useState, useRef } from "react";

interface ProductGalleryProps {
  title: string;
  images: string[];
}

// Sub-component for zoomable images
function ZoomableImage({ src, alt }: { src: string, alt: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const isZoomed = useRef(false);

  const onMouseEnter = () => {
    isZoomed.current = true;
    if (imgRef.current) {
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
      className="relative overflow-hidden rounded-xl flex-1 w-full h-[350px] md:h-[580px] cursor-crosshair bg-[#FDF8F0]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          willChange: 'transform'
        }}
      />
    </div>
  );
}

export function ProductGallery({ title, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = images[activeIndex] || images[0] || '/placeholder.jpg';

  return (
    <div className="flex flex-col md:flex-row gap-[12px] w-full items-start">
      
      {/* CENTER: Main large image with zoom (Order 1 on mobile, Order 2 on desktop) */}
      <div className="w-full order-1 md:order-2 md:flex-1">
        <ZoomableImage 
          src={currentImage} 
          alt={`${title} - view ${activeIndex + 1}`} 
        />
      </div>

      {/* LEFT: Thumbnail strip (Order 2 on mobile, Order 1 on desktop) */}
      <div 
        className="flex flex-row md:flex-col gap-[8px] w-full md:w-[80px] shrink-0 overflow-x-auto md:overflow-y-auto scrollbar-hide order-2 md:order-1"
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`
              relative overflow-hidden rounded-lg shrink-0
              transition-all duration-200
              ${activeIndex === idx 
                ? 'ring-2 ring-[#C9A84C]' 
                : 'ring-2 ring-transparent hover:ring-[#C9A84C]/50'
              }
            `}
            style={{ 
              width: '80px', 
              height: '100px'
            }}
          >
            <img 
              src={img} 
              alt={`${title} thumbnail ${idx + 1}`} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
            />
          </button>
        ))}
      </div>

    </div>
  );
}
