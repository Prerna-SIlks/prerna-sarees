"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Search, CheckSquare, Loader2, ImageIcon, AlertCircle, Clock, LayoutGrid, List, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { DragDropUpload } from "@/components/admin/DragDropUpload";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock: number;
  low_stock_threshold: number;
  fabric: string;
  type: string;
  occasion: string;
  care_instructions: string;
  origin: string;
  craft: string;
  is_new_arrival: boolean;
  image_urls: string[];
  category_id: string;
  color?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

const emptyProduct: Partial<Product> = {
  title: "",
  description: "",
  price: 0,
  compare_at_price: null,
  sku: "",
  stock: 0,
  low_stock_threshold: 5,
  fabric: "",
  type: "",
  occasion: "",
  care_instructions: "",
  origin: "",
  craft: "",
  is_new_arrival: false,
  image_urls: [],
  category_id: "",
  color: "",
};

export default function AdminProductsPage() {
  const updatingRef = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"basic" | "images" | "pricing">("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // New state for category view
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  
  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("title");
    setProducts(data || []);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
    setCategories(data || []);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Filter products by search AND active category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.fabric.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategoryId === "all" || p.category_id === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Count products per category
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return products.length;
    return products.filter(p => p.category_id === catId).length;
  };

  const handleSave = async () => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setIsSaving(true);

    const controller = new AbortController();
    const safetyTimer = setTimeout(() => {
      setIsSaving(false);
      updatingRef.current = false;
      controller.abort();
      toast.error('Update timed out. Please try again.');
    }, 30000);

    try {
      if (!editingProduct?.title || !editingProduct?.description) {
        throw new Error("Title and description are required");
      }

      const productData = {
        title: editingProduct.title,
        description: editingProduct.description,
        price: Number(editingProduct.price) || 0,
        compare_at_price: editingProduct.compare_at_price ? Number(editingProduct.compare_at_price) : null,
        sku: editingProduct.sku || null,
        stock: Number(editingProduct.stock) || 0,
        low_stock_threshold: Number(editingProduct.low_stock_threshold) || 5,
        fabric: editingProduct.fabric || "",
        type: editingProduct.type || "",
        occasion: editingProduct.occasion || "",
        care_instructions: editingProduct.care_instructions || "",
        origin: editingProduct.origin || "",
        craft: editingProduct.craft || "",
        is_new_arrival: Boolean(editingProduct.is_new_arrival),
        category_id: editingProduct.category_id || null,
        color: editingProduct.color || "",
        image_urls: editingProduct.image_urls?.length ? editingProduct.image_urls : [],
      };

      const payload = {
        id: editingProduct.id || 'new',
        ...productData
      };

      const response = await fetch('/api/update-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(editingProduct.id ? "Product updated successfully" : "Product added successfully");

      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toISOString());
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      
      fetch('/api/revalidate', { method: 'POST' }).catch(console.error);

    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        console.error('Request was aborted due to timeout');
        return; // Toast is already shown in the timeout callback
      }
      console.error('Product update error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(errorMessage || 'Update failed. Try again.');
    } finally {
      clearTimeout(safetyTimer);
      updatingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete product"); }
    else { toast.success("Product deleted"); fetchProducts(); }
  };

  const handleBulkDelete = async () => {
    const supabase = createClient();
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products?`)) return;

    const { error } = await supabase.from("products").delete().in("id", Array.from(selectedIds));
    if (error) {
      toast.error("Bulk delete failed");
    } else {
      toast.success(`${selectedIds.size} products deleted`);
      setSelectedIds(new Set());
      fetchProducts();
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Category management functions
  const addCategory = async () => {
    const supabase = createClient();
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await supabase.from("categories").insert({
      name: newCategoryName.trim(),
      slug,
      sort_order: categories.length,
    });
    if (error) {
      toast.error("Failed to add category: " + error.message);
    } else {
      toast.success("Category added!");
      setNewCategoryName("");
      fetchCategories();
    }
  };

  const renameCategory = async (id: string) => {
    const supabase = createClient();
    if (!editingCatName.trim()) return;
    const slug = editingCatName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await supabase.from("categories").update({ name: editingCatName.trim(), slug }).eq("id", id);
    if (error) {
      toast.error("Failed to rename: " + error.message);
    } else {
      toast.success("Category renamed!");
      setEditingCatId(null);
      setEditingCatName("");
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    const supabase = createClient();
    const count = products.filter(p => p.category_id === id).length;
    if (count > 0) {
      toast.error(`Cannot delete: ${count} products are in this category. Move them first.`);
      return;
    }
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete category: " + error.message);
    } else {
      toast.success("Category deleted!");
      if (activeCategoryId === id) setActiveCategoryId("all");
      fetchCategories();
    }
  };

  const openAddProductWithCategory = () => {
    const prefilled = { ...emptyProduct };
    if (activeCategoryId !== "all") {
      prefilled.category_id = activeCategoryId;
    }
    setEditingProduct(prefilled);
    setShowForm(true);
    setActiveTab("basic");
  };

  const getStockBadgeClass = (stock: number) => {
    if (stock < 2) return "bg-red-100 text-red-700";
    if (stock <= 5) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Products Inventory</h1>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className="h-9 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete ({selectedIds.size})
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button onClick={openAddProductWithCategory} className="h-9 px-4 bg-[#6B1D1D] text-[#F5E6C8] text-sm font-medium rounded-lg hover:bg-[#6B1D1D]/90 transition-colors flex items-center gap-2 tracking-wide">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveCategoryId("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all border-b-2 ${
            activeCategoryId === "all"
              ? "border-[#C9A84C] text-[#6B1D1D] bg-[#FDF8F0] font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          All ({getCategoryCount("all")})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all border-b-2 ${
              activeCategoryId === cat.id
                ? "border-[#C9A84C] text-[#6B1D1D] bg-[#FDF8F0] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {cat.name} ({getCategoryCount(cat.id)})
          </button>
        ))}
      </div>

      {/* Category Management (Collapsible) */}
      <div className="bg-white rounded-xl border border-black/5 shadow-sm">
        <button
          onClick={() => setShowCategoryManager(!showCategoryManager)}
          className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-600 hover:text-[#1a1a2e] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Manage Categories
          </div>
          {showCategoryManager ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showCategoryManager && (
          <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-4">
            {/* Existing categories as tags */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 bg-[#FDF8F0] border border-[#C9A84C]/20 rounded-lg px-3 py-1.5">
                  {editingCatId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="w-24 text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                        onKeyDown={(e) => { if (e.key === 'Enter') renameCategory(cat.id); if (e.key === 'Escape') setEditingCatId(null); }}
                        autoFocus
                      />
                      <button onClick={() => renameCategory(cat.id)} className="text-green-600 hover:text-green-700 text-xs font-bold">✓</button>
                      <button onClick={() => setEditingCatId(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-[#1a1a2e]">{cat.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({getCategoryCount(cat.id)})</span>
                      <button
                        onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                        className="text-gray-400 hover:text-[#C9A84C] transition-colors ml-1"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add new category */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }}
              />
              <button
                onClick={addCategory}
                disabled={!newCategoryName.trim()}
                className="h-9 px-4 bg-[#C9A84C] text-white text-sm font-medium rounded-lg hover:bg-[#b8912e] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-12 w-10 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-12 text-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">
            {activeCategoryId === "all" ? "No products found" : "No products in this category yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">Add your first product to get started.</p>
          <button
            onClick={openAddProductWithCategory}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B1D1D] text-[#F5E6C8] text-sm font-medium rounded-lg hover:bg-[#6B1D1D]/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add First Product
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div
                className="relative aspect-[3/4] bg-gray-100 cursor-pointer"
                onClick={() => { setEditingProduct({ ...product }); setShowForm(true); setActiveTab("basic"); }}
              >
                {product.image_urls?.[0] ? (
                  <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon className="h-10 w-10 text-gray-300" /></div>
                )}
                {/* Category badge on All tab */}
                {activeCategoryId === "all" && product.category_id && (
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#1a1a2e] px-2 py-0.5 rounded-full shadow-sm">
                    {categories.find(c => c.id === product.category_id)?.name || ""}
                  </span>
                )}
                {/* Stock badge */}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${getStockBadgeClass(product.stock)}`}>
                  {product.stock} in stock
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[#1a1a2e] line-clamp-2 mb-1 min-h-[2.5rem]">{product.title}</h3>
                <p className="text-sm font-bold text-[#6B1D1D] mb-2">₹{Number(product.price).toLocaleString("en-IN")}</p>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => { setEditingProduct({ ...product }); setShowForm(true); setActiveTab("basic"); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View (existing table) */
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-[#FDF8F0]">
                  <th className="px-4 py-3 w-10 text-left">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-[#C9A84C]">
                      <CheckSquare className={`h-5 w-5 ${selectedIds.size > 0 ? "text-[#C9A84C]" : ""}`} />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider w-12">Img</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider">Product Info</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider">SKU & Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#1a1a2e] text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`transition-colors ${selectedIds.has(product.id) ? "bg-[#C9A84C]/5" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelection(product.id)} className="text-gray-400">
                        <CheckSquare className={`h-5 w-5 ${selectedIds.has(product.id) ? "text-[#C9A84C]" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative h-12 w-10 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                        {product.image_urls?.[0] ? (
                          <Image src={product.image_urls[0]} alt={product.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><ImageIcon className="h-4 w-4 text-gray-300" /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1a1a2e] truncate max-w-[200px]">{product.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{product.fabric} • {product.type}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded inline-block">{product.sku || "N/A"}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{categories.find(c => c.id === product.category_id)?.name || "Uncategorized"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#6B1D1D]">₹{Number(product.price).toLocaleString("en-IN")}</p>
                      {product.compare_at_price && (
                        <p className="text-xs text-gray-400 line-through">₹{Number(product.compare_at_price).toLocaleString("en-IN")}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStockBadgeClass(product.stock)}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingProduct({ ...product }); setShowForm(true); setActiveTab("basic"); }} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Tabbed Modal — PRESERVED EXACTLY */}
      {showForm && editingProduct && (
        <div className="fixed inset-0 bg-[#1A0A0A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#1a1a2e]">{editingProduct.id ? "Edit Product" : "Add New Product"}</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to list your product.</p>
              </div>
              <div className="flex items-center gap-4">
                {hasUnsavedChanges && (
                  <div className="hidden sm:flex bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg items-center gap-2 text-xs font-medium">
                    <AlertCircle className="h-3.5 w-3.5" /> Unsaved changes
                  </div>
                )}
                <button onClick={() => setShowForm(false)} className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex px-6 border-b border-gray-100">
              <button onClick={() => setActiveTab("basic")} className={`py-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-colors ${activeTab === "basic" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Basic Info
              </button>
              <button onClick={() => setActiveTab("images")} className={`py-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-colors ${activeTab === "images" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Media & Images
              </button>
              <button onClick={() => setActiveTab("pricing")} className={`py-4 px-4 text-sm font-semibold tracking-wide border-b-2 transition-colors ${activeTab === "pricing" ? "border-[#C9A84C] text-[#C9A84C]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Pricing & Stock
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              
              {/* Tab 1: Basic Info */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Product Title *</label>
                      <input value={editingProduct.title || ""} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full mt-1.5 h-12 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all" placeholder="e.g. Kanjivaram Silk Saree" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Description *</label>
                      <textarea value={editingProduct.description || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={4} className="w-full mt-1.5 p-4 rounded-xl border border-gray-200 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all resize-none" placeholder="Detailed product description..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Fabric</label>
                      <input value={editingProduct.fabric || ""} onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Category</label>
                      <select value={editingProduct.category_id || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none bg-white">
                        <option value="">Select Category</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Color</label>
                      <input list="color-options" value={editingProduct.color || ""} onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="e.g. Red" />
                      <datalist id="color-options">
                        {["Red", "Pink", "Blue", "Green", "Yellow", "Orange", "Purple", "White", "Ivory", "Black", "Gold", "Silver", "Maroon", "Beige", "Teal", "Navy", "Coral", "Magenta"].map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Occasion</label>
                      <input value={editingProduct.occasion || ""} onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Origin</label>
                      <input value={editingProduct.origin || ""} onChange={(e) => setEditingProduct({ ...editingProduct, origin: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="e.g. Kanchipuram" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Craft</label>
                      <input value={editingProduct.craft || ""} onChange={(e) => setEditingProduct({ ...editingProduct, craft: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="e.g. Handwoven" />
                    </div>
                    <div className="flex items-center h-full pt-6">
                      <label className="flex items-center cursor-pointer gap-2">
                        <input type="checkbox" checked={editingProduct.is_new_arrival || false} onChange={(e) => setEditingProduct({ ...editingProduct, is_new_arrival: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]" />
                        <span className="text-sm font-semibold text-gray-700">Mark as New Arrival</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Care Instructions</label>
                    <input value={editingProduct.care_instructions || ""} onChange={(e) => setEditingProduct({ ...editingProduct, care_instructions: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="e.g. Dry clean only" />
                  </div>
                </div>
              )}

              {/* Tab 2: Images */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Current Images ({editingProduct.image_urls?.length || 0}/6)</h3>
                    <div className="flex flex-wrap gap-4 mb-6">
                      {editingProduct.image_urls?.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative h-32 w-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <Image src={url} alt={`img-${idx}`} fill className="object-cover" />
                          </div>
                          <button
                            onClick={() => {
                              const newUrls = [...(editingProduct.image_urls || [])];
                              newUrls.splice(idx, 1);
                              setEditingProduct({ ...editingProduct, image_urls: newUrls });
                              setHasUnsavedChanges(true);
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MAIN</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Upload New Images</h3>
                    <DragDropUpload
                      bucket="product-images"
                      folder="products"
                      maxFiles={6 - (editingProduct.image_urls?.length || 0)}
                      onUploadComplete={(urls) => {
                        setEditingProduct({ 
                          ...editingProduct, 
                          image_urls: [...(editingProduct.image_urls || []), ...urls] 
                        });
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Pricing & Stock */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Selling Price (₹) *</label>
                      <input type="number" value={editingProduct.price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full mt-1.5 h-12 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">Compare at Price <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-normal">Optional</span></label>
                      <input type="number" value={editingProduct.compare_at_price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: Number(e.target.value) || null })} className="w-full mt-1.5 h-12 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="Original MRP" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-200">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">SKU (Stock Keeping Unit)</label>
                      <input value={editingProduct.sku || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Available Stock</label>
                      <input type="number" value={editingProduct.stock || ""} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Low Stock Threshold</label>
                      <input type="number" value={editingProduct.low_stock_threshold || ""} onChange={(e) => setEditingProduct({ ...editingProduct, low_stock_threshold: Number(e.target.value) })} className="w-full mt-1.5 h-11 px-3 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] outline-none" placeholder="Alert at X items" />
                    </div>
                  </div>
                </div>
              )}
              
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex items-center justify-between">
              {lastSavedAt ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  Last saved: {new Date(lastSavedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              ) : <div />}
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className={`px-8 py-2.5 text-sm font-bold tracking-widest uppercase rounded-xl transition-all disabled:opacity-50 flex items-center ${
                    hasUnsavedChanges 
                      ? "bg-[#C9A84C] text-white hover:bg-[#b8912e] animate-pulse shadow-lg shadow-[#C9A84C]/30" 
                      : "bg-[#6B1D1D] text-[#F5E6C8] hover:bg-[#1a1a2e] shadow-lg shadow-[#6B1D1D]/20"
                  }`}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
