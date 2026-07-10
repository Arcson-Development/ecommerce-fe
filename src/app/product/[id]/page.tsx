"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

const VEG_CATEGORIES = [
  { name: "Semua" },
  { name: "Sayuran" },
  { name: "Buah-buahan" },
  { name: "Daging" },
  { name: "Seafood" },
  { name: "Bumbu Dapur" },
];

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variantsList, setVariantsList] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductDetails() {
      try {
        const dbProduct = await api.get(`/products/${params.id}`);
        const primaryVariant = dbProduct.variants?.[0];
        const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");
        
        const primaryImgUrl = dbProduct.images?.[0];
        const primaryImage = primaryImgUrl && primaryImgUrl.startsWith("/uploads")
          ? `${API_HOST}${primaryImgUrl}`
          : (primaryImgUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");

        const mappedProduct: Product = {
          id: primaryVariant?.id || dbProduct.id,
          productId: dbProduct.id,
          name: dbProduct.name,
          image: primaryImage,
          price: primaryVariant?.price ?? 0,
          originalPrice: primaryVariant?.originalPrice ?? primaryVariant?.price ?? 0,
          discount: primaryVariant?.originalPrice && primaryVariant.originalPrice > primaryVariant.price
            ? Math.round(((primaryVariant.originalPrice - primaryVariant.price) / primaryVariant.originalPrice) * 100)
            : undefined,
          store: dbProduct.store?.name || "Toko Sayur",
          unit: dbProduct.unit || "1 Kg",
        };

        setProduct(mappedProduct);
        setVariantsList(dbProduct.variants?.map((v: any) => v.name) || [dbProduct.unit]);

        // Fetch related products (e.g. all products except this one)
        const allProductsRes = await api.get("/products?limit=50");
        const allProducts = Array.isArray(allProductsRes) ? allProductsRes : (allProductsRes.items || []);
        const filtered = allProducts
          .filter((p: any) => p.id !== dbProduct.id)
          .slice(0, 4)
          .map((p: any) => {
            const v = p.variants?.[0];
            const relatedImgUrl = p.images?.[0];
            const relatedImage = relatedImgUrl && relatedImgUrl.startsWith("/uploads")
              ? `${API_HOST}${relatedImgUrl}`
              : (relatedImgUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");
            return {
              id: v?.id || p.id,
              productId: p.id,
              name: p.name,
              image: relatedImage,
              price: v?.price ?? 0,
              originalPrice: v?.originalPrice ?? v?.price ?? 0,
              discount: v?.originalPrice && v.originalPrice > v.price
                ? Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100)
                : undefined,
              store: p.store?.name || "Toko Sayur",
              unit: p.unit || "1 Kg",
            };
          });
        setRelatedProducts(filtered);
      } catch (e) {
        console.error("Failed to fetch product details", e);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadProductDetails();
  }, [params.id, router]);

  if (loading) {
    return (
      <>
        <TopBar />
        <Header />
        <CategoryNav categories={VEG_CATEGORIES} />
        <div className="text-center py-16 text-zinc-500 text-sm">
          Memuat detail sayuran segar...
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TopBar />
        <Header />
        <CategoryNav categories={VEG_CATEGORIES} />
        <div className="text-center py-16 text-zinc-500 text-sm">
          Produk tidak ditemukan.
        </div>
      </>
    );
  }

  const galleryImages = [product.image, product.image, product.image];

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={VEG_CATEGORIES} />
      <ProductBreadcrumb items={["Beranda", "Toko", "Sayur Segar", product.name]} />

      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            discount={product.discount}
          />
          <ProductInfo product={product} variants={variantsList} />
        </div>
      </main>

      <ProductDescription />
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
