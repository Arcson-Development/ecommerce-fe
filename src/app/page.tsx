"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { categories, products } from "@/data/products";
import type { SortOption } from "@/types/product";

export default function Home() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "popular":
        return arr.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
      default:
        return arr;
    }
  }, [sortBy]);

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />
      <Breadcrumb
        items={["Beranda", "Toko", "Sale"]}
        total={893}
        showCount={60}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ProductGrid products={sortedProducts} />
      <Pagination current={page} total={15} onChange={setPage} />
    </>
  );
}
