"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, ShoppingCart, Package, Users, Ticket, LogOut, Menu, X, Home, Eye, Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from "lucide-react";
import { usePreviewStore } from "@/lib/preview-store";

const ADMIN_EMAIL = "prernasilks@gmail.com";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isPreviewMode, togglePreviewMode, previewDeviceWidth, setDeviceWidth, previewPath, setPreviewPath, refreshKey, triggerRefresh } = usePreviewStore();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/login");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#d4a853] text-sm font-medium tracking-wider">LOADING ADMIN...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f3f0]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-[#1a1a2e] text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-serif font-bold tracking-[0.1em] text-[#d4a853]">PRERNA SILKS</h1>
              <p className="text-[10px] tracking-[0.15em] text-white/50 uppercase mt-0.5">Admin Panel</p>
            </div>
            <button className="md:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#d4a853]/20 text-[#d4a853]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isPreviewMode ? "w-full md:w-[45%] flex-none border-r border-[#C9A84C]" : "w-full"}`}>
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-black/5 flex items-center px-4 md:px-8 sticky top-0 z-30">
          <button className="md:hidden mr-4 text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-medium text-foreground/70 capitalize">
            {pathname === "/admin" ? "Dashboard" : pathname.replace("/admin/", "")}
          </h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs text-muted-foreground">{ADMIN_EMAIL}</span>
            <button
              onClick={togglePreviewMode}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                isPreviewMode 
                  ? "bg-[#6B1D1D] text-white border-[#6B1D1D] hover:bg-[#1A0A0A]" 
                  : "bg-white text-[#6B1D1D] border-[#6B1D1D] hover:bg-[#6B1D1D]/5"
              }`}
            >
              <Eye className="h-4 w-4" />
              {isPreviewMode ? "Close Preview" : "Preview Site"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Live Preview Panel */}
      {isPreviewMode && (
        <div className="hidden md:flex flex-1 flex-col h-screen sticky top-0 bg-gray-50/50">
          {/* Preview Toolbar */}
          <div className="h-14 bg-white border-b border-black/5 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setDeviceWidth("375px")} 
                className={`p-1.5 rounded-md transition-colors ${previewDeviceWidth === "375px" ? "bg-white shadow-sm text-[#1A0A0A]" : "text-gray-500 hover:text-gray-700"}`}
                title="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setDeviceWidth("768px")} 
                className={`p-1.5 rounded-md transition-colors ${previewDeviceWidth === "768px" ? "bg-white shadow-sm text-[#1A0A0A]" : "text-gray-500 hover:text-gray-700"}`}
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setDeviceWidth("100%")} 
                className={`p-1.5 rounded-md transition-colors ${previewDeviceWidth === "100%" ? "bg-white shadow-sm text-[#1A0A0A]" : "text-gray-500 hover:text-gray-700"}`}
                title="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={previewPath}
                onChange={(e) => setPreviewPath(e.target.value)}
                className="text-xs border-gray-200 rounded-md bg-gray-50 px-2 py-1 outline-none"
              >
                <option value="/">Homepage</option>
                <option value="/products">Products</option>
                <option value="/about">About</option>
                <option value="/contact">Contact</option>
                <option value="/blog">Blog</option>
              </select>

              <button onClick={triggerRefresh} className="p-1.5 text-gray-500 hover:text-[#1A0A0A] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors" title="Refresh Preview">
                <RefreshCw className="h-4 w-4" />
              </button>
              <a href={previewPath} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-[#1A0A0A] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors" title="Open in New Tab">
                <ExternalLink className="h-4 w-4" />
              </a>
              <button onClick={togglePreviewMode} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-md transition-colors" title="Close Preview">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Iframe Container */}
          <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
            <div 
              className="h-full bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden transition-all duration-300"
              style={{ width: previewDeviceWidth }}
            >
              <iframe
                key={refreshKey}
                src={previewPath}
                className="w-full h-full border-none"
                title="Live Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
