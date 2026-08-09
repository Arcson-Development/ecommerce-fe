"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Users,
  Store,
  ShoppingBag,
  Building2,
  Truck,
  Package,
  CreditCard,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalRevenue: number;
  pendingStores: number;
  totalProducts: number;
  activeMarkets: number;
  activeShippings: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api.get("/admin/dashboard");
        setStats(data);
      } catch (e) {
        // Fallback: load from individual endpoints
        try {
          const [usersData, storesData, ordersData, shippingsData, marketsData] = await Promise.all([
            api.get("/admin/users"),
            api.get("/admin/stores"),
            api.get("/orders").catch(() => []),
            api.get("/admin/shippings"),
            api.get("/markets/admin"),
          ]);
          setStats({
            totalUsers: usersData?.length || 0,
            totalStores: storesData?.length || 0,
            totalOrders: ordersData?.length || 0,
            totalRevenue: 0,
            pendingStores: storesData?.filter((s: any) => s.status === "REVIEW").length || 0,
            totalProducts: 0,
            activeMarkets: marketsData?.filter((m: any) => m.isActive).length || 0,
            activeShippings: shippingsData?.filter((s: any) => s.isActive).length || 0,
            recentOrders: Array.isArray(ordersData) ? ordersData.slice(0, 5) : [],
          });
        } catch (err) {
          console.error("Fallback failed", err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-ink">
        Memuat Dashboard...
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-primary-soft text-primary-soft-fg",
      href: "/admin/users",
    },
    {
      label: "Total Mitra Toko",
      value: stats?.totalStores ?? 0,
      icon: Store,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/mitra",
      sub: stats && stats.pendingStores > 0 ? `${stats.pendingStores} perlu review` : undefined,
    },
    {
      label: "Total Pesanan",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-600",
      href: "#recent-orders",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}`,
      icon: CreditCard,
      color: "bg-indigo-50 text-indigo-600",
      href: "#recent-orders",
    },
    {
      label: "Total Produk",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/products",
    },
    {
      label: "Pasar Aktif",
      value: stats?.activeMarkets ?? 0,
      icon: Building2,
      color: "bg-cyan-50 text-cyan-600",
      href: "/admin/markets",
    },
    {
      label: "Kurir Aktif",
      value: stats?.activeShippings ?? 0,
      icon: Truck,
      color: "bg-danger/10 text-danger",
      href: "/admin/shipping",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-muted-ink mt-1">
          Selamat datang kembali, <span className="font-semibold text-ink">{user?.username}</span>. Berikut ringkasan sistem EKRAF Kiosk.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-line rounded-sm p-5 hover:shadow-md hover:border-line transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-sm ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-muted-ink transition-colors" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-ink">{card.value}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-ink mt-1">
                    {card.label}
                  </p>
                  {card.sub && (
                    <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {card.sub}
                    </p>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Manage Users", href: "/admin/users", icon: Users, desc: "Ubah role & data user" },
            { label: "Kelola Mitra", href: "/admin/mitra", icon: Store, desc: "Approval toko mitra" },
            { label: "Master Kurir", href: "/admin/shipping", icon: Truck, desc: "Kelola pengiriman" },
            { label: "Master Pasar", href: "/admin/markets", icon: Building2, desc: "Data pasar" },
            { label: "Kategori", href: "/admin/subsectors", icon: Package, desc: "Master kategori" },
            { label: "Pembayaran", href: "/admin/payments", icon: ShoppingBag, desc: "Metode bayar" },
            { label: "Master Produk", href: "/admin/products", icon: Package, desc: "Semua produk" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-line rounded-sm p-4 hover:border-zinc-900 hover:shadow-sm transition-all group"
              >
                <Icon className="h-5 w-5 text-muted-ink group-hover:text-ink mb-2" />
                <p className="text-sm font-semibold text-ink group-hover:text-ink">{item.label}</p>
                <p className="text-xs text-muted-ink mt-0.5">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <section id="recent-orders">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4">
            Pesanan Terbaru
          </h2>
          <div className="bg-white border border-line rounded-sm overflow-x-auto">
            <table className="w-full text-left text-sm text-ink whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-muted-ink border-b border-line">
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-semibold text-ink">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                        order.status === "PROCESSING" ? "bg-primary-soft text-primary-soft-fg" :
                        order.status === "SHIPPED" ? "bg-amber-50 text-amber-700" :
                        order.status === "CANCELLED" ? "bg-danger/10 text-danger" :
                        "bg-zinc-50 text-muted-ink"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      Rp {order.total?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-ink">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
