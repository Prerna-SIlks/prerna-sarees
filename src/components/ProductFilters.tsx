"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PriceRangeSlider } from "./PriceRangeSlider";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isChecked) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const types = ["Silk", "Cotton", "Linen", "Banarasi", "Designer", "Bridal", "Casual", "Georgette", "Chiffon", "Net", "Organza", "Kanjivaram", "Chanderi"];
  const occasions = ["Bridal", "Festive", "Party Wear", "Casual", "Formal"];
  const fabrics = ["Silk", "Cotton", "Linen", "Banarasi", "Designer", "Bridal", "Casual", "Georgette", "Chiffon", "Net", "Organza", "Kanjivaram", "Chanderi"];

  const colors = [
    { name: "Red", hex: "#C0392B" },
    { name: "Pink", hex: "#E91E8C" },
    { name: "Blue", hex: "#1565C0" },
    { name: "Green", hex: "#2E7D32" },
    { name: "Yellow", hex: "#F9A825" },
    { name: "Orange", hex: "#E65100" },
    { name: "Purple", hex: "#6A1B9A" },
    { name: "White", hex: "#F5F5F5", border: true },
    { name: "Ivory", hex: "#FFFFF0", border: true },
    { name: "Black", hex: "#212121" },
    { name: "Gold", hex: "#C9A84C" },
    { name: "Silver", hex: "#9E9E9E" },
    { name: "Maroon", hex: "#6B1D1D" },
    { name: "Beige", hex: "#D4B896" },
    { name: "Teal", hex: "#00695C" },
    { name: "Navy", hex: "#0D47A1" },
    { name: "Coral", hex: "#FF6F61" },
    { name: "Magenta", hex: "#AD1457" }
  ];

  const selectedColors = searchParams.get('colors') ? searchParams.get('colors')?.split(',') || [] : [];

  const handleColorToggle = (colorName: string) => {
    let newColors = [...selectedColors];
    if (newColors.includes(colorName)) {
      newColors = newColors.filter(c => c !== colorName);
    } else {
      newColors.push(colorName);
    }
    
    const params = new URLSearchParams(searchParams.toString());
    if (newColors.length > 0) {
      params.set('colors', newColors.join(','));
    } else {
      params.delete('colors');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium mb-4 text-primary">Filters</h3>
      </div>

      {/* Price Range Slider */}
      <PriceRangeSlider />

      <Separator />

      {/* Color Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="font-medium text-foreground tracking-widest text-sm uppercase">Color</h4>
          {selectedColors.length > 0 && (
            <span className="bg-[#C9A84C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {selectedColors.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                title={color.name}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? "ring-2 ring-offset-2 ring-[#C9A84C]" : "hover:scale-110"
                } ${color.border ? "border border-gray-300" : ""}`}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3 text-foreground">Type</h4>
        <div className="space-y-2">
          {types.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type}`} 
                checked={searchParams.get('type') === type.toLowerCase()}
                onCheckedChange={(checked) => handleFilterChange('type', type.toLowerCase(), checked as boolean)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal text-muted-foreground cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />

      <div>
        <h4 className="font-medium mb-3 text-foreground">Occasion</h4>
        <div className="space-y-2">
          {occasions.map((occ) => (
            <div key={occ} className="flex items-center space-x-2">
              <Checkbox 
                id={`occ-${occ}`} 
                checked={searchParams.get('occasion') === occ.toLowerCase()}
                onCheckedChange={(checked) => handleFilterChange('occasion', occ.toLowerCase(), checked as boolean)}
              />
              <Label htmlFor={`occ-${occ}`} className="text-sm font-normal text-muted-foreground cursor-pointer">{occ}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3 text-foreground">Fabric</h4>
        <div className="space-y-2">
          {fabrics.map((fab) => (
            <div key={fab} className="flex items-center space-x-2">
              <Checkbox 
                id={`fab-${fab}`} 
                checked={searchParams.get('fabric') === fab.toLowerCase()}
                onCheckedChange={(checked) => handleFilterChange('fabric', fab.toLowerCase(), checked as boolean)}
              />
              <Label htmlFor={`fab-${fab}`} className="text-sm font-normal text-muted-foreground cursor-pointer">{fab}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
