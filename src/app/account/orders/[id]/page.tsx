"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  Package,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");
import { Header } from "@/components/Header";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { useOrders, type Order, type OrderStatus } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  formatOrderDateTime,
} from "@/lib/order-format";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const getOrder = useOrders((s) => s.getOrder);
  const [order, setOrder] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recipientPhotoUrl, setRecipientPhotoUrl] = useState<string>("");

  const refreshOrder = async () => {
    try {
      const data = await getOrder(params.id);
      setOrder(data);
      if (data && (data as any).recipientPhoto) {
        setRecipientPhotoUrl((data as any).recipientPhoto);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getOrder(params.id);
        if (active) {
          setOrder(data);
          if (data && (data as any).recipientPhoto) {
            setRecipientPhotoUrl((data as any).recipientPhoto);
          }
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [params.id, getOrder]);

  if (loading) {
    return (
      <>
        <TopBar />
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-zinc-500">Memuat detail pesanan...</p>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <TopBar />
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Pesanan tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Pesanan yang kamu cari tidak tersedia atau belum dibuat.
          </p>
          <button
            onClick={() => router.push("/account/orders")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali ke Daftar Pesanan
          </button>
        </main>
      </>
    );
  }

  const meta = ORDER_STATUS_META[order.status as OrderStatus];

  return (
    <>
      <TopBar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/account/orders")}
          className="mb-4 flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke daftar pesanan
        </button>
        <AccountLayoutHeader title={`Pesanan #${order.id}`} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="orders" />

          <div className="space-y-4">
            {/* Status banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-sm border ${meta.bg} p-5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${meta.text}`}>
                    Status Pesanan
                  </p>
                  <p className={`mt-1 text-lg font-semibold ${meta.text}`}>
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Dipesan pada {formatOrderDateTime(order.date)}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="rounded-sm border border-white/50 bg-white/60 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                      No. Resi
                    </p>
                    <p className="font-mono text-sm font-semibold text-zinc-900">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Items */}
            <section className="rounded-sm border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-5 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Produk
                </h3>
              </div>
              <ul className="divide-y divide-zinc-200">
                {order.items.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-zinc-100">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {item.productName} - {item.unit}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.quantity} × {formatRupiah(item.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 text-sm">
                <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
                <Row
                  label="Pengiriman"
                  value={
                    order.shippingCost === 0 ? (
                      <span className="font-medium text-emerald-600">
                        GRATIS
                      </span>
                    ) : (
                      formatRupiah(order.shippingCost)
                    )
                  }
                />
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
              </div>
            </section>

            {/* Shipping + Payment info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={MapPin} title="Alamat Pengiriman">
                <p className="font-medium text-zinc-900">
                  {order.shippingAddress.name}
                </p>
                <p className="text-zinc-600">
                  {order.shippingAddress.phone}
                </p>
                <p className="mt-1 text-zinc-600">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </InfoCard>

              <div className="space-y-4">
                <InfoCard icon={Truck} title="Metode Pengiriman">
                  <p className="font-medium text-zinc-900">
                    {order.shippingMethod}
                  </p>
                </InfoCard>
                <InfoCard icon={CreditCard} title="Metode Pembayaran">
                  <p className="font-medium text-zinc-900">
                    {order.paymentMethod}
                  </p>
                </InfoCard>
              </div>
            </div>

            {/* Bukti Pengiriman & Penerimaan Foto */}
            {(order.status === "shipped" || order.status === "completed") && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                <div className="border border-zinc-200 p-4 rounded-sm bg-zinc-50">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bukti Kirim Kurir Penjual</p>
                  {order.shippingPhoto ? (
                    <div className="relative h-40 w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image
                        src={order.shippingPhoto.startsWith("/uploads") ? `${API_HOST}${order.shippingPhoto}` : order.shippingPhoto}
                        alt="Bukti Kirim Kurir"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">Penjual belum mengunggah foto bukti kirim.</p>
                  )}
                </div>

                <div className="border border-zinc-200 p-4 rounded-sm bg-zinc-50">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bukti Terima Pembeli</p>
                  {order.recipientPhoto ? (
                    <div className="relative h-40 w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image
                        src={order.recipientPhoto.startsWith("/uploads") ? `${API_HOST}${order.recipientPhoto}` : order.recipientPhoto}
                        alt="Bukti Terima"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : order.status === "shipped" ? (
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500">Unggah foto penerimaan (opsional):</p>
                      {recipientPhotoUrl ? (
                        <div className="relative h-32 w-32 overflow-hidden bg-zinc-100 border border-zinc-200 mb-2">
                          <Image
                            src={recipientPhotoUrl.startsWith("/uploads") ? `${API_HOST}${recipientPhotoUrl}` : recipientPhotoUrl}
                            alt="Bukti Terima Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <label className="inline-flex items-center gap-2 cursor-pointer border border-zinc-300 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        {uploading ? "Mengunggah..." : "Pilih / Ambil Foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const token = localStorage.getItem("pasarjaya-token") || JSON.parse(localStorage.getItem("pasarjaya-auth") || "{}")?.state?.token;
                              const res = await fetch(`${API_HOST}/api/uploads/image`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData,
                              });
                              if (!res.ok) throw new Error("Upload failed");
                              const d = await res.json();
                              setRecipientPhotoUrl(d.url);
                              toast.success("Foto berhasil diunggah!");
                            } catch (err) {
                              toast.error("Gagal mengunggah foto.");
                            } finally {
                              setUploading(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">Tidak ada foto bukti penerimaan.</p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {order.status === "shipped" && (
                <button
                  type="button"
                  disabled={updating || uploading}
                  onClick={async () => {
                    setUpdating(true);
                    try {
                      await api.put(`/orders/${order.id}/complete`, {
                        photoUrl: recipientPhotoUrl || undefined,
                      });
                      toast.success("Pesanan berhasil dikonfirmasi selesai!");
                      refreshOrder();
                    } catch (e: any) {
                      toast.error(e.message || "Gagal mengonfirmasi pesanan.");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-700 sm:w-auto sm:px-8 disabled:bg-zinc-400"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  {updating ? "Memproses..." : "Konfirmasi Terima Pesanan"}
                </button>
              )}

              {order.status === "completed" && (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-zinc-900 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 sm:w-auto sm:px-8"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  Beli Lagi
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-zinc-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" strokeWidth={2} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5 text-sm">{children}</div>
    </section>
  );
}
