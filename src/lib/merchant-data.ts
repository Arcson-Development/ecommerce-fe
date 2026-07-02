import type { Product } from "@/types/product";

const IMG = {
  broccoli:
    "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&q=80",
  broccoliBig:
    "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=1200&q=80",
  tomato:
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
  tomatoBig:
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1200&q=80",
  carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
  carrotBig:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1200&q=80",
  onion:
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80",
  onionBig:
    "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=1200&q=80",
};

// Nama toko aktif (sesuai mockup: Toko Sayur Segar #73142)
export const ACTIVE_STORE = {
  name: "Toko Sayur Segar",
  id: "73142",
};

// Produk yang dijual toko
export const merchantProducts: Product[] = [
  {
    id: "m-1",
    name: "Brokoli",
    image: IMG.broccoli,
    originalPrice: 22000,
    price: 18200,
    discount: 17,
    store: ACTIVE_STORE.name,
    unit: "1 Kg",
  },
  {
    id: "m-2",
    name: "Tomat",
    image: IMG.tomato,
    originalPrice: 32000,
    price: 28000,
    discount: 12,
    store: ACTIVE_STORE.name,
    unit: "1 Kg",
  },
  {
    id: "m-3",
    name: "Wortel",
    image: IMG.carrot,
    originalPrice: 26000,
    price: 26000,
    store: ACTIVE_STORE.name,
    unit: "1 Kg",
  },
  {
    id: "m-4",
    name: "Bawang Merah",
    image: IMG.onion,
    originalPrice: 45000,
    price: 45000,
    store: ACTIVE_STORE.name,
    unit: "1 Kg",
  },
];

export interface ProductVariant {
  name: string; // "Kikan", "Satuan", dll
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number; // jumlah tersisa
  status: "Tersedia" | "Tidak Ada Dalam" | "Habis";
}

export interface MerchantProductDetail {
  id: string;
  code: string; // "21344"
  name: string;
  image: string; // main big image
  thumbnails: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  availability: "Tersedia" | "Habis";
  categories: string[]; // badges
  description: string;
  variants: ProductVariant[];
  categoryTypes: number; // jumlah tipe kategori (1, 2, 3)
  categoryList: number; // jumlah list (1)
}

// Data detail produk (untuk halaman detail)
export const merchantProductDetails: MerchantProductDetail[] = [
  {
    id: "m-1",
    code: "21344",
    name: "Brokoli - 1 Kg",
    image: IMG.broccoliBig,
    thumbnails: [IMG.broccoli, IMG.broccoli, IMG.broccoli],
    price: 18200,
    originalPrice: 28000,
    discount: 10,
    availability: "Tersedia",
    categories: ["Makanan", "Sayur", "Dapur"],
    description:
      "Lorem ipsum dolor sit amet consectetur. Sit at felis metus porta amet rhoncus pellentesque mattis. Netus sed scelerisque turpis vulputate risus nam dignissim gravida. Posuere tellus maecenas mattis ultrices lorem. Lorem ut urna commodo interdum. Egestas ac magna amet ac fringilla dui. Fringilla odio proin risus semper lectus at vulputate.",
    variants: [
      { name: "Kikan", price: 18200, originalPrice: 20000, discount: 10, stock: 13, status: "Tersedia" },
      { name: "Satuan", price: 2000, stock: 0, status: "Tidak Ada Dalam" },
    ],
    categoryTypes: 1,
    categoryList: 1,
  },
  {
    id: "m-2",
    code: "21345",
    name: "Tomat - 1 Kg",
    image: IMG.tomatoBig,
    thumbnails: [IMG.tomato, IMG.tomato, IMG.tomato],
    price: 28000,
    availability: "Tersedia",
    categories: ["Makanan", "Sayur", "Dapur"],
    description:
      "Tomat merah segar langsung dari petani lokal. Cocok untuk berbagai masakan rumahan dan restoran. Kaya akan vitamin C dan antioksidan untuk kesehatan tubuh Anda.",
    variants: [
      { name: "1 Kg", price: 28000, stock: 24, status: "Tersedia" },
    ],
    categoryTypes: 1,
    categoryList: 1,
  },
  {
    id: "m-3",
    code: "21346",
    name: "Wortel - 1 Kg",
    image: IMG.carrotBig,
    thumbnails: [IMG.carrot, IMG.carrot, IMG.carrot],
    price: 26000,
    availability: "Tersedia",
    categories: ["Makanan", "Sayur", "Dapur"],
    description:
      "Wortel Brastagi premium, manis dan renyah. Cocok untuk jus, sup, atau disantap langsung sebagai camilan sehat.",
    variants: [
      { name: "1 Kg", price: 26000, stock: 18, status: "Tersedia" },
    ],
    categoryTypes: 1,
    categoryList: 1,
  },
  {
    id: "m-4",
    code: "21347",
    name: "Bawang Merah - 1 Kg",
    image: IMG.onionBig,
    thumbnails: [IMG.onion, IMG.onion, IMG.onion],
    price: 45000,
    availability: "Tersedia",
    categories: ["Makanan", "Sayur", "Dapur"],
    description:
      "Bawang merah lokal berkualitas, aroma tajam dan rasa yang kuat. Pilihan tepat untuk bumbu dapur Anda.",
    variants: [
      { name: "1 Kg", price: 45000, stock: 30, status: "Tersedia" },
    ],
    categoryTypes: 1,
    categoryList: 1,
  },
];

