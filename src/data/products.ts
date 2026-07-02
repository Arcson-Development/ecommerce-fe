import type { Product, Category } from "@/types/product";

// Using Unsplash for product images (free, high-quality)
const IMG = {
  broccoli:
    "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&q=80",
  tomato:
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
  onion:
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80",
  carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
};

export const categories: Category[] = [
  { name: "SALE" },
  { name: "ACCESSORIES", hasDropdown: true },
  { name: "ENAMEL PIN" },
  { name: "GOLF MARKER" },
  { name: "HAT PIN" },
  { name: "LANYARD" },
  { name: "STICKER", hasDropdown: true },
  { name: "FEATURED", hasDropdown: true },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Brokoli",
    image: IMG.broccoli,
    originalPrice: 28000,
    price: 18200,
    discount: 30,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "2",
    name: "Tomat Merah",
    image: IMG.tomato,
    originalPrice: 28000,
    price: 28000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "3",
    name: "Bawang Merah",
    image: IMG.onion,
    originalPrice: 45000,
    price: 45000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "4",
    name: "Wortel",
    image: IMG.carrot,
    originalPrice: 26000,
    price: 26000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "5",
    name: "Wortel",
    image: IMG.carrot,
    originalPrice: 26000,
    price: 26000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "6",
    name: "Bawang Merah",
    image: IMG.onion,
    originalPrice: 45000,
    price: 45000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "7",
    name: "Tomat Merah",
    image: IMG.tomato,
    originalPrice: 28000,
    price: 28000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "8",
    name: "Brokoli",
    image: IMG.broccoli,
    originalPrice: 28000,
    price: 18200,
    discount: 30,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "9",
    name: "Bawang Merah",
    image: IMG.onion,
    originalPrice: 45000,
    price: 45000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "10",
    name: "Wortel",
    image: IMG.carrot,
    originalPrice: 26000,
    price: 26000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "11",
    name: "Brokoli",
    image: IMG.broccoli,
    originalPrice: 28000,
    price: 18200,
    discount: 30,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
  {
    id: "12",
    name: "Tomat Merah",
    image: IMG.tomato,
    originalPrice: 28000,
    price: 28000,
    store: "Toko Sayur Segar",
    unit: "1 Kg",
  },
];

export const formatRupiah = (value: number): string => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};
