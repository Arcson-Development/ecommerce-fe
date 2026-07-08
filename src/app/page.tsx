"use client";

import { useMemo, useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { products as mockProducts } from "@/data/products";
import { api } from "@/lib/api";
import type { Product, Category, SortOption } from "@/types/product";

const VEG_CATEGORIES: Category[] = [
  { name: "Semua" },
  { name: "Sayuran" },
  { name: "Buah-buahan" },
  { name: "Daging" },
  { name: "Seafood" },
  { name: "Bumbu Dapur" },
  { name: "Fashion" },
  { name: "Make Up" },
  { name: "Food" },
  { name: "Lainnya" },
];

export default function Home() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", "12"); // Tampilkan 12 produk per halaman (1 baris isi 4 item, total 3 baris)
        if (selectedCategory !== "Semua") {
          queryParams.append("categoryName", selectedCategory);
        }

        const res = await api.get(`/products?${queryParams.toString()}`);
        const dbProducts = Array.isArray(res) ? res : (res.items || []);
        const total = Array.isArray(res) ? res.length : (res.total || 0);
        const pages = Array.isArray(res) ? Math.ceil(res.length / 12) : (res.totalPages || 1);

        setTotalProducts(total);
        setTotalPages(pages);

        const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");
        // Map backend Prisma Product structure to frontend Product structure
        const mapped = dbProducts.map((p: any) => {
          const primaryVariant = p.variants?.[0];
          const imageUrl = p.images?.[0];
          const image = imageUrl && imageUrl.startsWith("/uploads")
            ? `${API_HOST}${imageUrl}`
            : (imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");

          return {
            id: primaryVariant?.id || p.id, // We use variant ID for checkout/cart, so map variant ID to product ID in the grid
            productId: p.id,
            name: p.name,
            image,
            price: primaryVariant?.price ?? 0,
            originalPrice: primaryVariant?.originalPrice ?? primaryVariant?.price ?? 0,
            discount: primaryVariant?.originalPrice && primaryVariant.originalPrice > primaryVariant.price
              ? Math.round(((primaryVariant.originalPrice - primaryVariant.price) / primaryVariant.originalPrice) * 100)
              : undefined,
            store: p.store?.name || "Toko Sayur",
            unit: p.unit || "1 Kg",
            categoryName: p.category?.name || "Lainnya",
          };
        });

        let sorted = [...mapped];
        if (sortBy === "price-asc") {
          sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
          sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === "popular") {
          sorted.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
        }

        setProductsList(sorted);
      } catch (e) {
        console.error("Failed to load products from backend API, using mock products", e);
        // Fallback mapping for static mock data
        setProductsList(mockProducts.map(p => ({ ...p, categoryName: "Sayuran" })));
        setTotalProducts(mockProducts.length);
        setTotalPages(Math.ceil(mockProducts.length / 12));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [page, selectedCategory, sortBy]);

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav
        categories={VEG_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <Breadcrumb
        items={["Beranda", "Toko", selectedCategory]}
        total={totalProducts}
        showCount={productsList.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Memuat sayuran segar untuk Anda...
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Tidak ada sayuran segar di kategori "{selectedCategory}".
        </div>
      ) : (
        <ProductGrid products={productsList} />
      )}
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </>
  );
}
