"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronDown, Plus, Upload, X } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { toast } from "sonner";

interface Variant {
  type: string;
  option: string;
}

export default function MitraProductNewPage() {
  const router = useRouter();
  const [openCategory, setOpenCategory] = useState(false);
  const [hasVariants, setHasVariants] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([
    { type: "", option: "" },
  ]);
  const [photos, setPhotos] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    categoryId: "",
  });

  // Fetch categories from API
  useEffect(() => {
    api.get("/categories").then(setCategories).catch(console.error);
  }, []);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selectCategory = (name: string, id: string) => {
    setForm((f) => ({ ...f, category: name, categoryId: id }));
    setOpenCategory(false);
  };

  const handleAddVariant = () => {
    setVariants((v) => [...v, { type: "", option: "" }]);
  };

  const handleRemoveVariant = (i: number) => {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  };

  const handleAddPhoto = () => {
    setPhotos((p) => [...p, null]);
  };

  const handleRemovePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Mohon lengkapi field wajib (nama, harga, kategori).");
      return;
    }

    setSubmitting(true);
    try {
      const variantList = hasVariants && variants.length > 0
        ? variants.filter(v => v.type || v.option).map(v => ({
            name: v.option || v.type || form.name,
            price: parseInt(form.price),
            stock: 0,
          }))
        : [{ name: "Standar", price: parseInt(form.price), stock: 0 }];

      const payload = {
        name: form.name,
        description: form.description,
        unit: "Item",
        images: photos.filter(Boolean) as string[],
        categoryId: form.categoryId,
        variants: variantList,
      };

      await api.post("/products/mitra", payload);
      toast.success("Produk berhasil dibuat!");
      router.push("/mitra/products");
    } catch (e: any) {
      toast.error("Gagal membuat produk: " + (e?.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="stock" />

        <div className="space-y-4">
          <button
            onClick={() => router.push("/mitra/products")}
            className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-700 hover:text-zinc-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Kembali
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Tambah Produk Baru
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Produk
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="rounded-sm border border-zinc-200 bg-white"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2">
              {/* INFORMASI PRODUK */}
              <fieldset className="space-y-4">
                <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Informasi Produk
                </legend>

                <Field label="Nama Produk" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Nama Produk"
                    className="form-input"
                  />
                </Field>

                <Field label="Deskripsi" required>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Deskripsikan produk dengan detail seperti status, spesifikasi, dan lainnya..."
                    className="form-input resize-y"
                  />
                </Field>

                <Field label="Kategori Produk" required>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenCategory(!openCategory)}
                      className={`flex w-full items-center justify-between border bg-zinc-50 px-4 py-3 text-left text-sm transition-colors ${
                        openCategory
                          ? "border-zinc-900 bg-white text-zinc-900"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <span
                        className={
                          form.category ? "text-zinc-900" : "text-zinc-400"
                        }
                      >
                        {form.category || "Pilih Kategori"}
                      </span>
                      <motion.span
                        animate={{ rotate: openCategory ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" strokeWidth={2} />
                      </motion.span>
                    </button>
                    {openCategory && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenCategory(false)}
                        />
                        <motion.ul
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
                        >
                          {categories.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-zinc-400">
                              Memuat kategori...
                            </li>
                          ) : (
                            categories
                              .filter((c: any) => c.isActive !== false)
                              .map((c: any) => (
                                <li key={c.id}>
                                  <button
                                    type="button"
                                    onClick={() => selectCategory(c.name, c.id)}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                                      c.id === form.categoryId
                                        ? "bg-zinc-50 font-medium text-zinc-900"
                                        : "text-zinc-700"
                                    }`}
                                  >
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

              {/* HARGA DAN VARIASI */}
              <fieldset className="space-y-4">
                <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Harga dan Variasi
                </legend>

                <Field label="Harga Produk" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="0"
                      className="form-input pl-10 pr-10"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <span className="text-sm">⚙</span>
                    </span>
                  </div>
                </Field>

                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="h-4 w-4 accent-zinc-900"
                  />
                  Produk memiliki jenis dan variasi berbeda
                </label>

                {hasVariants && (
                  <div className="space-y-3">
                    {variants.map((variant, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                      >
                        <Field label="Nama jenis">
                          <input
                            type="text"
                            value={variant.type}
                            onChange={(e) =>
                              setVariants((v) =>
                                v.map((x, idx) =>
                                  idx === i
                                    ? { ...x, type: e.target.value }
                                    : x
                                )
                              )
                            }
                            placeholder="Nama jenis"
                            className="form-input"
                          />
                        </Field>
                        <Field label="Varian (ukuran atau tipe)">
                          <input
                            type="text"
                            value={variant.option}
                            onChange={(e) =>
                              setVariants((v) =>
                                v.map((x, idx) =>
                                  idx === i
                                    ? { ...x, option: e.target.value }
                                    : x
                                )
                              )
                            }
                            placeholder="Varian (ukuran atau tipe)"
                            className="form-input"
                          />
                        </Field>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(i)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-rose-300 hover:text-rose-600"
                          >
                            <X className="h-4 w-4" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex w-full items-center justify-center gap-2 border border-dashed border-zinc-300 bg-zinc-50 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Tambah Jenis dan Variasi
                    </button>
                  </div>
                )}
              </fieldset>
            </div>

            {/* Photos */}
            <div className="border-t border-zinc-200 px-6 py-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                Foto Produk
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {photos.map((photo, i) => (
                  <PhotoSlot
                    key={i}
                    photo={photo}
                    onUpload={(url) =>
                      setPhotos((p) => p.map((x, idx) => (idx === i ? url : x)))
                    }
                    onRemove={
                      photos.length > 1 ? () => handleRemovePhoto(i) : undefined
                    }
                    label={i === 0 ? "Foto Produk" : "Foto Produk"}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-900"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  Tambahkan Lebih
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-900 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto sm:px-12"
              >
                {submitting ? "Menyimpan..." : "Simpan dan buat"}
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #18181b;
          transition: border-color 0.15s, background 0.15s;
        }
        .form-input::placeholder {
          color: #a1a1aa;
        }
        .form-input:hover:not(:disabled) {
          border-color: #a1a1aa;
        }
        .form-input:focus {
          outline: none;
          border-color: #18181b;
          background: #ffffff;
        }
      `}</style>
    </MitraShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

function PhotoSlot({
  photo,
  onUpload,
  onRemove,
  label,
}: {
  photo: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label: string;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  return (
    <div className="group relative aspect-square overflow-hidden border border-zinc-200 bg-zinc-50">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={label}
          className="h-full w-full object-cover"
        />
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
          <Upload className="h-4 w-4" strokeWidth={2} />
          <span className="text-[10px] font-medium">{label}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      )}
      {photo && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
