"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  MapPin,
  User,
  CreditCard,
  LogOut,
} from "lucide-react";

export type AccountSection =
  | "dashboard"
  | "orders"
  | "mitra"
  | "addresses"
  | "account"
  | "payment";

interface AccountSidebarProps {
  active: AccountSection;
}

interface MenuItem {
  key: AccountSection;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const MENU: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { key: "orders", label: "Pesanan", href: "/account/orders", icon: Package },
  { key: "mitra", label: "Mitra", href: "/account/mitra", icon: Store },
  { key: "addresses", label: "Alamat", href: "/account/addresses", icon: MapPin },
  { key: "account", label: "Detail Akun", href: "/account/details", icon: User },
  { key: "payment", label: "Metode Pembayaran", href: "/account/payment", icon: CreditCard },
];

export function AccountSidebar({ active }: AccountSidebarProps) {
  const router = useRouter();

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="rounded-sm border border-zinc-200 bg-white">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
            JD
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Akun Saya
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
              Juniko Dwi Putra
            </p>
            <p className="truncate text-xs text-zinc-500">juniko@email.com</p>
          </div>
        </div>

        <nav className="p-2">
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-sm bg-zinc-900"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AccountLayoutHeader({ title }: { title: string }) {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-orange-600">
          Beranda
        </Link>
        <span>›</span>
        <Link href="/account" className="hover:text-orange-600">
          Akun Saya
        </Link>
        {pathname !== "/account" && (
          <>
            <span>›</span>
            <span className="font-medium text-zinc-900">{title}</span>
          </>
        )}
      </nav>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {title}
      </h1>
    </div>
  );
}