export type MerchantOrderStatus = "inbox" | "on_the_way" | "completed";

export interface MerchantOrder {
  id: string;
  date: string; // ISO
  customer: string;
  customerPhone: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  status: MerchantOrderStatus;
  paymentMethod: string;
  paymentStatus: "Lunas" | "Belum Bayar";
  items: {
    name: string;
    unit: string;
    qty: number;
    price: number;
  }[];
  shippingMethod: string;
  shippingAddress: {
    recipient: string;
    phone: string;
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export const merchantOrders: MerchantOrder[] = [
  {
    id: "21344",
    date: "2026-05-04T10:00:00.000Z",
    customer: "Snowy de Wulf",
    customerPhone: "0895 4458 3902",
    subtotal: 90400,
    shippingCost: 10000,
    total: 100400,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 2, price: 18200 },
      { name: "Tomat", unit: "1 Kg", qty: 1, price: 28000 },
      { name: "Wortel", unit: "1 Kg", qty: 1, price: 26000 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Snowy de Wulf",
      phone: "0895 4458 3902",
      street: "Jl. Kp. Bojong RT05 RW20",
      district: "Kecamatan Sukmajaya, Kelurahan Baktijaya",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16418",
    },
  },
  {
    id: "21345",
    date: "2026-05-04T11:30:00.000Z",
    customer: "Budi Santoso",
    customerPhone: "0812 3456 7890",
    subtotal: 46200,
    shippingCost: 10000,
    total: 56200,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 1, price: 18200 },
      { name: "Tomat", unit: "1 Kg", qty: 1, price: 28000 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Budi Santoso",
      phone: "0812 3456 7890",
      street: "Jl. Margonda Raya No. 100",
      district: "Kecamatan Beji, Kelurahan Kukusan",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16425",
    },
  },
  {
    id: "21346",
    date: "2026-05-04T13:15:00.000Z",
    customer: "Sari Indah Lestari",
    customerPhone: "0813 9876 5432",
    subtotal: 71000,
    shippingCost: 0,
    total: 71000,
    status: "inbox",
    paymentMethod: "Transfer Bank BCA",
    paymentStatus: "Lunas",
    items: [
      { name: "Bawang Merah", unit: "1 Kg", qty: 1, price: 45000 },
      { name: "Wortel", unit: "1 Kg", qty: 1, price: 26000 },
    ],
    shippingMethod: "JNE Regular",
    shippingAddress: {
      recipient: "Sari Indah Lestari",
      phone: "0813 9876 5432",
      street: "Jl. Senopati No. 12",
      district: "Kecamatan Kebayoran Baru, Kelurahan Senopati",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12190",
    },
  },
  {
    id: "21347",
    date: "2026-05-04T14:00:00.000Z",
    customer: "Ahmad Fauzi",
    customerPhone: "0812 1111 2222",
    subtotal: 54600,
    shippingCost: 10000,
    total: 64600,
    status: "inbox",
    paymentMethod: "DANA",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 3, price: 18200 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Ahmad Fauzi",
      phone: "0812 1111 2222",
      street: "Jl. Diponegoro No. 50",
      district: "Kecamatan Coblong, Kelurahan Lebakgede",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40132",
    },
  },
  {
    id: "21348",
    date: "2026-05-04T15:20:00.000Z",
    customer: "Dewi Anggraini",
    customerPhone: "0857 1234 5678",
    subtotal: 36400,
    shippingCost: 10000,
    total: 46400,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 2, price: 18200 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Dewi Anggraini",
      phone: "0857 1234 5678",
      street: "Jl. Veteran No. 8",
      district: "Kecamatan Lowokwaru, Kelurahan Ketawanggede",
      city: "Malang",
      province: "Jawa Timur",
      postalCode: "65145",
    },
  },
  {
    id: "21349",
    date: "2026-05-04T16:45:00.000Z",
    customer: "Riko Pratama",
    customerPhone: "0812 7777 8888",
    subtotal: 28000,
    shippingCost: 12000,
    total: 40000,
    status: "inbox",
    paymentMethod: "Bayar di Tempat (COD)",
    paymentStatus: "Belum Bayar",
    items: [
      { name: "Tomat", unit: "1 Kg", qty: 1, price: 28000 },
    ],
    shippingMethod: "Grab",
    shippingAddress: {
      recipient: "Riko Pratama",
      phone: "0812 7777 8888",
      street: "Jl. Merdeka No. 22",
      district: "Kecamatan Sumur Bandung, Kelurahan Cikawao",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40114",
    },
  },
  {
    id: "21350",
    date: "2026-05-04T08:00:00.000Z",
    customer: "Lia Marlina",
    customerPhone: "0821 3333 4444",
    subtotal: 97000,
    shippingCost: 0,
    total: 97000,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Bawang Merah", unit: "1 Kg", qty: 1, price: 45000 },
      { name: "Wortel", unit: "1 Kg", qty: 2, price: 26000 },
    ],
    shippingMethod: "JNE Regular",
    shippingAddress: {
      recipient: "Lia Marlina",
      phone: "0821 3333 4444",
      street: "Jl. Asia Afrika No. 100",
      district: "Kecamatan Tanah Abang, Kelurahan Bendungan Hilir",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10210",
    },
  },
  {
    id: "21351",
    date: "2026-05-04T07:30:00.000Z",
    customer: "Yoga Wiratama",
    customerPhone: "0812 5555 6666",
    subtotal: 18200,
    shippingCost: 10000,
    total: 28200,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 1, price: 18200 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Yoga Wiratama",
      phone: "0812 5555 6666",
      street: "Jl. Sudirman No. 5",
      district: "Kecamatan Cibeunying Kidul, Kelurahan Sukamaju",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40121",
    },
  },
  {
    id: "21340",
    date: "2026-05-03T10:00:00.000Z",
    customer: "Maharani Putri",
    customerPhone: "0812 9988 7766",
    subtotal: 36400,
    shippingCost: 10000,
    total: 46400,
    status: "inbox",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Tomat", unit: "1 Kg", qty: 1, price: 28000 },
      { name: "Wortel", unit: "1 Kg", qty: 1, price: 26000 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Maharani Putri",
      phone: "0812 9988 7766",
      street: "Jl. Cempaka No. 7",
      district: "Kecamatan Menteng, Kelurahan Gondangdia",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10350",
    },
  },
  {
    id: "21341",
    date: "2026-05-03T14:00:00.000Z",
    customer: "Bagas Adhi Pratama",
    customerPhone: "0858 1122 3344",
    subtotal: 71000,
    shippingCost: 0,
    total: 71000,
    status: "inbox",
    paymentMethod: "Transfer Bank BCA",
    paymentStatus: "Lunas",
    items: [
      { name: "Bawang Merah", unit: "1 Kg", qty: 1, price: 45000 },
      { name: "Wortel", unit: "1 Kg", qty: 1, price: 26000 },
    ],
    shippingMethod: "JNE Regular",
    shippingAddress: {
      recipient: "Bagas Adhi Pratama",
      phone: "0858 1122 3344",
      street: "Jl. Pangeran Antasari No. 18",
      district: "Kecamatan Cilandak, Kelurahan Cilandak Barat",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12430",
    },
  },
  // On the way
  {
    id: "21320",
    date: "2026-05-02T10:00:00.000Z",
    customer: "Rangga Wijaya",
    customerPhone: "0813 2244 5566",
    subtotal: 54600,
    shippingCost: 10000,
    total: 64600,
    status: "on_the_way",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 3, price: 18200 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Rangga Wijaya",
      phone: "0813 2244 5566",
      street: "Jl. Gajah Mada No. 88",
      district: "Kecamatan Gambir, Kelurahan Petojo Utara",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10130",
    },
  },
  {
    id: "21321",
    date: "2026-05-02T11:00:00.000Z",
    customer: "Citra Kirana",
    customerPhone: "0812 6677 8899",
    subtotal: 74000,
    shippingCost: 0,
    total: 74000,
    status: "on_the_way",
    paymentMethod: "DANA",
    paymentStatus: "Lunas",
    items: [
      { name: "Bawang Merah", unit: "1 Kg", qty: 1, price: 45000 },
      { name: "Wortel", unit: "1 Kg", qty: 1, price: 26000 },
    ],
    shippingMethod: "JNE Regular",
    shippingAddress: {
      recipient: "Citra Kirana",
      phone: "0812 6677 8899",
      street: "Jl. Cikini Raya No. 40",
      district: "Kecamatan Menteng, Kelurahan Cikini",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10330",
    },
  },
  // Selesai
  {
    id: "21300",
    date: "2026-04-28T10:00:00.000Z",
    customer: "Fadli Ananda",
    customerPhone: "0856 3344 5566",
    subtotal: 18200,
    shippingCost: 10000,
    total: 28200,
    status: "completed",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Brokoli", unit: "1 Kg", qty: 1, price: 18200 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Fadli Ananda",
      phone: "0856 3344 5566",
      street: "Jl. Kemang Raya No. 5",
      district: "Kecamatan Mampang Prapatan, Kelurahan Bangka",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12730",
    },
  },
  {
    id: "21301",
    date: "2026-04-27T10:00:00.000Z",
    customer: "Indah Permata",
    customerPhone: "0812 1122 9988",
    subtotal: 56000,
    shippingCost: 10000,
    total: 66000,
    status: "completed",
    paymentMethod: "QRIS (default)",
    paymentStatus: "Lunas",
    items: [
      { name: "Tomat", unit: "1 Kg", qty: 2, price: 28000 },
    ],
    shippingMethod: "Gojek",
    shippingAddress: {
      recipient: "Indah Permata",
      phone: "0812 1122 9988",
      street: "Jl. Benda Raya No. 12",
      district: "Kecamatan Cilandak, Kelurahan Cilandak Timur",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12560",
    },
  },
];

