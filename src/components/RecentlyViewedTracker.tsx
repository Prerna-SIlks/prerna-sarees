"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "./RecentlyViewed";

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    image_urls: string[];
    fabric: string;
  };
}

export function RecentlyViewedTracker({ product }: Props) {
  useEffect(() => {
    trackRecentlyViewed({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_urls[0],
      fabric: product.fabric,
    });
  }, [product]);

  return null;
}
