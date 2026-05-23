"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DragDropUpload } from "@/components/admin/DragDropUpload";
import { toast } from "sonner";
import { Save, Plus, Trash2, Star, Search, AlertCircle, Clock, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePreviewStore } from "@/lib/preview-store";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "hero" | "categories" | "announcements" | "featured" | "video" | "reels" | "testimonials" | "occasions" | "lookbook";

interface ContentRow {
  id?: string;
  section: string;
  key: string;
  value: string;
  image_url: string;
  sort_order: number;
}

export default function AdminHomepagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  
  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero / Banner" },
    { id: "categories", label: "Category Images" },
    { id: "announcements", label: "Announcement Bar" },
    { id: "featured", label: "Featured Collection" },
    { id: "video", label: "Video Banner" },
    { id: "reels", label: "Shoppable Reels" },
    { id: "testimonials", label: "Testimonials" },
    { id: "occasions", label: "Shop by Occasion" },
    { id: "lookbook", label: "Our Lookbook" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Homepage Content Manager</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#1a1a2e] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6 md:p-8">
        {activeTab === "hero" && <HeroTab  />}
        {activeTab === "categories" && <CategoriesTab  />}
        {activeTab === "announcements" && <AnnouncementsTab  />}
        {activeTab === "featured" && <FeaturedTab  />}
        {activeTab === "video" && <VideoBannerTab  />}
        {activeTab === "reels" && <ReelsTab  />}
        {activeTab === "testimonials" && <TestimonialsTab  />}
        {activeTab === "occasions" && <OccasionsTab  />}
        {activeTab === "lookbook" && <LookbookTab  />}
      </div>
    </div>
  );
}

interface HeroSlideData {
  key: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  isActive?: boolean;
  gradient?: string;
}