// Alamat toko asal (untuk halaman /mitra/address)
export const storeAddress = {
  label: "Toko Utama",
  isPrimary: true,
  recipient: "Pemilik Toko Sayur Segar",
  phone: "0812 1234 5678",
  street: "Jl. Raya Bogor No. 25, Pasar Induk Kramat Jati, Blok B-12",
  district: "Kecamatan Kramat Jati, Kelurahan Tengah",
  city: "Jakarta Timur",
  province: "DKI Jakarta",
  postalCode: "13540",
  // Koordinat peta (placeholder)
  coordinates: { lat: -6.2615, lng: 106.8665 },
};

// Detail akun mitra (untuk halaman /mitra/account)
export const merchantAccount = {
  storeName: "Toko Sayur Segar",
  ownerName: "Budi Hartono",
  email: "toko.sayur.segar@email.com",
  phone: "0812 1234 5678",
  storeType: "Toko Retail",
  description:
    "Toko sayur segar yang menyediakan berbagai macam sayuran dan buah lokal berkualitas langsung dari petani. Berdiri sejak 2018, melayani pelanggan di wilayah Jabodetabek dengan komitmen kesegaran dan harga terjangkau.",
  // Jam operasional per hari
  operatingHours: {
    Senin: { open: "06:00", close: "20:00", isOpen: true },
    Selasa: { open: "06:00", close: "20:00", isOpen: true },
    Rabu: { open: "06:00", close: "20:00", isOpen: true },
    Kamis: { open: "06:00", close: "20:00", isOpen: true },
    Jumat: { open: "06:00", close: "20:00", isOpen: true },
    Sabtu: { open: "06:00", close: "21:00", isOpen: true },
    Minggu: { open: "07:00", close: "18:00", isOpen: true },
  },
  // Rekening payout
  bankAccount: {
    bank: "BCA",
    accountNumber: "123-456-7890",
    accountName: "Budi Hartono",
  },
  // Statistik toko
  stats: {
    joinedDate: "2026-05-04",
    totalProducts: 4,
    totalOrders: 14,
    rating: 4.8,
    totalReviews: 5,
  },
};

// Pendapatan 7 hari terakhir (untuk chart di dasbor)
export const weeklyRevenue: { day: string; value: number }[] = [
  { day: "Sen", value: 182000 },
  { day: "Sel", value: 245000 },
  { day: "Rab", value: 168000 },
  { day: "Kam", value: 312000 },
  { day: "Jum", value: 278000 },
  { day: "Sab", value: 425000 },
  { day: "Min", value: 356000 },
];
