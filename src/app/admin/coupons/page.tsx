"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  expiry_date: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCoupon);
  const [loading, setLoading] = useState(true);
  
  const fetchCoupons = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async () => {
    const supabase = createClient();
    if (!form.code || !form.discount_value) {
      toast.error("Code and discount value are required");
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || 0,
      expiry_date: form.expiry_date || null,
      is_active: true,
    });

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Coupon code already exists" : "Failed to create coupon");
      return;
    }

    toast.success("Coupon created!");
    setShowForm(false);
    setForm(emptyCoupon);
    fetchCoupons();
  };

  const toggleActive = async (coupon: Coupon) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);

    if (error) { toast.error("Failed to update"); return; }
    toast.success(coupon.is_active ? "Coupon disabled" : "Coupon enabled");
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Coupon deleted");
    fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="h-9 px-4 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No coupons yet. Create your first coupon!</div>
      ) : (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Discount</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Min Order</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Expires</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono font-bold text-[#1a1a2e] bg-gray-100 px-2 py-1 rounded text-xs tracking-wider">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-[#1a1a2e]">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₹${Number(coupon.discount_value).toLocaleString("en-IN")}`}
                      </td>
                      <td className="px-6 py-3 text-gray-500">₹{Number(coupon.min_order_amount).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-3 text-gray-500">
                        {coupon.expiry_date
                          ? <span className={isExpired ? "text-red-500" : ""}>{new Date(coupon.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}{isExpired ? " (expired)" : ""}</span>
                          : "No expiry"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${coupon.is_active && !isExpired ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {coupon.is_active && !isExpired ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActive(coupon)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title={coupon.is_active ? "Disable" : "Enable"}>
                            {coupon.is_active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif font-bold text-lg text-[#1a1a2e]">Create Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. WELCOME20" className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#d4a853]/30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a853]/30">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Value</label>
                  <input type="number" value={form.discount_value || ""} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a853]/30" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order Amount (₹)</label>
                <input type="number" value={form.min_order_amount || ""} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a853]/30" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date (optional)</label>
                <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full mt-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a853]/30" />
              </div>

              <button onClick={handleCreate} className="w-full h-10 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors">
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
