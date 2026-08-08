"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import QrDisplay from "@/components/QrDisplay";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Search,
  Smartphone,
  RefreshCw,
} from "lucide-react";

type Step = "subsector" | "region" | "products" | "checkout" | "qris" | "transfer";

interface Subsector {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  unit?: string;
  store?: { name: string };
}

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

const IDLE_TIMEOUT_MS = 60_000;

export default function HomePage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const [step, setStep] = useState<Step>("subsector");
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [selectedSubsector, setSelectedSubsector] = useState<Subsector | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");

  // Checkout form
  const [form, setForm] = useState({
    recipient: "",
    phone: "",
    province: "",
    city: "",
    street: "",
    buyerPhone: "",
  });

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [qrisContent, setQrisContent] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderPaid, setOrderPaid] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regionSearch, setRegionSearch] = useState("");
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [transferQr, setTransferQr] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const lastActivity = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- Auto-login kiosk (shared device account) ----
  // Kredensial TIDAK di bundle — FE minta token dari route API server-side (/api/kiosk-login)
  useEffect(() => {
    async function ensureAuth() {
      if (isAuthenticated) {
        setAuthReady(true);
        return;
      }
      try {
        const res = await fetch("/api/kiosk-login", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data?.token) {
          throw new Error(data?.message || "Gagal autentikasi kiosk");
        }
        // Set token + user langsung ke auth store (tanpa login() yang butuh kredensial)
        useAuth.setState({ token: data.token, user: data.user, isAuthenticated: true });
        setAuthReady(true);
      } catch (e: any) {
        setAuthError(e?.message || "Gagal autentikasi kiosk");
      }
    }
    ensureAuth();
  }, [isAuthenticated, login]);

  // ---- Load subsectors ----
  useEffect(() => {
    if (!authReady) return;
    setLoadError(null);
    api
      .get("/subsectors")
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setSubsectors(list);
      })
      .catch(() => setLoadError("Gagal memuat subsektor. Periksa koneksi."));
  }, [authReady]);

  // ---- Idle → display ----
  useEffect(() => {
    const reset = () => {
      lastActivity.current = Date.now();
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "touchstart", "keydown"];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    timerRef.current = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_TIMEOUT_MS) {
        router.push("/display");
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, reset));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router]);

  // ---- Pilih subsektor → load provinsi ----
  const selectSubsector = useCallback(async (sub: Subsector) => {
    setSelectedSubsector(sub);
    setSelectedProvince(null);
    setSelectedCity(null);
    setProvinces([]);
    setLoadError(null);
    setRegionSearch("");
    try {
      const res = await api.get("/regions/provinces");
      const list = Array.isArray(res) ? res : (res.items || []);
      setProvinces(list);
    } catch {
      setProvinces([]);
      setLoadError("Gagal memuat provinsi. Periksa koneksi.");
    }
    setStep("region");
  }, []);

  // ---- Pilih provinsi → load kota ----
  const selectProvince = useCallback(async (prov: Province) => {
    setSelectedProvince(prov);
    setSelectedCity(null);
    setLoadError(null);
    setRegionSearch("");
    try {
      const res = await api.get(`/regions/provinces/${prov.id}/cities`);
      const list = Array.isArray(res) ? res : (res.items || []);
      setCities(list);
    } catch {
      setCities([]);
      setLoadError("Gagal memuat kota. Periksa koneksi.");
    }
  }, []);

  // ---- Pilih kota → load produk ----
  const selectCity = useCallback(
    async (city: City) => {
      setSelectedCity(city);
      setProductsLoading(true);
      try {
        const res = await api.get(
          `/products?subSectorName=${encodeURIComponent(selectedSubsector?.name || "")}&cityName=${encodeURIComponent(city.name)}&limit=24`
        );
        const list = Array.isArray(res) ? res : (res.items || []);
        const mapped: Product[] = list.map((p: any) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0] || "/no-image.svg",
          price: p.variants?.[0]?.price ?? 0,
          unit: p.unit || "Item",
          store: p.store,
        }));
        setProducts(mapped);
      } catch (e: any) {
        setProducts([]);
        setLoadError("Gagal memuat produk. Periksa koneksi.");
      } finally {
        setProductsLoading(false);
        setStep("products");
      }
    },
    [selectedSubsector]
  );

  const addToCart = (p: Product) => {
    const variantId = p.id;
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === variantId ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i
        );
      }
      return [...prev, { variantId, productId: p.id, name: p.name, image: p.image, price: p.price, quantity: 1 }];
    });
    // Toast feedback (critique P2): umpan balik jelas saat tap produk
    setCartToast(`${p.name} ditambahkan ke keranjang`);
    window.clearTimeout((addToCart as any)._t);
    (addToCart as any)._t = window.setTimeout(() => setCartToast(null), 2200);
  };

  const updateQty = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId ? { ...i, quantity: Math.min(99, Math.max(0, i.quantity + delta)) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ---- Checkout ----
  const handleCheckout = async () => {
    // Resolve nilai alamat: form (jika diedit) fallback ke pilihan wizard (bug prefill P0)
    const province = form.province || selectedProvince?.name || "";
    const city = form.city || selectedCity?.name || "";
    // Validasi per-field (clarify): tunjuk field yang kurang, bukan pesan generik
    if (!form.recipient) {
      setCheckoutError("Lengkapi nama penerima terlebih dahulu.");
      return;
    }
    if (!form.phone) {
      setCheckoutError("Lengkapi nomor HP penerima.");
      return;
    }
    if (!province) {
      setCheckoutError("Pilih provinsi di langkah sebelumnya.");
      return;
    }
    if (!city) {
      setCheckoutError("Pilih kota/kabupaten di langkah sebelumnya.");
      return;
    }
    if (!form.street) {
      setCheckoutError("Lengkapi alamat (nama jalan, nomor rumah, RT/RW).");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      for (const item of cart) {
        await api.post("/cart/items", {
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
      const order = await api.post("/orders/checkout", {
        shippingMethod: "Go-jek",
        shippingCost: 10000,
        paymentMethod: "qris",
        recipient: form.recipient,
        phone: form.phone,
        street: form.street,
        city,
        district: city,
        province,
        postalCode: "00000",
        buyerPhone: form.buyerPhone?.trim() || undefined,
      });
      setOrderId(order.id);
      const qr = order.paymentToken || order.qrContent || "";
      setQrisContent(qr);
      setStep("qris");
    } catch (e: any) {
      setCheckoutError(e?.message || "Checkout gagal. Coba lagi.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ---- Transfer cart kiosk → mobile ("Lanjutkan di HP") ----
  const handleTransferToPhone = async () => {
    setTransferLoading(true);
    setLoadError(null);
    try {
      const res = await api.post("/cart/sessions", {});
      setTransferQr(res?.qrPayload || "");
    } catch (e: any) {
      setLoadError(e?.message || "Gagal membuat QR. Coba lagi.");
    } finally {
      setTransferLoading(false);
    }
  };

  // Polling status pembayaran (critique P0): setelah QR tampil, cek order tiap 8s → PAID = sukses
  useEffect(() => {
    if (step !== "qris" || !orderId || orderPaid) return;
    const t = setInterval(async () => {
      try {
        const o = await api.get(`/orders/${orderId}`);
        if (o?.paymentStatus === "PAID") setOrderPaid(true);
      } catch {
        /* polling lanjut */
      }
    }, 8000);
    return () => clearInterval(t);
  }, [step, orderId, orderPaid]);

  // ---- Render helpers ----
  const bigBtn =
    "flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 min-h-[56px]";

  const backBtn = (onClick: () => void) => (
    <button
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm hover:bg-zinc-100"
      aria-label="Kembali"
    >
      <ArrowLeft className="h-6 w-6" />
    </button>
  );

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-primary-soft p-8 text-center">
        <h1 className="text-2xl font-bold text-primary-soft-fg">EKRAF Kiosk</h1>
        <p className="text-muted-ink">{authError}</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-primary-soft"
      onPointerDown={() => (lastActivity.current = Date.now())}
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-primary px-6 py-4 text-primary-fg">
        <div className="flex items-center gap-3">
          <img src="/ekraf-logo.png" alt="EKRAF" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold leading-tight">EKRAF Kiosk</h1>
            <p className="text-sm opacity-80">Marketplace Ekonomi Kreatif</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary-fg/10 px-4 py-2 text-sm font-semibold">
          <ShoppingBag className="h-5 w-5" />
          {cartCount} item
        </div>
      </header>

      {/* Progress indicator 4 langkah (critique P1) */}
      <div className="flex items-center gap-2 bg-white/60 px-6 py-2">
        {[
          { key: "subsector", label: "Kategori" },
          { key: "region", label: "Wilayah" },
          { key: "products", label: "Produk" },
          { key: "checkout", label: "Bayar" },
        ].map((s, i) => {
          const order = ["subsector", "region", "products", "checkout", "qris"];
          const active = order.indexOf(step);
          const cur = order.indexOf(s.key);
          const state =
            cur < active ? "done" : cur === active ? "current" : "todo";
          return (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  state === "done"
                    ? "bg-success text-white"
                    : state === "current"
                      ? "bg-primary text-primary-fg"
                      : "bg-zinc-200 text-muted-ink"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </div>
              <span
                className={`hidden text-sm font-semibold sm:block ${
                  state === "current" ? "text-primary-soft-fg" : "text-muted-ink"
                }`}
              >
                {s.label}
              </span>
              {i < 3 && <div className={`h-1 flex-1 rounded ${cur < active ? "bg-success" : "bg-zinc-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* Toast add-to-cart (critique P2) */}
      {cartToast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-base font-semibold text-white shadow-lg">
          ✓ {cartToast}
        </div>
      )}

      {/* Error banner + retry (critique P1) */}
      {loadError && (
        <div className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-danger">
          <span className="font-semibold">{loadError}</span>
          <button
            onClick={() => {
              setLoadError(null);
              if (step === "subsector") {
                api.get("/subsectors").then((r) => setSubsectors(Array.isArray(r) ? r : [])).catch(() => setLoadError("Gagal memuat subsektor."));
              } else if (step === "region" && !selectedProvince) {
                selectSubsector(selectedSubsector!);
              } else if (step === "region" && selectedProvince) {
                selectProvince(selectedProvince);
              } else if (step === "products") {
                selectCity(selectedCity!);
              }
            }}
            className="rounded-full bg-danger px-5 py-2 text-sm font-bold text-white"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Step 1: Subsector */}
      {step === "subsector" && (
        <main className="flex flex-1 flex-col p-6 sm:p-10">
          <h2 className="mb-2 text-3xl font-bold text-primary-soft-fg sm:text-4xl">
            Apa yang kamu cari?
          </h2>
          <p className="mb-8 text-lg text-muted-ink">
            Pilih salah satu dari 17 subsektor ekonomi kreatif
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {subsectors.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSubsector(s)}
                className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
              >
                <span className="text-5xl">{s.icon || "🎨"}</span>
                <span className="text-center text-lg font-semibold text-ink">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {/* Step 2: Region (provinsi → kota) */}
      {step === "region" && (
        <main className="flex flex-1 flex-col p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-4">
            {backBtn(() => setStep("subsector"))}
            <div>
              <h2 className="text-3xl font-bold text-primary-soft-fg">
                {selectedSubsector?.icon} {selectedSubsector?.name}
              </h2>
              <p className="text-muted-ink">
                {selectedProvince
                  ? "Sekarang pilih kota/kabupaten"
                  : "Pilih provinsi tempat kamu berada"}
              </p>
            </div>
          </div>

          {!selectedProvince ? (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
                <Search className="h-6 w-6 text-muted-ink" />
                <input
                  type="text"
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  placeholder="Cari provinsi..."
                  className="w-full bg-transparent text-lg text-ink placeholder:text-muted-ink focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {provinces
                  .filter((p) => p.name.toLowerCase().includes(regionSearch.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProvince(p)}
                      className="flex min-h-[90px] items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <span className="text-left text-lg font-semibold text-ink">{p.name}</span>
                      <ChevronRight className="h-6 w-6 shrink-0 text-muted-ink" />
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm">
                <Search className="h-6 w-6 text-muted-ink" />
                <input
                  type="text"
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                  placeholder="Cari kota/kabupaten..."
                  className="w-full bg-transparent text-lg text-ink placeholder:text-muted-ink focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {cities
                  .filter((c) => c.name.toLowerCase().includes(regionSearch.toLowerCase()))
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCity(c)}
                      className="flex min-h-[90px] items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
                    >
                      <span className="text-left text-lg font-semibold text-ink">{c.name}</span>
                      <ChevronRight className="h-6 w-6 shrink-0 text-muted-ink" />
                    </button>
                  ))}
              </div>
            </>
          )}
        </main>
      )}

      {/* Step 3: Products */}
      {step === "products" && (
        <main className="flex flex-1 flex-col p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-4">
            {backBtn(() => setStep("region"))}
            <div>
              <h2 className="text-3xl font-bold text-primary-soft-fg">
                {selectedSubsector?.icon} {selectedSubsector?.name}
              </h2>
              <p className="flex items-center gap-1 text-muted-ink">
                <MapPin className="h-4 w-4" /> {selectedProvince?.name} · {selectedCity?.name}
              </p>
            </div>
          </div>

          {productsLoading ? (
            <div className="flex flex-1 items-center justify-center gap-3 text-muted-ink">
              <Loader2 className="h-8 w-8 animate-spin" /> Memuat produk...
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-xl text-muted-ink">
                Belum ada produk di {selectedSubsector?.name} untuk {selectedCity?.name}
              </p>
              <button onClick={() => setStep("region")} className={bigBtn}>
                <ArrowLeft className="h-5 w-5" /> Pilih wilayah lain
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-primary-soft">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#5c3a05] shadow-lg transition-transform group-hover:scale-110">
                      <Plus className="h-7 w-7" strokeWidth={3} />
                    </span>
                  </div>
                  <div className="p-5 text-left">
                    <h3 className="line-clamp-1 text-lg font-semibold text-ink">{p.name}</h3>
                    <p className="mt-1 text-base text-muted-ink">{p.store?.name || "Toko Kreatif"}</p>
                    <p className="mt-2 text-2xl font-bold text-primary-soft-fg">
                      Rp{p.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Cart bar */}
          {cartCount > 0 && (
            <div className="sticky bottom-6 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-4 text-primary-fg shadow-lg">
              <div>
                <p className="text-base opacity-80">{cartCount} item dipilih</p>
                <p className="text-3xl font-bold">Rp{cartTotal.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTransferQr(null);
                    handleTransferToPhone();
                    setStep("transfer");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-4 text-lg font-bold text-primary-fg transition-colors hover:bg-white/25"
                >
                  <Smartphone className="h-6 w-6" /> Lanjutkan di HP
                </button>
                <button
                  onClick={() => setStep("checkout")}
                  className="flex items-center gap-2 rounded-xl bg-accent px-6 py-4 text-xl font-bold text-[#5c3a05] transition-colors hover:bg-accent-hover"
                >
                  Lanjut <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Step 4: Checkout */}
      {step === "checkout" && (
        <main className="flex flex-1 flex-col p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-4">
            {backBtn(() => setStep("products"))}
            <h2 className="text-3xl font-bold text-primary-soft-fg">Konfirmasi Pesanan</h2>
          </div>

          {cart.length === 0 ? (
            /* Empty state cart (onboard) */
            <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-2xl bg-white p-10 text-center shadow-sm">
              <ShoppingBag className="h-16 w-16 text-muted-ink" />
              <div>
                <p className="text-2xl font-bold text-ink">Keranjang masih kosong</p>
                <p className="mt-1 text-lg text-muted-ink">
                  Pilih produk dulu untuk mulai berbelanja.
                </p>
              </div>
              <button onClick={() => setStep("products")} className={bigBtn}>
                <ArrowLeft className="h-5 w-5" /> Pilih Produk
              </button>
            </div>
          ) : (

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cart summary */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-ink">Keranjang</h3>
              <ul className="space-y-3">
                {cart.map((i) => (
                  <li key={i.variantId} className="flex items-center gap-3">
                    <img src={i.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-semibold text-ink">{i.name}</p>
                      <p className="text-sm text-muted-ink">
                        Rp{i.price.toLocaleString("id-ID")} × {i.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(i.variantId, -1)}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95"
                        aria-label="Kurangi"
                      >
                        <Minus className="h-6 w-6" />
                      </button>
                      <span className="w-10 text-center text-xl font-bold">{i.quantity}</span>
                      <button
                        onClick={() => updateQty(i.variantId, 1)}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95"
                        aria-label="Tambah"
                      >
                        <Plus className="h-6 w-6" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(i.variantId)}
                      className="text-muted-ink hover:text-danger"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-zinc-100 pt-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-soft-fg">Rp{cartTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Shipping form */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
                <MapPin className="h-5 w-5 text-primary" /> Data Pengiriman
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Nama Penerima</label>
                  <input
                    type="text"
                    value={form.recipient}
                    onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                    placeholder="Nama lengkap"
                    className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">No. HP</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">
                    No. HP Akun EKRAF <span className="font-normal text-muted-ink">(opsional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.buyerPhone}
                    onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                    placeholder="08xxxxxxxxxx — untuk melacak pesanan di aplikasi EKRAF"
                    className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1 text-sm text-muted-ink">
                    Kalau nomor terdaftar di aplikasi EKRAF, pesanan ini otomatis muncul di riwayat akun kamu.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">Provinsi</label>
                    <input
                      type="text"
                      value={form.province || selectedProvince?.name || ""}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      placeholder="Provinsi"
                      className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">Kota/Kabupaten</label>
                    <input
                      type="text"
                      value={form.city || selectedCity?.name || ""}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Kota"
                      className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Alamat Lengkap</label>
                  <textarea
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="Jalan, nomor rumah, patokan"
                    rows={3}
                    className="w-full rounded-xl border border-line px-4 py-3 text-base focus:border-accent focus:outline-none"
                  />
                </div>

                {checkoutError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{checkoutError}</p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-lg font-bold text-[#5c3a05] transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      Bayar dengan QRIS <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          )}
        </main>
      )}

      {/* Step Transfer: lanjutkan di HP */}
      {step === "transfer" && (
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-10 text-center">
          <div className="flex items-center gap-2 rounded-full bg-accent-soft px-5 py-2 text-accent-hover">
            <Smartphone className="h-5 w-5" />
            <span className="font-semibold">Lanjutkan di HP</span>
          </div>
          <h2 className="text-4xl font-bold text-primary-soft-fg">Scan untuk Lanjut di HP</h2>
          <p className="max-w-xl text-xl text-muted-ink">
            Buka aplikasi <b>EKRAF</b> di HP kamu, lalu scan QR ini — keranjang otomatis pindah ke
            aplikasi dan kamu bisa selesaikan pembayaran di sana.
          </p>
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            {transferQr ? (
              <QrDisplay data={transferQr} size={320} />
            ) : (
              <div className="flex h-[320px] w-[320px] items-center justify-center text-muted-ink">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}
          </div>
          <p className="text-base text-muted-ink">
            {transferLoading
              ? "Menyiapkan QR..."
              : "QR berlaku 30 menit dan hanya bisa dipakai 1 kali."}
          </p>
          <div className="flex gap-4">
            <button onClick={() => setStep("products")} className={bigBtn}>
              <ArrowLeft className="h-5 w-5" /> Kembali
            </button>
            <button
              onClick={() => {
                setTransferQr(null);
                handleTransferToPhone();
              }}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-lg font-bold text-primary-soft-fg shadow-sm transition-colors hover:bg-primary-soft"
            >
              <RefreshCw className="h-5 w-5" /> Buat Ulang QR
            </button>
          </div>
        </main>
      )}

      {/* Step 5: QRIS */}
      {step === "qris" && (
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-10 text-center">
          {orderPaid ? (
            <>
              <CheckCircle2 className="h-24 w-24 text-success" />
              <h2 className="text-4xl font-bold text-primary-soft-fg">Pembayaran Berhasil!</h2>
              <p className="text-xl text-muted-ink">Terima kasih telah mendukung karya kreatif Indonesia.</p>
              <button
                onClick={() => {
                  setCart([]);
                  setOrderPaid(false);
                  setQrisContent("");
                  setStep("subsector");
                  setSelectedSubsector(null);
                  setSelectedProvince(null);
                  setSelectedCity(null);
                  setForm({ recipient: "", phone: "", province: "", city: "", street: "", buyerPhone: "" });
                }}
                className={bigBtn}
              >
                <Sparkles className="h-5 w-5" /> Pesanan Baru
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-full bg-accent-soft px-5 py-2 text-accent-hover">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Pesanan #{orderId.slice(0, 8)}</span>
              </div>
              <h2 className="text-4xl font-bold text-primary-soft-fg">Scan untuk Bayar</h2>
              <p className="text-xl text-muted-ink">
                Buka aplikasi pembayaran (GoPay, OVO, DANA, m-Banking) lalu scan QRIS
              </p>
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                {qrisContent ? (
                  <QrDisplay data={qrisContent} size={360} />
                ) : (
                  <div className="flex h-[360px] w-[360px] items-center justify-center text-muted-ink">
                    <Loader2 className="h-10 w-10 animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-lg font-semibold text-ink">
                Total: Rp{(cartTotal + 10000).toLocaleString("id-ID")}
              </p>
              <p className="text-base text-muted-ink">
                Termasuk ongkir Rp10.000 · {cartTotal.toLocaleString("id-ID")}
              </p>
              <button
                onClick={() => setStep("checkout")}
                className="text-primary-soft-fg underline"
              >
                Kembali
              </button>
            </>
          )}
        </main>
      )}
    </div>
  );
}
