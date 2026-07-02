"use client";

import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
