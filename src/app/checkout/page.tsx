"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Check, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import {
  CheckoutForm,
  type CheckoutFormData,
} from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/orders";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SavedAddress {
  id: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  isPrimary: boolean;
}

const EMPTY_FORM: CheckoutFormData = {
  email: "",
  firstName: "",
  lastName: "",
  province: "",
  city: "",
  district: "",
  address: "",
  postalCode: "",
  phone: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const user = useAuth((s) => s.user);
  const items = useCart((state) => state.items);
  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsub = useAuth.persist.onFinishHydration(() => setHydrated(true));
    if (useAuth.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth?redirect=/checkout");
      return;
    }
    // Authenticated: fetch cart and addresses
    useCart.getState().fetchCart();
    loadSavedAddresses();
  }, [hydrated, isAuthenticated, router]);

  async function loadSavedAddresses() {
    try {
      const addrs = await api.get("/users/addresses");
      setSavedAddresses(addrs || []);
      // Auto-select primary address
      const primary = addrs?.find((a: SavedAddress) => a.isPrimary);
      if (primary) {
        selectAddress(primary);
      }
    } catch (e) {
      console.error("Failed to load addresses", e);
    }
  }

  function selectAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id);
    setForm({
      email: user?.email || "",
      firstName: addr.recipient.split(" ")[0] || "",
      lastName: addr.recipient.split(" ").slice(1).join(" ") || "",
      province: addr.province,
      city: addr.city,
      district: addr.district,
      address: addr.street,
      postalCode: addr.postalCode,
      phone: addr.phone,
      notes: "",
    });
  }

  function useNewAddress() {
    setSelectedAddressId(null);
    setForm(EMPTY_FORM);
  }

  if (!mounted || !hydrated) {
    return <CheckoutShell><LoadingState /></CheckoutShell>;
  }

  if (!isAuthenticated) {
    return <CheckoutShell><LoadingState /></CheckoutShell>;
  }

  const handleCheckout = async (details: {
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
  }) => {
    const required: (keyof CheckoutFormData)[] = [
      "email",
      "firstName",
      "lastName",
      "province",
      "city",
      "postalCode",
      "phone",
    ];
    const missing = required.find((k) => !form[k].trim());
    if (missing) {
      toast.error("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    const { isAuthenticated } = useAuth.getState();

    setIsProcessing(true);
    try {
      // Guests may complete checkout; the BE creates an order
      // linked to the email/phone they provide in the form.
      const checkoutResult = await useOrders.getState().checkout({
        ...details,
        phone: form.phone,
        street: form.address,
        city: form.city,
        district: form.district,
        province: form.province,
        postalCode: form.postalCode,
        saveAddress,
      });
      
      if (checkoutResult && checkoutResult.redirectUrl) {
        await useCart.getState().clear();
        // Open Midtrans in a new tab so the checkout page is never left blank
        // if the payment provider fails to load. Fallback link shown below.
        const opened = window.open(
          checkoutResult.redirectUrl,
          "_blank",
          "noopener,noreferrer"
        );
        if (!opened) {
          toast.warning(
            "Popup diblokir. Klik tombol 'Bayar Sekarang' di bawah untuk membuka halaman pembayaran."
          );
        } else {
          toast.success("Pesanan dibuat! Halaman pembayaran telah dibuka di tab baru.");
        }
        setPaymentUrl(checkoutResult.redirectUrl);
        setIsProcessing(false);
      } else {
        toast.error("Gagal memproses link pembayaran Midtrans.");
        setIsProcessing(false);
      }
    } catch (e: any) {
      toast.error(e.message || "Gagal melakukan checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <CheckoutShell>
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-12">
          {paymentUrl && (
            <div className="lg:col-span-2 rounded-sm border border-emerald-200 bg-emerald-50 p-5">
              <h2 className="text-sm font-semibold text-emerald-900">
                Pesanan berhasil dibuat!
              </h2>
              <p className="mt-1 text-sm text-emerald-800">
                Halaman pembayaran seharusnya terbuka di tab baru. Jika tidak,
                klik tombol di bawah ini:
              </p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block bg-emerald-600 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-700"
              >
                Bayar Sekarang
              </a>
            </div>
          )}
          <div>
            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Alamat Tersimpan
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddress(addr)}
                      className={`relative rounded-sm border p-4 text-left transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 bg-white hover:border-zinc-400"
                      }`}
                    >
                      {selectedAddressId === addr.id && (
                        <span className="absolute right-2 top-2 text-emerald-600">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {addr.recipient}
                          </p>
                          <p className="text-xs text-zinc-600">{addr.phone}</p>
                          <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                            {addr.street}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}
                          </p>
                          {addr.isPrimary && (
                            <span className="mt-1.5 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              Utama
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={useNewAddress}
                    className={`flex items-center justify-center gap-2 rounded-sm border border-dashed p-4 transition-colors ${
                      selectedAddressId === null
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-300 bg-zinc-50 hover:border-zinc-500"
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-zinc-700">Alamat Baru</span>
                  </button>
                </div>
              </section>
            )}

            <CheckoutForm data={form} onChange={setForm} />

            {/* Save address checkbox */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 accent-zinc-900"
              />
              <label htmlFor="saveAddress" className="text-sm text-zinc-700">
                Simpan alamat ini ke profil saya
              </label>
            </div>
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <OrderSummary
              onCheckout={handleCheckout}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      )}
    </CheckoutShell>
  );
}

function EmptyCart() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md py-16 text-center"
    >
      <h2 className="text-xl font-semibold text-zinc-900">
        Keranjang kamu kosong
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Yuk, mulai belanja sayur segar favoritmu.
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
      >
        Mulai Belanja
      </button>
    </motion.div>
  );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <CheckoutSteps current="checkout" />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
    </div>
  );
}
