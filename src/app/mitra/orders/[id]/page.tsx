"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Printer, Send, User, MapPin, PackageOpen, Camera } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const STATUS_DESCRIPTION: Record<string, string> = {
  PENDING: "Pesanan baru masuk dan menunggu persetujuan Anda.",
  PROCESSING: "Pesanan sedang disiapkan. Harap unggah bukti pengiriman jika barang sudah dikirim.",
  SHIPPED: "Barang sedang dalam perjalanan ke alamat pembeli.",
  COMPLETED: "Pesanan telah sukses diterima oleh pembeli.",
  CANCELLED: "Pesanan ini telah dibatalkan.",
};

export default function MitraOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shippingPhotoUrl, setShippingPhotoUrl] = useState<string>("");

  async function loadOrder() {
    try {
      const data = await api.get("/mitra/orders");
      const found = data.find((o: any) => o.id === params.id);
      if (found) {
        setOrder(found);
        if (found.shippingPhoto) {
          setShippingPhotoUrl(found.shippingPhoto);
        }
      }
    } catch (e) {
      console.error("Failed to load order details", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleProcessOrder = async () => {
    setUpdating(true);
    try {
      await api.put(`/mitra/orders/${params.id}/process`, {});
      toast.success("Pesanan berhasil diproses!");
      loadOrder();
    } catch (e: any) {
      toast.error(e.message || "Gagal memproses pesanan.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("pasarjaya-token") || JSON.parse(localStorage.getItem("pasarjaya-auth") || "{}")?.state?.token;
      const res = await fetch(`${API_HOST}/api/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setShippingPhotoUrl(data.url);
      toast.success("Bukti foto pengiriman berhasil diunggah!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunggah foto bukti kirim.");
    } finally {
      setUploading(false);
    }
  };

  const handleShipOrder = async () => {
    if (!shippingPhotoUrl) {
      toast.error("Mohon unggah foto bukti pengiriman terlebih dahulu.");
      return;
    }

    setUpdating(true);
    try {
      await api.post(`/mitra/orders/${params.id}/ship`, {
        photoUrl: shippingPhotoUrl,
      });
      toast.success("Pesanan ditandai sebagai dalam pengiriman!");
      loadOrder();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengirim pesanan.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MitraShell>
        <div className="py-16 text-center text-sm text-zinc-500">
          Memuat detail pesanan...
        </div>
      </MitraShell>
    );
  }

  if (!order) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Pesanan tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/mitra/orders")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali
          </button>
        </div>
      </MitraShell>
    );
  }

  const subtotal = order.items?.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  ) || 0;

  const getFullImgUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("/uploads") ? `${API_HOST}${path}` : path;
  };

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="orders" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/mitra/orders")}
              className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Kembali ke Pesanan Masuk
            </button>
          </div>

          {/* Status info card */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm border border-zinc-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  No. Pesanan: {order.orderNumber}
                </h2>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Status: <span className="font-semibold text-zinc-800">{order.status}</span>
                </p>
                <p className="mt-2 text-sm text-zinc-700">
                  {STATUS_DESCRIPTION[order.status]}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                >
                  <Printer className="h-4 w-4" strokeWidth={2} />
                  Print Nota
                </button>
              </div>
            </div>

            {/* Actions depending on status */}
            <div className="mt-6 border-t border-zinc-200 pt-6">
              {order.status === "PENDING" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleProcessOrder}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors disabled:bg-zinc-400"
                >
                  <PackageOpen className="h-4 w-4" />
                  {updating ? "Memproses..." : "Proses Pesanan (Terima)"}
                </button>
              )}

              {order.status === "PROCESSING" && (
                <div className="space-y-4">
                  <div className="border border-dashed border-zinc-200 p-4 bg-zinc-50 rounded-sm">
                    <p className="text-sm font-medium text-zinc-800 mb-3">Foto Bukti Pengiriman (Wajib)</p>
                    
                    {shippingPhotoUrl ? (
                      <div className="relative h-40 w-40 overflow-hidden bg-zinc-100 border border-zinc-200 mb-3">
                        <Image
                          src={getFullImgUrl(shippingPhotoUrl)}
                          alt="Bukti Pengiriman"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}

                    <label className="inline-flex items-center gap-2 cursor-pointer border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      {uploading ? "Mengunggah..." : "Pilih / Ambil Foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadPhoto}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={updating || !shippingPhotoUrl}
                    onClick={handleShipOrder}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {updating ? "Mengirim..." : "Kirim Pesanan (Ubah Status ke SHIPPED)"}
                  </button>
                </div>
              )}

              {/* Show delivery photos if already shipped or completed */}
              {(order.status === "SHIPPED" || order.status === "COMPLETED") && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="border border-zinc-200 p-4 rounded-sm bg-zinc-50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bukti Kirim Penjual</p>
                    {order.shippingPhoto ? (
                      <div className="relative h-40 w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                        <Image
                          src={getFullImgUrl(order.shippingPhoto)}
                          alt="Bukti Kirim"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">Tidak ada foto bukti kirim.</p>
                    )}
                  </div>

                  <div className="border border-zinc-200 p-4 rounded-sm bg-zinc-50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bukti Terima Pembeli</p>
                    {order.recipientPhoto ? (
                      <div className="relative h-40 w-full overflow-hidden bg-zinc-100 border border-zinc-200">
                        <Image
                          src={getFullImgUrl(order.recipientPhoto)}
                          alt="Bukti Terima"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 italic">Belum ada foto konfirmasi terima.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Delivery & Recipient info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Customer info */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-sm border border-zinc-200 bg-white p-6"
            >
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Informasi Pembeli
              </h3>
              <p className="text-sm font-semibold text-zinc-900">
                {order.user?.nickname || "Pelanggan Pasar Jaya"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                No. Telp: {order.user?.phone || "-"}
              </p>
            </motion.section>

            {/* Address info */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-sm border border-zinc-200 bg-white p-6"
            >
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Alamat Pengiriman
              </h3>
              <p className="text-sm text-zinc-800">
                {order.user?.addresses?.[0]?.street || "Alamat lengkap pengiriman"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {order.user?.addresses?.[0]?.district || ""}, {order.user?.addresses?.[0]?.city || ""}, {order.user?.addresses?.[0]?.province || ""} {order.user?.addresses?.[0]?.postalCode || ""}
              </p>
            </motion.section>
          </div>

          {/* Order items Summary */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-sm border border-zinc-200 bg-white"
          >
            <div className="border-b border-zinc-200 px-6 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                Item Pembelian
              </h3>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-zinc-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <span>Produk</span>
              <span className="text-right">Subtotal</span>
            </div>

            <ul className="divide-y divide-zinc-200">
              {order.items?.map((item: any, i: number) => {
                const product = item.variant?.product;
                const rawImg = product?.images?.[0];
                const productImage = rawImg && rawImg.startsWith("/uploads")
                  ? `${API_HOST}${rawImg}`
                  : (rawImg || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");

                return (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-zinc-100">
                        <Image
                          src={productImage}
                          alt={product?.name || "Produk"}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-800">
                          {product?.name || "Produk"} - {item.variant?.name || "Item"}
                        </p>
                        <p className="text-xs text-zinc-500">× {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-900">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-2 border-t border-zinc-200 px-6 py-4 text-sm">
              <Row label="Subtotal" value={formatRupiah(subtotal)} />
              <Row
                label="Pengiriman"
                valueRight={order.shippingMethod}
                value={
                  order.shippingCost === 0 ? (
                    <span className="font-medium text-emerald-600">GRATIS</span>
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

            <div className="border-t border-zinc-200 px-6 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Metode Pembayaran
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900">
                    {order.paymentMethod}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {order.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </MitraShell>
  );
}

function Row({
  label,
  value,
  valueRight,
}: {
  label: string;
  value: React.ReactNode;
  valueRight?: string;
}) {
  return (
    <div className="flex items-center justify-between text-zinc-700">
      <span>
        {label}
        {valueRight && (
          <span className="ml-2 text-xs text-zinc-500">{valueRight}</span>
        )}
      </span>
      <span>{value}</span>
    </div>
  );
}
