"use client";

import { Clock, Download } from 'lucide-react';
import { useState } from 'react';

interface InvoiceButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  canDownload: boolean;
}

export default function InvoiceButton({ order, canDownload }: InvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const res = await fetch(`/api/get-order?id=${order.id}`);
      if (!res.ok) throw new Error("Failed to fetch complete order data");
      const { order: completeOrder } = await res.json();
      
      // Dynamic import to avoid SSR issues with jsPDF
      const { generateInvoice } = await import('@/lib/generateInvoice');
      generateInvoice(completeOrder);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!canDownload) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
        <Clock size={16} className="text-amber-500" />
        Invoice available after payment confirmation
      </div>
    );
  }
  
  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 border-2 border-[#C9A84C] text-[#C9A84C] rounded-lg hover:bg-[#C9A84C] hover:text-white transition-all duration-300 text-sm font-semibold shadow-sm disabled:opacity-50"
    >
      <Download size={16} />
      {isGenerating ? "Generating..." : "Download Invoice"}
    </button>
  );
}
