"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const DEFAULT_MESSAGES = [
  "Free Shipping on orders above ₹2,000",
  "COD Available Across India",
  "Easy 7-Day Returns & Exchange",
  "Call: +91 8660087544",
];

export function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(DEFAULT_MESSAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("homepage_content")
      .select("value")
      .eq("section", "announcement")
      .order("sort_order");

    if (data && data.length > 0) {
      const msgs = data.map((d) => d.value).filter(Boolean) as string[];
      if (msgs.length > 0) setMessages(msgs);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length <= 1 || dismissed) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 400); // Wait for fade out before changing text
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length, dismissed]);

  if (dismissed) return null;

  return (
    <div className="relative w-full bg-[#6B1D1D] text-[#F5E6C8] text-center h-[36px] px-8 text-xs md:text-sm tracking-widest uppercase flex items-center justify-center">
      <p
        className="transition-opacity duration-500 ease-in-out font-medium"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {messages[currentIndex]}
      </p>
      <button 
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5E6C8]/70 hover:text-[#F5E6C8] transition-colors p-1"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
