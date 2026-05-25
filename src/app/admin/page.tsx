"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, Users, AlertTriangle, IndianRupee, TrendingUp } from "lucide-react";

interface Stats {
  ordersToday: number;
  ordersMonth: number;
  revenueToday: number;
  revenueMonth: number;
  totalCustomers: number;
  lowStockCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<{ title: string; stock: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Orders today
      const { data: ordersToday } = await supabase
        .from("orders")
        .select("id, total_amount")
        .gte("created_at", todayStart);

      // Orders this month
      const { data: ordersMonth } = await supabase
        .from("orders")
        .select("id, total_amount")
        .gte("created_at", monthStart);

      // Total customers
      const { count: totalCustomers } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      // Low stock products
      const { data: lowStock } = await supabase
        .from("products")
        .select("title, stock")
        .lt("stock", 5)
        .gt("stock", 0)
        .order("stock", { ascending: true });

      const revToday = (ordersToday || []).reduce((s: any, o: any) => s + Number(o.total_amount), 0);
      const revMonth = (ordersMonth || []).reduce((s: any, o: any) => s + Number(o.total_amount), 0);

      setStats({
        ordersToday: ordersToday?.length || 0,
        ordersMonth: ordersMonth?.length || 0,
        revenueToday: revToday,
        revenueMonth: revMonth,
        totalCustomers: totalCustomers || 0,
        lowStockCount: lowStock?.length || 0,
      });
      setLowStockProducts(lowStock || []);
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Orders Today", value: stats.ordersToday, icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Orders This Month", value: stats.ordersMonth, icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "Revenue Today", value: `₹${stats.revenueToday.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-amber-50 text-amber-600" },
    { label: "Revenue This Month", value: `₹${stats.revenueMonth.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "Low Stock Products", value: stats.lowStockCount, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{card.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low stock table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-[#1a1a2e]">Low Stock Alert</h2>
          </div>
          <div className="divide-y divide-black/5">
            {lowStockProducts.map((p, i) => (
              <div key={i} className="px-6 py-3 flex justify-between items-center text-sm">
                <span className="text-gray-700">{p.title}</span>
                <span className="bg-red-100 text-red-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