/* ── HERO TAB ────────────────────────────────── */
function HeroTab() {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const router = useRouter();
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "hero_slides");

    if (data && data.length > 0) {
      const parsedSlides = data.sort((a,b) => a.key.localeCompare(b.key)).map(row => {
        try {
          return { key: row.key, ...JSON.parse(row.value) };
        } catch { return null; }
      }).filter(Boolean);
      setSlides(parsedSlides);
    } else {
      setSlides([
        {
          key: "slide_1",
          title: "Draped in Timeless Elegance",
          subtitle: "Handpicked sarees from across India, crafted for the modern woman.",
          ctaText: "Shop Now",
          ctaLink: "/products",
          imageUrl: "",
          isActive: true,
          gradient: "#6B1D1D"
        }
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateSlide = (idx: number, field: keyof HeroSlideData, value: unknown) => {
    const newSlides = [...slides];
    newSlides[idx] = { ...newSlides[idx], [field]: value };
    setSlides(newSlides);
    setHasUnsavedChanges(true);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return toast.error("Must have at least 1 slide.");
    const newSlides = [...slides];
    newSlides.splice(idx, 1);
    setSlides(newSlides);
    setHasUnsavedChanges(true);
  };

  const addSlide = () => {
    if (slides.length >= 5) return toast.error("Maximum 5 slides allowed.");
    setSlides([...slides, {
      key: `slide_${Date.now()}`,
      title: "New Slide",
      subtitle: "",
      ctaText: "Shop Now",
      ctaLink: "/products",
      imageUrl: "",
      isActive: true,
      gradient: "#1A0A0A"
    }]);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideData = {
          title: slide.title || "",
          subtitle: slide.subtitle || "",
          ctaText: slide.ctaText || "",
          ctaLink: slide.ctaLink || "",
          imageUrl: slide.imageUrl || "",
          isActive: slide.isActive ?? true,
          gradient: slide.gradient || "#6B1D1D"
        };
        
        const item = {
          section: "hero_slides",
          key: slide.key || `slide_${i + 1}`,
          value: JSON.stringify(slideData),
          image_url: slide.imageUrl || "",
          sort_order: i
        };
        const { error } = await supabase.from("homepage_content").upsert(item, { onConflict: "section,key" });
        if (error) throw error;
      }
      
      // Trigger background revalidation to prevent Next.js dev deadlocks
      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });

      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Hero slides saved!");
      router.refresh();
      triggerRefresh();
    } catch (err) {
      console.error("Hero slides save error:", err);
      toast.error("Failed to save hero slides: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  );

  return (
    <div className="space-y-8">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div className="space-y-10">
        {slides.map((slide, idx) => (
          <div key={slide.key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-serif text-xl font-bold text-[#1a1a2e]">Slide {idx + 1}</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                  <input type="checkbox" checked={slide.isActive} onChange={(e) => updateSlide(idx, "isActive", e.target.checked)} className="h-4 w-4 text-[#C9A84C]" />
                  Active
                </label>
                <button onClick={() => removeSlide(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Editor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Background Image</label>
                {slide.imageUrl ? (
                  <div className="relative h-[200px] w-full rounded-lg overflow-hidden bg-black mb-4 group">
                    <Image src={slide.imageUrl} alt="Hero" fill className="object-cover opacity-80" />
                    <button
                      onClick={() => updateSlide(idx, "imageUrl", "")}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <DragDropUpload
                    bucket="homepage-images"
                    folder="hero"
                    maxFiles={1}
                    onUploadComplete={(urls) => { 
                      updateSlide(idx, "imageUrl", urls[0]);
                      setHasUnsavedChanges(true); // Redundant since updateSlide sets it but good to be explicit
                    }}
                  />
                )}
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Fallback Gradient</label>
                  <input type="color" value={slide.gradient} onChange={(e) => updateSlide(idx, "gradient", e.target.value)} className="w-full h-10 rounded border border-gray-200" />
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Title</label>
                  <input type="text" value={slide.title} onChange={(e) => updateSlide(idx, "title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Subtitle</label>
                  <textarea value={slide.subtitle} onChange={(e) => updateSlide(idx, "subtitle", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-[#C9A84C] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">CTA Text</label>
                    <input type="text" value={slide.ctaText} onChange={(e) => updateSlide(idx, "ctaText", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-[#C9A84C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">CTA Link</label>
                    <input type="text" value={slide.ctaLink} onChange={(e) => updateSlide(idx, "ctaLink", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-[#C9A84C]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button onClick={addSlide} className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 font-semibold transition-all">
          <Plus className="h-4 w-4" /> Add Slide
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges 
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20" 
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Slides"}
        </button>
        
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CATEGORIES TAB ──────────────────────────── */
function CategoriesTab() {
  const [categories, setCategories] = useState<ContentRow[]>([]);
  const [saving, setSaving] = useState(false);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const defaultCategories = [
    { key: "silk-sarees", value: "Silk Sarees", image_url: "/images/products/saree-2.jpg", sort_order: 1 },
    { key: "banarasi-sarees", value: "Banarasi Sarees", image_url: "/images/products/saree-3.jpg", sort_order: 2 },
    { key: "cotton-sarees", value: "Cotton Sarees", image_url: "/images/products/saree-4.jpg", sort_order: 3 },
    { key: "designer-sarees", value: "Designer Sarees", image_url: "/images/products/saree-5.jpg", sort_order: 4 },
    { key: "bridal-sarees", value: "Bridal Sarees", image_url: "/images/products/saree-6.jpg", sort_order: 5 },
    { key: "casual-wear", value: "Casual Wear", image_url: "/images/products/saree-7.jpg", sort_order: 6 },
  ];

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "category")
      .order("sort_order");

    if (data && data.length > 0) {
      setCategories(data);
    } else {
      setCategories(defaultCategories.map((c) => ({ ...c, section: "category" })));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateCategory = (idx: number, field: string, val: string) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      let success = true;
      for (const cat of categories) {
        const { error } = await supabase.from("homepage_content").upsert(
          { section: "category", key: cat.key, value: cat.value, image_url: cat.image_url, sort_order: cat.sort_order },
          { onConflict: "section,key" }
        );
        if (error) {
          console.error("Upsert category error:", error);
          toast.error(`Failed to save "${cat.value}": ${error.message}`);
          success = false;
          break;
        }
      }
      if (success) {
        // Trigger background revalidation to prevent Next.js dev deadlocks
        fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
          console.warn("Background revalidation warning:", e);
        });
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date().toISOString());
        toast.success("Category images saved!");
        router.refresh();
        await fetchData();
        triggerRefresh();
      }
    } catch (err) {
      console.error("Categories save error:", err);
      toast.error("Failed to save category images: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-1">Category Images</h3>
        <p className="text-xs text-gray-400 mb-6">Upload images for each category shown on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={cat.key} className="border border-gray-200 rounded-lg p-4 space-y-3">
            {cat.image_url ? (
              <div className="relative h-[180px] w-full rounded-lg overflow-hidden bg-gray-100 group">
                <Image src={cat.image_url} alt={cat.value} fill className="object-cover" />
                <button
                  onClick={() => updateCategory(idx, "image_url", "")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-colors shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <DragDropUpload
                bucket="homepage-images"
                folder="categories"
                maxFiles={1}
                autoUpload={true}
                onUploadComplete={(urls) => {
                  updateCategory(idx, "image_url", urls[0]);
                  setHasUnsavedChanges(true);
                }}
              />
            )}
            <input
              type="text"
              value={cat.value}
              onChange={(e) => updateCategory(idx, "value", e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
              placeholder="Category Name"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges 
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20" 
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Category Images"}
        </button>
        
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ANNOUNCEMENTS TAB ───────────────────────── */
function AnnouncementsTab() {
  const [messages, setMessages] = useState<ContentRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "announcement")
      .order("sort_order");

    if (data && data.length > 0) {
      setMessages(data);
    } else {
      setMessages([
        { section: "announcement", key: "message_1", value: "Free shipping on orders above ₹2,000", image_url: "", sort_order: 1 },
        { section: "announcement", key: "message_2", value: "COD available across India", image_url: "", sort_order: 2 },
        { section: "announcement", key: "message_3", value: "Easy 7-day returns & exchange", image_url: "", sort_order: 3 },
        { section: "announcement", key: "message_4", value: "Call us: +91 8660087544", image_url: "", sort_order: 4 },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateMessage = (idx: number, val: string) => {
    setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, value: val } : m)));
    setHasUnsavedChanges(true);
  };

  const addMessage = () => {
    if (messages.length >= 6) {
      toast.error("Maximum 6 messages allowed.");
      return;
    }
    const nextNum = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { section: "announcement", key: `message_${nextNum}`, value: "", image_url: "", sort_order: nextNum },
    ]);
    setHasUnsavedChanges(true);
  };

  const removeMessage = async (idx: number) => {
    const supabase = createClient();
    const msg = messages[idx];
    if (msg.id) {
      const { error } = await supabase.from("homepage_content").delete().eq("id", msg.id);
      if (error) {
        toast.error(`Failed to delete message from database: ${error.message}`);
        return;
      }
    }
    setMessages((prev) => prev.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
    toast.success("Message removed.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      // Delete all existing announcement messages first, then re-insert
      const { error: delError } = await supabase.from("homepage_content").delete().eq("section", "announcement");
      if (delError) {
        toast.error("Failed to update announcements: " + delError.message);
        return;
      }
      
      let success = true;
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!msg.value.trim()) continue;
        const { error } = await supabase.from("homepage_content").upsert(
          { section: "announcement", key: `message_${i + 1}`, value: msg.value.trim(), image_url: "", sort_order: i + 1 },
          { onConflict: "section,key" }
        );
        if (error) {
          toast.error(`Failed to save message #${i + 1}: ${error.message}`);
          success = false;
          break;
        }
      }
      
      if (success) {
        // Trigger background revalidation to prevent Next.js dev deadlocks
        fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
          console.warn("Background revalidation warning:", e);
        });
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date().toISOString());
        toast.success("Announcement messages saved!");
        router.refresh();
        await fetchData();
        triggerRefresh();
      }
    } catch (err) {
      console.error("Announcements save error:", err);
      toast.error("Failed to save announcements: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-1">Announcement Bar Messages</h3>
        <p className="text-xs text-gray-400 mb-6">These messages rotate at the top of every page. Max 6 messages.</p>
      </div>

      <div className="space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-mono w-6 shrink-0">#{idx + 1}</span>
            <input
              type="text"
              value={msg.value}
              onChange={(e) => updateMessage(idx, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
              placeholder="Enter announcement message..."
            />
            <button
              onClick={() => removeMessage(idx)}
              className="text-red-400 hover:text-red-600 transition-colors p-1.5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addMessage}
        className="inline-flex items-center gap-2 text-sm text-[#d4a853] font-medium hover:text-[#b8912e] transition-colors"
      >
        <Plus className="h-4 w-4" /> Add Message
      </button>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges 
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20" 
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Announcements"}
        </button>

        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FEATURED COLLECTION TAB (Enhanced) ─────── */
interface ProductRow {
  id: string;
  title: string;
  price: number;
  image_urls: string[];
  is_featured: boolean;
  featured_sort_order?: number;
}

function FeaturedTab() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);
  const [allProducts, setAllProducts] = useState<ProductRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, title, price, image_urls, is_featured, featured_sort_order")
      .order("title");
    const all = (data || []) as ProductRow[];
    setAllProducts(all);
    setFeaturedProducts(
      all.filter(p => p.is_featured)
        .sort((a, b) => (a.featured_sort_order ?? 99) - (b.featured_sort_order ?? 99))
    );
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToFeatured = async (id: string) => {
    if (featuredProducts.length >= 8) {
      toast.error("Maximum 8 featured products allowed.");
      return;
    }
    const supabase = createClient();
    await supabase.from("products").update({ is_featured: true, featured_sort_order: featuredProducts.length }).eq("id", id);
    toast.success("Product added to featured!");
    setHasUnsavedChanges(true);
    fetchProducts();
  };

  const removeFromFeatured = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").update({ is_featured: false, featured_sort_order: null }).eq("id", id);
    toast.success("Product removed from featured.");
    setHasUnsavedChanges(true);
    fetchProducts();
  };

  const handleDragStart = (idx: number) => { setDragIdx(idx); };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...featuredProducts];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setFeaturedProducts(reordered);
    setDragIdx(idx);
    setHasUnsavedChanges(true);
  };
  const handleDragEnd = () => { setDragIdx(null); };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      for (let i = 0; i < featuredProducts.length; i++) {
        await supabase.from("products").update({ featured_sort_order: i }).eq("id", featuredProducts[i].id);
      }
      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Changes live on website!");
      router.refresh();
      triggerRefresh();
    } catch (err) {
      console.error("Featured save error:", err);
      toast.error("Failed to save order: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const searchResults = allProducts.filter(
    p => !p.is_featured && p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Featured Collection</h3>
          <span className="text-sm font-bold text-[#C9A84C]">{featuredProducts.length}/8 products featured</span>
        </div>
        <p className="text-xs text-gray-400 mb-6">Drag products to reorder. These appear on the homepage Featured section.</p>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featuredProducts.map((product, idx) => (
          <div
            key={product.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`border rounded-lg p-3 bg-white cursor-grab active:cursor-grabbing transition-all ${
              dragIdx === idx ? "border-[#C9A84C] shadow-lg scale-[1.02]" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="relative h-[140px] w-full rounded-md overflow-hidden bg-gray-100 mb-3">
              {product.image_urls?.[0] && (
                <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover" />
              )}
              <button
                onClick={() => removeFromFeatured(product.id)}
                className="absolute top-1.5 right-1.5 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md z-10"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">#{idx + 1}</span>
            </div>
            <p className="text-sm font-medium text-[#1a1a2e] truncate">{product.title}</p>
            <p className="text-xs font-bold text-[#6B1D1D]">₹{Number(product.price).toLocaleString("en-IN")}</p>
          </div>
        ))}
        {featuredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No products featured yet. Search and add below.
          </div>
        )}
      </div>

      {/* Add Products to Featured */}
      <div className="border-t border-gray-100 pt-8">
        <h4 className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-4">Add Products to Featured</h4>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
            placeholder="Search products to add..."
          />
        </div>
        {searchQuery.trim() && (
          <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
            {searchResults.slice(0, 10).map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors">
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  {product.image_urls?.[0] && (
                    <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                  <p className="text-xs text-gray-400">₹{Number(product.price).toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={() => addToFeatured(product.id)}
                  disabled={featuredProducts.length >= 8}
                  className="px-3 py-1.5 bg-[#C9A84C] text-white text-xs font-semibold rounded-md hover:bg-[#b8912e] transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3 w-3 inline mr-1" />Add
                </button>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="py-6 text-center text-gray-400 text-sm">No matching products found.</div>
            )}
          </div>
        )}
      </div>

      {/* Save Order Button */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <button
          onClick={handleSaveOrder}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20"
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save & Publish"}
        </button>
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── VIDEO BANNER TAB ────────────────────────────── */
function VideoBannerTab() {
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "video_banner")
      .eq("key", "hero_video")
      .single();

    if (data) setVideoUrl(data.image_url || "");
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("homepage_content").upsert({
        section: "video_banner",
        key: "hero_video",
        value: "Hero Video",
        image_url: videoUrl,
        sort_order: 1
      }, { onConflict: "section,key" });
      if (error) throw error;

      // Trigger background revalidation to prevent Next.js dev deadlocks
      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });
      setLastSavedAt(new Date().toISOString());
      toast.success("Video Banner saved!");
      router.refresh();
      await fetchData();
      triggerRefresh();
    } catch (err) {
      console.error("Video banner save error:", err);
      toast.error("Failed to save video banner: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a2e] mb-1">Video Banner</h2>
        <p className="text-sm text-gray-500 mb-6">Upload a high-quality video for the homepage banner.</p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
        {videoUrl ? (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black mb-4">
            <video src={videoUrl} controls className="w-full h-full object-contain" />
            <button
              onClick={() => setVideoUrl("")}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <DragDropUpload bucket="videos" maxFiles={1} onUploadComplete={(urls) => setVideoUrl(urls[0])} accept="video/*" />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1a1a2e] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a2a4a] transition-all disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── REELS TAB ────────────────────────────────── */
function ReelsTab() {
  const [reels, setReels] = useState<{ id: string; videoUrl: string; productId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "reels")
      .order("sort_order");

    if (data) {
      setReels(data.map(d => ({
        id: d.key,
        videoUrl: d.image_url || "",
        productId: d.value || ""
      })));
    }
    
    const { data: prodData } = await supabase.from("products").select("id, title");
    if (prodData) setProducts(prodData);
    
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from("homepage_content").delete().eq("section", "reels");
      if (delError) throw delError;
      
      const items = reels.map((r, i) => ({
        section: "reels",
        key: r.id || `reel_${Date.now()}_${i}`,
        value: r.productId,
        image_url: r.videoUrl,
        sort_order: i + 1
      }));
      
      if (items.length > 0) {
        const { error: insError } = await supabase.from("homepage_content").insert(items);
        if (insError) throw insError;
      }
      
      // Trigger background revalidation to prevent Next.js dev deadlocks
      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Reels saved!");
      router.refresh();
      await fetchData();
      triggerRefresh();
    } catch (err) {
      console.error("Reels save error:", err);
      toast.error("Failed to save reels: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const addReel = () => {
    setReels([...reels, { id: `reel_${Date.now()}`, videoUrl: "", productId: "" }]);
    setHasUnsavedChanges(true);
  };

  const removeReel = (id: string) => {
    setReels(reels.filter(r => r.id !== id));
    setHasUnsavedChanges(true);
  };

  const updateReel = (id: string, field: "videoUrl" | "productId", value: string) => {
    setReels(reels.map(r => r.id === id ? { ...r, [field]: value } : r));
    setHasUnsavedChanges(true);
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a2e] mb-1">Shoppable Reels</h2>
          <p className="text-sm text-gray-500">Add short videos and link them to products.</p>
        </div>
        <button
          onClick={addReel}
          className="flex items-center gap-2 bg-[#d4a853] text-white px-4 py-2 rounded-lg hover:bg-[#b8912e] transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Reel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reels.map((reel, index) => (
          <div key={reel.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Reel {index + 1}</span>
              <button onClick={() => removeReel(reel.id)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Video</label>
              {reel.videoUrl ? (
                <div className="relative aspect-[9/16] w-32 rounded-lg overflow-hidden bg-black mx-auto">
                  <video src={reel.videoUrl} className="w-full h-full object-cover" controls />
                  <button onClick={() => updateReel(reel.id, "videoUrl", "")} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-sm hover:bg-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <DragDropUpload bucket="videos" maxFiles={1} onUploadComplete={(urls) => updateReel(reel.id, "videoUrl", urls[0])} accept="video/*" />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Linked Product</label>
              <select
                value={reel.productId}
                onChange={(e) => updateReel(reel.id, "productId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4a853] bg-white text-sm"
              >
                <option value="">Select a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {reels.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No reels added yet.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges 
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20" 
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Reels"}
        </button>

        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TESTIMONIALS TAB ────────────────────────────────── */
function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<{id: string, customer_name: string, customer_city?: string, rating: number, review_text: string, is_active: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerRefresh } = usePreviewStore();

  const fetchTestimonials = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (data) setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase.from("testimonials").update({ is_active: !currentStatus }).eq("id", id);
    // Trigger background revalidation to prevent Next.js dev deadlocks
    fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
      console.warn("Background revalidation warning:", e);
    });
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
    toast.success(currentStatus ? "Testimonial hidden" : "Testimonial published");
    triggerRefresh();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial forever?")) return;
    const supabase = createClient();
    await supabase.from("testimonials").delete().eq("id", id);
    // Trigger background revalidation to prevent Next.js dev deadlocks
    fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
      console.warn("Background revalidation warning:", e);
    });
    setTestimonials(prev => prev.filter(t => t.id !== id));
    toast.success("Testimonial deleted");
    triggerRefresh();
  };

  if (loading) return <div className="py-8 text-center text-gray-500 animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a2e] mb-1">Testimonials & Reviews</h2>
        <p className="text-sm text-gray-500 mb-6">Manage customer reviews. Only active ones will be shown publicly.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Rating</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Review</th>
              <th className="px-6 py-3 font-semibold text-gray-600 text-center">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {testimonials.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1a1a2e]">{t.customer_name}</p>
                  {t.customer_city && <p className="text-xs text-gray-500">{t.customer_city}</p>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`h-4 w-4 ${t.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 line-clamp-2 max-w-sm">{t.review_text}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => toggleActive(t.id, t.is_active)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${t.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {t.is_active ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteTestimonial(t.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── OCCASIONS TAB ────────────────────────────── */
interface OccasionData {
  key: string;
  name: string;
  caption: string;
  link: string;
  imageUrl: string;
  isActive: boolean;
}

function OccasionsTab() {
  const defaultOccasions: OccasionData[] = [
    { key: "occasion_featured", name: "Featured (Left Banner)", caption: "Weaves for Every Occasion", link: "/products", imageUrl: "", isActive: true },
    { key: "occasion_bridal", name: "Bridal", caption: "Begin Forever Beautifully", link: "/products?occasion=bridal", imageUrl: "", isActive: true },
    { key: "occasion_festive", name: "Festive", caption: "Celebrate in Colour", link: "/products?occasion=festive", imageUrl: "", isActive: true },
    { key: "occasion_casual", name: "Casual", caption: "Effortless Everyday Grace", link: "/products?occasion=casual", imageUrl: "", isActive: true },
    { key: "occasion_party", name: "Party", caption: "Shine Every Night", link: "/products?occasion=party wear", imageUrl: "", isActive: true },
    { key: "occasion_office", name: "Office", caption: "Poised & Professional", link: "/products?occasion=formal", imageUrl: "", isActive: true },
    { key: "occasion_wedding_guest", name: "Wedding Guest", caption: "Arrive Unforgettable", link: "/products?occasion=festive", imageUrl: "", isActive: true },
  ];

  const [occasions, setOccasions] = useState<OccasionData[]>(defaultOccasions);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "occasions")
      .order("sort_order");

    if (data && data.length > 0) {
      const parsed = data.map(row => {
        try {
          const val = JSON.parse(row.value || "{}");
          return {
            key: row.key,
            name: val.name || row.key.replace("occasion_", ""),
            caption: val.caption || "",
            link: val.link || "/products",
            imageUrl: row.image_url || "",
            isActive: val.isActive ?? true,
          };
        } catch { return null; }
      }).filter(Boolean) as OccasionData[];
      setOccasions(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateOccasion = (idx: number, field: keyof OccasionData, value: unknown) => {
    setOccasions(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      for (let i = 0; i < occasions.length; i++) {
        const occ = occasions[i];
        const item = {
          section: "occasions",
          key: occ.key,
          value: JSON.stringify({ name: occ.name, caption: occ.caption, link: occ.link, isActive: occ.isActive }),
          image_url: occ.imageUrl,
          sort_order: i,
        };
        const { error } = await supabase.from("homepage_content").upsert(item, { onConflict: "section,key" });
        if (error) throw error;
      }
      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Changes live on website!");
      router.refresh();
      triggerRefresh();
    } catch (err) {
      console.error("Occasions save error:", err);
      toast.error("Failed to save occasions: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-[#1a1a2e] mb-1">Shop by Occasion</h3>
        <p className="text-xs text-gray-400 mb-6">Manage the occasion cards shown on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {occasions.map((occ, idx) => (
          <div key={occ.key} className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-serif text-lg font-bold text-[#1a1a2e] uppercase">{occ.name} Occasion</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={occ.isActive}
                  onChange={(e) => updateOccasion(idx, "isActive", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#C9A84C]/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A84C]"></div>
              </label>
            </div>

            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div>
                {occ.imageUrl ? (
                  <div className="relative h-[140px] w-[140px] rounded-lg overflow-hidden bg-gray-100 group">
                    <Image src={occ.imageUrl} alt={occ.name} fill className="object-cover" />
                    <button
                      onClick={() => updateOccasion(idx, "imageUrl", "")}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-[140px] w-[140px]">
                    <DragDropUpload
                      bucket="homepage-images"
                      folder="occasions"
                      maxFiles={1}
                      autoUpload={true}
                      onUploadComplete={(urls) => {
                        updateOccasion(idx, "imageUrl", urls[0]);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    value={occ.name}
                    onChange={(e) => updateOccasion(idx, "name", e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Caption</label>
                  <input
                    type="text"
                    value={occ.caption}
                    onChange={(e) => updateOccasion(idx, "caption", e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Link</label>
                  <input
                    type="text"
                    value={occ.link}
                    onChange={(e) => updateOccasion(idx, "link", e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20"
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Occasions"}
        </button>
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── LOOKBOOK TAB ────────────────────────────── */
interface LookbookItem {
  key: string;
  imageUrl: string;
  caption: string;
  link: string;
}

function LookbookTab() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { triggerRefresh, lastSavedAt, setLastSavedAt } = usePreviewStore();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_content")
      .select("*")
      .eq("section", "lookbook")
      .order("sort_order");

    if (data && data.length > 0) {
      const parsed = data.map(row => {
        try {
          const val = JSON.parse(row.value || "{}");
          return {
            key: row.key,
            imageUrl: row.image_url || "",
            caption: val.caption || "",
            link: val.link || "",
          };
        } catch { return null; }
      }).filter(Boolean) as LookbookItem[];
      setItems(parsed);
    } else {
      // Default 6 empty slots
      setItems(Array.from({ length: 6 }, (_, i) => ({
        key: `lookbook_${i + 1}`,
        imageUrl: "",
        caption: "",
        link: "/products",
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateItem = (idx: number, field: keyof LookbookItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setHasUnsavedChanges(true);
  };

  const addItem = () => {
    if (items.length >= 8) {
      toast.error("Maximum 8 lookbook images allowed.");
      return;
    }
    setItems(prev => [...prev, {
      key: `lookbook_${Date.now()}`,
      imageUrl: "",
      caption: "",
      link: "/products",
    }]);
    setHasUnsavedChanges(true);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      // Delete all existing lookbook entries, then re-insert
      const { error: delError } = await supabase.from("homepage_content").delete().eq("section", "lookbook");
      if (delError) throw delError;

      const inserts = items.map((item, i) => ({
        section: "lookbook",
        key: item.key || `lookbook_${i + 1}`,
        value: JSON.stringify({ caption: item.caption, link: item.link }),
        image_url: item.imageUrl,
        sort_order: i,
      }));

      if (inserts.length > 0) {
        const { error: insError } = await supabase.from("homepage_content").insert(inserts);
        if (insError) throw insError;
      }

      fetch('/api/revalidate', { method: 'POST' }).catch((e) => {
        console.warn("Background revalidation warning:", e);
      });
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      toast.success("Changes live on website!");
      router.refresh();
      await fetchData();
      triggerRefresh();
    } catch (err) {
      console.error("Lookbook save error:", err);
      toast.error("Failed to save lookbook: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Don&apos;t forget to save!
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a2e] mb-1">Our Lookbook</h3>
          <p className="text-xs text-gray-400">Manage the lookbook / Instagram-style image strip on the homepage.</p>
        </div>
        <button
          onClick={addItem}
          disabled={items.length >= 8}
          className="flex items-center gap-2 bg-[#d4a853] text-white px-4 py-2 rounded-lg hover:bg-[#b8912e] transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((item, idx) => (
          <div key={item.key} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white relative">
            <button
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 transition-colors z-10"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {item.imageUrl ? (
              <div className="relative h-[200px] w-full rounded-lg overflow-hidden bg-gray-100 group">
                <Image src={item.imageUrl} alt={item.caption || "Lookbook"} fill className="object-cover" />
                <button
                  onClick={() => updateItem(idx, "imageUrl", "")}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <DragDropUpload
                bucket="homepage-images"
                folder="lookbook"
                maxFiles={1}
                autoUpload={true}
                onUploadComplete={(urls) => {
                  updateItem(idx, "imageUrl", urls[0]);
                }}
              />
            )}

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Caption</label>
              <input
                type="text"
                value={item.caption}
                onChange={(e) => updateItem(idx, "caption", e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
                placeholder="Optional caption"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Link</label>
              <input
                type="text"
                value={item.link}
                onChange={(e) => updateItem(idx, "link", e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#d4a853]/30 focus:border-[#d4a853] outline-none"
                placeholder="/products"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-50 ${
            hasUnsavedChanges
              ? "bg-[#C9A84C] hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/20"
              : "bg-[#1a1a2e] hover:bg-[#1a1a2e]/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Lookbook"}
        </button>
        {lastSavedAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  );
}
