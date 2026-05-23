"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCustomers = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);

    // Get users from public.users (now has email column via trigger)
    const { data: usersData, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !usersData || usersData.length === 0) {
      // Fallback: try to get current session user as a minimum
      setCustomers([]);
      setLoading(false);
      return;
    }

    // Get order counts per user
    const { data: ordersData } = await supabase
      .from("orders")
      .select("user_id, total_amount");

    const orderMap: Record<string, { count: number; spent: number }> = {};
    (ordersData || []).forEach((o) => {
      if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, spent: 0 };
      orderMap[o.user_id].count++;
      orderMap[o.user_id].spent += Number(o.total_amount);
    });

    const enriched: Customer[] = usersData.map((u) => ({
      id: u.id,
      email: u.email || "—",
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
      created_at: u.created_at,
      order_count: orderMap[u.id]?.count || 0,
      total_spent: orderMap[u.id]?.spent || 0,
    }));

    setCustomers(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Customers ({customers.length})</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-2">No customers found.</p>
          <p className="text-xs text-gray-400">Make sure you&apos;ve run the <code className="bg-gray-100 px-1 rounded">fix-users-trigger.sql</code> script in Supabase.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center text-xs font-bold uppercase">
                          {(c.first_name?.[0] || c.email?.[0] || "?")}
                        </div>
                        <span className="font-medium text-gray-800">
                          {c.first_name || c.last_name ? `${c.first_name || ""} ${c.last_name || ""}`.trim() : c.email?.split("@")[0] || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{c.email}</td>
                    <td className="px-6 py-3 text-gray-500">{c.phone || "—"}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {c.order_count}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-[#1a1a2e]">₹{(c.total_spent || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
