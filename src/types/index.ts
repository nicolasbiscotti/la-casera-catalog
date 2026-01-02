/**
 * Core data types for the catalog system
 * Designed to support flexible pricing models and future e-commerce expansion
 */

// Price types - flexible system to handle various pricing models
export type PriceType = 'unit' | 'weight' | 'fraction';

export interface UnitPrice {
  type: 'unit';
  price: number;
  unitLabel: string; // e.g., "paquete", "unidad", "docena"
}

export interface WeightPrice {
  type: 'weight';
  pricePerKg: number;
  availableWeights?: number[]; // Common weights in grams, e.g., [100, 250, 500, 1000]
}

export interface FractionPrice {
  type: 'fraction';
  prices: {
    whole: number;      // Horma entera
    half: number;       // 1/2
    quarter: number;    // 1/4
  };
  fractionLabel: string; // e.g., "horma", "pieza"
}

// Union type for all price configurations
export type ProductPrice = UnitPrice | WeightPrice | FractionPrice;

// Product entity
export interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  description?: string;
  prices: ProductPrice[];
  imageUrl?: string;
  isAvailable: boolean;
  tags?: string[];
  // Future e-commerce fields
  stock?: number;
  sku?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Brand entity
export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category (Rubro) entity
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  parentId?: string; // For nested categories
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Aggregated view types for UI
export interface CategoryWithBrands extends Category {
  brands: BrandWithProducts[];
}

export interface BrandWithProducts extends Brand {
  products: Product[];
}

// Search and filter types
export interface SearchFilters {
  query: string;
  categoryId?: string;
  brandId?: string;
  priceType?: PriceType;
  isAvailable?: boolean;
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  categories: Category[];
  brands: Brand[];
}

// Admin types
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Price change log for history tracking
export interface PriceChangeLog {
  id: string;
  productId: string;
  productName: string;
  previousPrices: ProductPrice[];
  newPrices: ProductPrice[];
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

// Environment configuration
export interface EnvironmentConfig {
  id: string;
  name: string;
  firestorePath: string;
  isProduction: boolean;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  expandedCategories: Set<string>;
  expandedBrands: Set<string>;
}

// Price formatting helpers type
export interface FormattedPrice {
  display: string;
  value: number;
  unit: string;
}
