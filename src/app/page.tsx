"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { products as mockProducts } from "@/data/products";
import { api } from "@/lib/api";
import type { Product, Category, SortOption } from "@/types/product";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([{ name: "Semua" }]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch markets from API
  useEffect(() => {
    async function loadMarkets() {
      try {
        const res = await api.get("/markets");
        setMarkets(Array.isArray(res) ? res : []);
      } catch (_) {}
    }
    loadMarkets();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/categories");
        const cats = Array.isArray(res) ? res : [];
        setCategories([{ name: "Semua" }, ...cats.map((c: any) => ({ name: c.name }))]);
      } catch (e) {
        // Fallback to default categories if API fails
        setCategories([
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
        ]);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, selectedMarket]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", "12");
        
        if (selectedCategory !== "Semua") {
          queryParams.append("categoryName", selectedCategory);
        }
        
        if (selectedMarket) {
          queryParams.append("marketId", selectedMarket);
        }

        if (searchQuery) {
          queryParams.append("search", searchQuery);
        }

        const res = await api.get(`/products?${queryParams.toString()}`);
        const dbProducts = Array.isArray(res) ? res : (res.items || []);
        const total = Array.isArray(res) ? res.length : (res.total || 0);
        const pages = Array.isArray(res) ? Math.ceil(res.length / 12) : (res.totalPages || 1);

        setTotalProducts(total);
        setTotalPages(pages);

        const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");
        const mapped = dbProducts.map((p: any) => {
          const primaryVariant = p.variants?.[0];
          const imageUrl = p.images?.[0];
          const image = imageUrl && imageUrl.startsWith("/uploads")
            ? `${API_HOST}${imageUrl}`
            : (imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");

          return {
            id: primaryVariant?.id || p.id,
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
        setProductsList(mockProducts.map(p => ({ ...p, categoryName: "Sayuran" })));
        setTotalProducts(mockProducts.length);
        setTotalPages(Math.ceil(mockProducts.length / 12));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [page, selectedCategory, sortBy, searchQuery, selectedMarket]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <TopBar />
      <Header onSearch={handleSearch} initialSearch={initialSearch} />
      {markets.length > 0 && (
        <div className="sticky top-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
            <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 sm:inline">
              Pasar
            </span>
            <button
              onClick={() => setSelectedMarket("")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                !selectedMarket
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Semua
            </button>
            {markets.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setSelectedMarket(m.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedMarket === m.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <Breadcrumb
        items={["Beranda", "Toko", selectedCategory]}
        total={totalProducts}
        showCount={productsList.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
      />
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Memuat sayuran segar untuk Anda...
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          {searchQuery 
            ? `Tidak ada produk yang cocok dengan "${searchQuery}"`
            : `Tidak ada produk di kategori "${selectedCategory}".`
          }
        </div>
      ) : (
        <ProductGrid products={productsList} />
      )}
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-zinc-500 text-sm">Memuat...</div>}>
      <HomeContent />
    </Suspense>
  );
}
