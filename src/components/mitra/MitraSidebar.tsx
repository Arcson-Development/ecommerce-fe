"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMitra } from "@/lib/mitra";
import {
  LayoutDashboard,
  Inbox,
  Boxes,
  MapPin,
  UserCircle2,
  LogOut,
  ShoppingBag,
  Settings,
} from "lucide-react";

export type MitraSection =
  | "dashboard"
  | "orders"
  | "stock"
  | "address"
  | "account"
  | "settings";

interface MitraSidebarProps {
  active: MitraSection;
}

interface MenuItem {
  key: MitraSection;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const MENU: MenuItem[] = [
  { key: "dashboard", label: "Dasbor", href: "/mitra", icon: LayoutDashboard },
  { key: "orders", label: "Pesanan Masuk", href: "/mitra/orders", icon: Inbox },
  { key: "stock", label: "Stok Produk", href: "/mitra/products", icon: Boxes },
  { key: "settings", label: "Pengaturan Toko", href: "/mitra/settings", icon: Settings },
  { key: "address", label: "Alamat", href: "/mitra/address", icon: MapPin },
  { key: "account", label: "Detail Akun Mitra", href: "/mitra/account", icon: UserCircle2 },
];

export function MitraSidebar({ active }: MitraSidebarProps) {
  const router = useRouter();
  const storeProfile = useMitra((s) => s.storeProfile);
  const storeName = storeProfile?.name || "Toko Anda";
  const storeId = storeProfile?.id ? `#${storeProfile.id.slice(0, 6)}` : "";

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      {/* Header card */}
      <div className="rounded-sm border border-zinc-200 bg-white">
        <div className="px-5 py-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl">
            🐤
          </div>
          <p className="mt-3 text-sm font-semibold text-zinc-900">
            {storeName}
          </p>
          {storeId && <p className="mt-0.5 text-xs text-zinc-500">{storeId}</p>}
        </div>

        <nav className="border-t border-zinc-200 p-2">
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive
                    ? "text-primary-soft-fg"
                    : "text-zinc-500 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="mitra-sidebar-active"
                    className="absolute inset-x-2 -z-10 h-9 rounded-sm bg-primary-soft"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-2">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span>Keluar dari Mode Mitra</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function MitraLayoutHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/mitra" className="hover:text-orange-600">
          Mitra
        </Link>
        {pathname !== "/mitra" && pathname !== "/mitra/orders" && (
          <>
            <span>›</span>
            <span className="font-medium text-zinc-900">{title}</span>
          </>
        )}
      </nav>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
