"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Settings2, ImageIcon, Plus, Upload, X, ChevronDown } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { toast } from "sonner";

function toAbsoluteUrl(path: string): string {
  return getImageUrl(path);
}

export default function MitraProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    categoryId: "",
    unit: "Item",
  });

  // Variant editing
  const [variants, setVariants] = useState<any[]>([]);

  // Photo editing
  const [photos, setPhotos] = useState<string[]>([]);

  async function loadProduct() {
    try {
      const data = await api.get(`/products/${params.id}`);
      setProduct(data);
      // Pre-fill form
      setForm({
        name: data.name || "",
        description: data.description || "",
        category: data.category?.name || "",
        categoryId: data.categoryId || "",
        unit: data.unit || "Item",
      });
      setVariants(
        data.variants?.map((v: any) => ({
          id: v.id,
          name: v.name || "",
          price: String(v.price || ""),
          originalPrice: String(v.originalPrice || ""),
          stock: String(v.stock || "0"),
          discount: v.discount || 0,
        })) || []
      );
      setPhotos(data.images || []);
      setHasVariants(data.variants?.length > 1 || (data.variants?.[0]?.name !== "Standar"));
    } catch (e) {
      console.error("Failed to load product", e);
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
    api.get("/categories").then(setCategories).catch(console.error);
  }, [params.id]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description.trim()) {
      toast.error("Nama dan deskripsi wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const variantList = hasVariants
        ? variants
            .filter((v) => v.name)
            .map((v) => ({
              name: v.name,
              price: parseInt(v.price) || 0,
              originalPrice: v.originalPrice ? parseInt(v.originalPrice) : undefined,
              stock: parseInt(v.stock) || 0,
            }))
        : [{ name: "Standar", price: parseInt(variants[0]?.price || "0"), stock: parseInt(variants[0]?.stock || "0") }];

      await api.put(`/products/mitra/${params.id}`, {
        name: form.name,
        description: form.description,
        unit: form.unit,
        categoryId: form.categoryId || undefined,
        images: photos,
        variants: variantList,
      });

      toast.success("Produk berhasil diperbarui!");
      setEditMode(false);
      setPhotoMode(false);
      loadProduct();
    } catch (e: any) {
      toast.error("Gagal update produk: " + (e?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    let token = localStorage.getItem("pasarjaya-token");
    if (!token) {
      const authPersist = localStorage.getItem("pasarjaya-auth");
      if (authPersist) {
        try {
          const parsed = JSON.parse(authPersist);
          token = parsed.state?.token || null;
        } catch { /* ignore */ }
      }
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6670/api";
      const res = await fetch(`${BASE_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      setPhotos((p) => [...p, data.url]);
    } catch (err: any) {
      toast.error("Gagal upload foto: " + (err?.message || "Unknown error"));
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: string, value: string) => {
    setVariants((v) => v.map((x, i) => (i === idx ? { ...x, [field]: value } : x)));
  };

  const addVariant = () => {
    setVariants((v) => [...v, { name: "", price: "", originalPrice: "", stock: "0" }]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length > 1) setVariants((v) => v.filter((_, i) => i !== idx));
  };

  // ── LOADING ──
  if (loading) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <p className="text-zinc-500">Memuat produk...</p>
        </div>
      </MitraShell>
    );
  }

  // ── NOT FOUND ──
  if (!product) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">Produk tidak ditemukan</h1>
          <button onClick={() => router.push("/mitra/products")} className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white">
            Kembali
          </button>
        </div>
      </MitraShell>
    );
  }

  const images = (photos.length ? photos : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"]).map(toAbsoluteUrl);
  const mainImage = images[activeThumb] || images[0];

  // ── EDIT MODE ──
  if (editMode) {
    return (
      <MitraShell>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <MitraSidebar active="stock" />
          <div className="space-y-4">
            <button onClick={() => { setEditMode(false); setPhotoMode(false); loadProduct(); }} className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Kembali ke Detail Produk
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">Edit Produk</h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{product.name}</p>
            </div>

            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleEditSubmit} className="rounded-sm border border-zinc-200 bg-white">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2">
                {/* INFORMASI PRODUK */}
                <fieldset className="space-y-4">
                  <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">Informasi Produk</legend>

                  <Field label="Nama Produk" required>
                    <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama Produk" className="form-input" />
                  </Field>

                  <Field label="Deskripsi" required>
                    <textarea required rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Deskripsikan produk..." className="form-input resize-y" />
                  </Field>

                  <Field label="Kategori Produk">
                    <div className="relative">
                      <button type="button" onClick={() => setOpenCategory(!openCategory)} className={`flex w-full items-center justify-between border bg-zinc-50 px-4 py-3 text-left text-sm transition-colors ${openCategory ? "border-zinc-900 bg-white text-zinc-900" : "border-zinc-200 text-zinc-700 hover:border-zinc-400"}`}>
                        <span className={form.category ? "text-zinc-900" : "text-zinc-400"}>{form.category || "Pilih Kategori"}</span>
                        <motion.span animate={{ rotate: openCategory ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4" strokeWidth={2} />
                        </motion.span>
                      </button>
                      {openCategory && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenCategory(false)} />
                          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg">
                            {categories.length === 0 ? (
                              <li className="px-4 py-3 text-sm text-zinc-400">Memuat kategori...</li>
                            ) : (
                              categories.filter((c: any) => c.isActive !== false).map((c: any) => (
                                <li key={c.id}>
                                  <button type="button" onClick={() => { setForm((f) => ({ ...f, category: c.name, categoryId: c.id })); setOpenCategory(false); }} className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${c.id === form.categoryId ? "bg-zinc-50 font-medium text-zinc-900" : "text-zinc-700"}`}>
                                    {c.name}
                                  </button>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        </>
                      )}
                    </div>
                  </Field>
                </fieldset>

                {/* HARGA & VARIASI */}
                <fieldset className="space-y-4">
                  <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">Harga dan Variasi</legend>

                  {!hasVariants && variants[0] && (
                    <>
                      <Field label="Harga Produk" required>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Rp</span>
                          <input type="number" required value={variants[0]?.price || ""} onChange={(e) => updateVariant(0, "price", e.target.value)} placeholder="0" className="form-input pl-10" />
                        </div>
                      </Field>
                      <Field label="Stok">
                        <input type="number" min="0" value={variants[0]?.stock || "0"} onChange={(e) => updateVariant(0, "stock", e.target.value)} placeholder="0" className="form-input" />
                      </Field>
                    </>
                  )}

                  <Field label="Satuan / Unit">
                    <input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="mis. 1 Kg, Pcs, Ikat" className="form-input" />
                  </Field>

                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="h-4 w-4 accent-zinc-900" />
                    Produk memiliki jenis dan variasi berbeda
                  </label>

                  {(hasVariants || variants.length > 1) && (
                    <div className="space-y-3">
                      {variants.map((v, i) => (
                        <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
                          <Field label="Nama jenis">
                            <input type="text" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="Nama jenis" className="form-input" />
                          </Field>
                          <Field label="Harga">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Rp</span>
                              <input type="number" min="0" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="0" className="form-input pl-10" />
                            </div>
                          </Field>
                          <Field label="Harga Asli (optional)">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Rp</span>
                              <input type="number" min="0" value={v.originalPrice} onChange={(e) => updateVariant(i, "originalPrice", e.target.value)} placeholder="0" className="form-input pl-10" />
                            </div>
                          </Field>
                          <Field label="Stok">
                            <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} placeholder="0" className="form-input" />
                          </Field>
                          {variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(i)} className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-rose-300 hover:text-rose-600">
                              <X className="h-4 w-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addVariant} className="flex w-full items-center justify-center gap-2 border border-dashed border-zinc-300 bg-zinc-50 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900">
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> Tambah Variasi
                      </button>
                    </div>
                  )}
                </fieldset>
              </div>

              {/* FOTO PRODUK */}
              <div className="border-t border-zinc-200 px-6 py-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">Foto Produk</p>
                {photoMode && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {photos.map((photo, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden border border-zinc-200 bg-zinc-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt={`foto ${i + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => handleRemovePhoto(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3 w-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-900">
                      <Upload className="h-4 w-4" strokeWidth={2} />
                      Tambah Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { handlePhotoUpload(f); e.target.value = ""; }}} />
                    </label>
                  </div>
                )}
                {!photoMode && (
                  <p className="text-sm text-zinc-500">{photos.length} foto tersimpan. Klik "Kelola Foto" untuk mengelola.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="bg-zinc-900 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50">
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button type="button" onClick={() => { setEditMode(false); setPhotoMode(false); loadProduct(); }} className="border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-700">
                    Batal
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        </div>

        <style jsx>{`
          .form-input { width: 100%; border: 1px solid #e4e4e7; background: #fafafa; padding: 0.75rem 1rem; font-size: 0.875rem; color: #18181b; transition: border-color 0.15s, background 0.15s; }
          .form-input::placeholder { color: #a1a1aa; }
          .form-input:hover:not(:disabled) { border-color: #a1a1aa; }
          .form-input:focus { outline: none; border-color: #18181b; background: #ffffff; }
        `}</style>
      </MitraShell>
    );
  }

  // ── VIEW MODE (default) ──
  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="stock" />

        <div className="space-y-4">
          <button onClick={() => router.push("/mitra/products")} className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900">
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Kembali ke List Produk
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Detail Produk</p>
          </div>

          <div className="rounded-sm border border-zinc-200 bg-white">
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* Image gallery */}
              <div className="space-y-3">
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                  <Image src={mainImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized priority />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((thumb: string, i: number) => (
                    <button key={i} onClick={() => setActiveThumb(i)} className={`relative aspect-square overflow-hidden border-2 transition-colors ${activeThumb === i ? "border-zinc-900" : "border-transparent hover:border-zinc-300"}`}>
                      <Image src={thumb} alt={`thumb ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">{product.name}</h2>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    {product.variants?.[0]?.originalPrice && (
                      <span className="text-sm text-zinc-400 line-through">{formatRupiah(product.variants[0].originalPrice)}</span>
                    )}
                    <span className="text-2xl font-semibold text-zinc-900">
                      {product.variants?.length ? formatRupiah(product.variants[0].price) : '-'}
                    </span>
                    {product.variants?.length > 1 && (
                      <span className="text-xs text-zinc-500">+ {product.variants.length - 1} varian lainnya</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Ketersediaan</p>
                  <p className="mt-1 text-sm font-medium text-emerald-600">
                    {product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) > 0 ? 'Tersedia' : 'Habis'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Kategori</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700">
                      {product.category?.name || 'Umum'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Detail Produk</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">{product.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
                  <button
                    type="button"
                    onClick={() => { setForm({
                      name: product.name,
                      description: product.description,
                      category: product.category?.name || "",
                      categoryId: product.categoryId || "",
                      unit: product.unit || "Item",
                    });
                    setVariants(product.variants?.map((v: any) => ({
                      id: v.id, name: v.name || "", price: String(v.price || ""),
                      originalPrice: String(v.originalPrice || ""), stock: String(v.stock || "0"), discount: v.discount || 0,
                    })) || []);
                    setPhotos(product.images || []);
                    setHasVariants(product.variants?.length > 1 || (product.variants?.[0]?.name !== "Standar"));
                    setEditMode(true);
                    setPhotoMode(false);
                    }}
                    className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                  >
                    <Settings2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit Produk
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForm({
                      name: product.name,
                      description: product.description,
                      category: product.category?.name || "",
                      categoryId: product.categoryId || "",
                      unit: product.unit || "Item",
                    });
                    setVariants(product.variants?.map((v: any) => ({
                      id: v.id, name: v.name || "", price: String(v.price || ""),
                      originalPrice: String(v.originalPrice || ""), stock: String(v.stock || "0"), discount: v.discount || 0,
                    })) || []);
                    setPhotos(product.images || []);
                    setHasVariants(product.variants?.length > 1 || (product.variants?.[0]?.name !== "Standar"));
                    setPhotoMode(true);
                    setEditMode(true);
                    }}
                    className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                  >
                    <ImageIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    Kelola Foto
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Variants */}
            <div className="border-t border-zinc-200 px-6 py-5">
              <h3 className="text-sm font-semibold text-zinc-900">Variasi Lainnya</h3>
              <div className="mt-3 space-y-2">
                {product.variants?.map((variant: any) => (
                  <VariantStockRow key={variant.id} variant={variant} onStockUpdated={loadProduct} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-800">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function VariantStockRow({ variant, onStockUpdated }: { variant: any; onStockUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [stockInput, setStockInput] = useState(String(variant.stock || 0));
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    try {
      await api.put(`/products/mitra/variant/${variant.id}/stock`, { stock: parseInt(stockInput) || 0 });
      setEditing(false);
      onStockUpdated();
    } catch (e: any) {
      toast.error("Gagal update stok: " + (e?.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border border-zinc-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{variant.name}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-900">{formatRupiah(variant.price)}</span>
          {variant.originalPrice && (
            <span className="text-xs text-zinc-400 line-through">{formatRupiah(variant.originalPrice)}</span>
          )}
          {variant.discount && (
            <span className="text-xs font-semibold text-rose-500">-{variant.discount}%</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {editing ? (
          <>
            <input type="number" min="0" value={stockInput} onChange={(e) => setStockInput(e.target.value)} className="w-20 border border-zinc-300 px-2 py-1 text-sm text-center" autoFocus />
            <button onClick={handleSave} disabled={updating} className="bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">
              {updating ? "..." : "Simpan"}
            </button>
            <button onClick={() => { setEditing(false); setStockInput(String(variant.stock || 0)); }} className="text-xs text-zinc-500 hover:text-zinc-900">
              Batal
            </button>
          </>
        ) : (
          <>
            {variant.stock > 0 ? (
              <p className="text-xs font-medium text-emerald-600">{variant.stock} Tersisa</p>
            ) : (
              <p className="text-xs font-medium text-zinc-500">Tidak Ada Dalam Stok</p>
            )}
            <button onClick={() => setEditing(true)} className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline">
              Atur Stok
            </button>
          </>
        )}
      </div>
    </div>
  );
}
