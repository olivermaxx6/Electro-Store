export type Category = {
  id: string;
  slug: string;
  name: string;
  parentId?: string;
  children?: Category[];
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: string; // slug
  brand?: string;
  price: number;
  oldPrice?: number;
  rating?: number; // 0-5
  ratingCount?: number;
  viewCount?: number;
  isNew?: boolean;
  discountPct?: number;
  specs?: Record<string, string>;
  description?: string;
  images?: string[];
  stock?: number;
  inStock?: boolean;
  sku?: string;
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type WishlistItem = {
  productId: string;
  addedAt: string;
};

export type Address = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
};

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  address?: Address;
};

export type User = {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
};

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "RUB" | "BRL" | "MXN" | "ZAR" | "TRY" | "AED" | "SAR" | "THB" | "MYR" | "IDR" | "PHP";

export type SortOption = "popularity" | "newest" | "price-low" | "price-high";

export type FilterState = {
  category?: string;
  priceRange?: [number, number];
  brand?: string[];
  rating?: number;
  onlyDiscounted?: boolean;
};

export type UIState = {
  currency: Currency;
  theme: "light" | "dark";
  toasts: Toast[];
};

export type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
};

export type CheckoutStep = "address" | "shipping" | "payment" | "review";

export type ShippingOption = {
  id: string;
  name: string;
  cost: number;
  estimatedDays: string;
};

export type PaymentMethod = "card" | "paypal" | "delivery";
