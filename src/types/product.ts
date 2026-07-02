export interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  price: number;
  discount?: number;
  store: string;
  unit: string;
}

export interface Category {
  name: string;
  hasDropdown?: boolean;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "rating";
