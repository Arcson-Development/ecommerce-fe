import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { categories, products } from "@/data/products";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  const related = products.filter((p) => p.id !== id).slice(0, 4);
  // Use the same image as additional gallery slots
  const galleryImages = [product.image, product.image, product.image];

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />
      <ProductBreadcrumb items={["Beranda", "Toko", "Sale", product.name]} />

      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            discount={product.discount}
          />
          <ProductInfo product={product} variants={[product.name]} />
        </div>
      </main>

      <ProductDescription />
      <RelatedProducts products={related} />
    </>
  );
}
