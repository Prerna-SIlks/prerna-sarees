"use client";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

export function PriceRangeSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const minParam = Number(searchParams.get("minPrice")) || 1000;
  const maxParam = Number(searchParams.get("maxPrice")) || 75000;

  const [range, setRange] = useState<[number, number]>([minParam, maxParam]);

  const handleChange = useCallback((value: number | number[]) => {
    if (Array.isArray(value)) {
      setRange([value[0], value[1]]);
    }
  }, []);

  const handleAfterChange = useCallback(
    (value: number | number[]) => {
      if (Array.isArray(value)) {
        const params = new URLSearchParams(searchParams.toString());
        if (value[0] > 1000) {
          params.set("minPrice", String(value[0]));
        } else {
          params.delete("minPrice");
        }
        if (value[1] < 75000) {
          params.set("maxPrice", String(value[1]));
        } else {
          params.delete("maxPrice");
        }
        router.push(`/products?${params.toString()}`);
      }
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground">Price Range</h4>
      <div className="px-1">
        <Slider
          range
          min={1000}
          max={75000}
          step={500}
          value={range}
          onChange={handleChange}
          onChangeComplete={handleAfterChange}
          styles={{
            track: { backgroundColor: "#7c2d12", height: 4 },
            handle: {
              borderColor: "#7c2d12",
              backgroundColor: "#fff",
              width: 18,
              height: 18,
              marginTop: -7,
              opacity: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            },
            rail: { backgroundColor: "#e5e7eb", height: 4 },
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground text-center font-medium">
        ₹{range[0].toLocaleString("en-IN")} — ₹{range[1].toLocaleString("en-IN")}
      </p>
    </div>
  );
}
