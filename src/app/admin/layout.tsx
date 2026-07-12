"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Building2,
  Tag,
  CreditCard,
  Package,
  ChevronDown,
  Shield,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/mitra", label: "Kelola Mitra", icon: Store },
  { href: "/admin/shipping", label: "Master Pengiriman", icon: Truck },
  { href: "/admin/markets", label: "Master Pasar", icon: Building2 },
  { href: "/admin/categories", label: "Master Kategori", icon: Tag },
  { href: "/admin/payments", label: "Pembayaran Global", icon: CreditCard },
  { href: "/admin/products", label: "Master Produk", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to finish hydrating from localStorage
  useEffect(() => {
    if (useAuth.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useAuth.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-sm text-zinc-500">
        Memuat...
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-sm text-zinc-500">
        Mengarahkan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="flex-1 flex">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-auto z-50 h-screen lg:h-auto
            w-64 bg-white border-r border-zinc-200 shrink-0 flex flex-col
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto
          `}
        >
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between lg:justify-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary rounded-sm text-primary-fg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Admin Panel</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Super Administrator</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-fg"
                      : "text-zinc-500 hover:text-primary hover:bg-primary-soft"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout */}
          <div className="p-3 border-t border-zinc-200">
            <button
              onClick={() => {
                logout();
                router.push("/auth");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-sm transition-colors text-rose-500 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-200 bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-zinc-600 hover:text-zinc-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
