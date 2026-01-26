// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Price Types
export type PriceType = "unit" | "weight" | "fraction";

export interface UnitPrice {
  type: "unit";
  price: number;
  unitLabel: string; // e.g., 'paquete', 'unidad', 'docena'
}

export interface WeightPrice {
  type: "weight";
  pricePerKg: number;
  availableWeights: number[]; // in grams, e.g., [100, 250, 500, 1000]
}

export interface FractionPrice {
  type: "fraction";
  prices: {
    whole: number;
    half?: number;
    quarter?: number;
  };
  fractionLabel: string; // e.g., 'horma', 'pieza'
}

export type Price = UnitPrice | WeightPrice | FractionPrice;

// Product Types
export interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  prices: Price[];
  isAvailable: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Price History
export interface PriceChange {
  id: string;
  productId: string;
  previousPrices: Price[];
  newPrices: Price[];
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

// Admin User
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "editor";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Catalog State
export interface CatalogState {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  expandedCategories: Set<string>;
  expandedBrands: Set<string>;
}

// Firebase Document Converters
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}
