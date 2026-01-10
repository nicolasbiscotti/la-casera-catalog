/**
 * Admin Data Store
 * Manages CRUD operations for categories, brands, and products
 * Uses mock data for demo, connects to Firestore in production
 */

import { createStore } from '@/store/catalogStore';
import type { Category, Brand, Product, ProductPrice, PriceChangeLog } from '@/types';
import { mockCategories, mockBrands, mockProducts } from '@/services/mockData';

export interface AdminDataState {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  priceHistory: PriceChangeLog[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: AdminDataState = {
  categories: [...mockCategories],
  brands: [...mockBrands],
  products: [...mockProducts],
  priceHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: new Date(),
};

export const adminDataStore = createStore<AdminDataState>(initialState);

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Admin data actions
export const adminDataActions = {
  // ============================================================
  // CATEGORIES
  // ============================================================

  getCategories: (): Category[] => {
    return adminDataStore.getState().categories;
  },

  getCategoryById: (id: string): Category | undefined => {
    return adminDataStore.getState().categories.find(c => c.id === id);
  },

  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category => {
    const newCategory: Category = {
      ...data,
      id: generateId('cat'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    adminDataStore.setState(state => ({
      categories: [...state.categories, newCategory],
      lastUpdated: new Date(),
    }));

    return newCategory;
  },

  updateCategory: (id: string, data: Partial<Category>): Category | null => {
    let updatedCategory: Category | null = null;

    adminDataStore.setState(state => ({
      categories: state.categories.map(c => {
        if (c.id === id) {
          updatedCategory = { ...c, ...data, updatedAt: new Date() };
          return updatedCategory;
        }
        return c;
      }),
      lastUpdated: new Date(),
    }));

    return updatedCategory;
  },

  deleteCategory: (id: string): boolean => {
    const { products } = adminDataStore.getState();
    const hasProducts = products.some(p => p.categoryId === id);
    
    if (hasProducts) {
      adminDataStore.setState({ error: 'No se puede eliminar: hay productos en esta categoría' });
      return false;
    }

    adminDataStore.setState(state => ({
      categories: state.categories.filter(c => c.id !== id),
      lastUpdated: new Date(),
    }));

    return true;
  },

  // ============================================================
  // BRANDS
  // ============================================================

  getBrands: (): Brand[] => {
    return adminDataStore.getState().brands;
  },

  getBrandById: (id: string): Brand | undefined => {
    return adminDataStore.getState().brands.find(b => b.id === id);
  },

  createBrand: (data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Brand => {
    const newBrand: Brand = {
      ...data,
      id: generateId('brand'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    adminDataStore.setState(state => ({
      brands: [...state.brands, newBrand],
      lastUpdated: new Date(),
    }));

    return newBrand;
  },

  updateBrand: (id: string, data: Partial<Brand>): Brand | null => {
    let updatedBrand: Brand | null = null;

    adminDataStore.setState(state => ({
      brands: state.brands.map(b => {
        if (b.id === id) {
          updatedBrand = { ...b, ...data, updatedAt: new Date() };
          return updatedBrand;
        }
        return b;
      }),
      lastUpdated: new Date(),
    }));

    return updatedBrand;
  },

  deleteBrand: (id: string): boolean => {
    const { products } = adminDataStore.getState();
    const hasProducts = products.some(p => p.brandId === id);
    
    if (hasProducts) {
      adminDataStore.setState({ error: 'No se puede eliminar: hay productos de esta marca' });
      return false;
    }

    adminDataStore.setState(state => ({
      brands: state.brands.filter(b => b.id !== id),
      lastUpdated: new Date(),
    }));

    return true;
  },

  // ============================================================
  // PRODUCTS
  // ============================================================

  getProducts: (): Product[] => {
    return adminDataStore.getState().products;
  },

  getProductById: (id: string): Product | undefined => {
    return adminDataStore.getState().products.find(p => p.id === id);
  },

  getProductsByCategory: (categoryId: string): Product[] => {
    return adminDataStore.getState().products.filter(p => p.categoryId === categoryId);
  },

  getProductsByBrand: (brandId: string): Product[] => {
    return adminDataStore.getState().products.filter(p => p.brandId === brandId);
  },

  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: generateId('prod'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    adminDataStore.setState(state => ({
      products: [...state.products, newProduct],
      lastUpdated: new Date(),
    }));

    return newProduct;
  },

  updateProduct: (id: string, data: Partial<Product>): Product | null => {
    let updatedProduct: Product | null = null;
    const { products } = adminDataStore.getState();
    const existingProduct = products.find(p => p.id === id);

    // Log price change if prices are being updated
    if (data.prices && existingProduct) {
      const priceLog: PriceChangeLog = {
        id: generateId('log'),
        productId: id,
        productName: existingProduct.name,
        previousPrices: existingProduct.prices,
        newPrices: data.prices,
        changedBy: 'admin', // In production, get from auth
        changedAt: new Date(),
      };

      adminDataStore.setState(state => ({
        priceHistory: [priceLog, ...state.priceHistory].slice(0, 100), // Keep last 100
      }));
    }

    adminDataStore.setState(state => ({
      products: state.products.map(p => {
        if (p.id === id) {
          updatedProduct = { ...p, ...data, updatedAt: new Date() };
          return updatedProduct;
        }
        return p;
      }),
      lastUpdated: new Date(),
    }));

    return updatedProduct;
  },

  deleteProduct: (id: string): boolean => {
    adminDataStore.setState(state => ({
      products: state.products.filter(p => p.id !== id),
      lastUpdated: new Date(),
    }));
    return true;
  },

  toggleProductAvailability: (id: string): boolean => {
    const product = adminDataStore.getState().products.find(p => p.id === id);
    if (!product) return false;

    adminDataActions.updateProduct(id, { isAvailable: !product.isAvailable });
    return true;
  },

  // ============================================================
  // BULK OPERATIONS
  // ============================================================

  bulkUpdatePrices: (updates: Array<{ productId: string; prices: ProductPrice[] }>): number => {
    let updatedCount = 0;

    updates.forEach(({ productId, prices }) => {
      const result = adminDataActions.updateProduct(productId, { prices });
      if (result) updatedCount++;
    });

    return updatedCount;
  },

  // ============================================================
  // PRICE HISTORY
  // ============================================================

  getPriceHistory: (productId?: string): PriceChangeLog[] => {
    const { priceHistory } = adminDataStore.getState();
    if (productId) {
      return priceHistory.filter(log => log.productId === productId);
    }
    return priceHistory;
  },

  // ============================================================
  // UTILS
  // ============================================================

  clearError: (): void => {
    adminDataStore.setState({ error: null });
  },

  // Get stats for dashboard
  getStats: () => {
    const { categories, brands, products } = adminDataStore.getState();
    const availableProducts = products.filter(p => p.isAvailable).length;
    const unavailableProducts = products.length - availableProducts;

    return {
      totalCategories: categories.length,
      totalBrands: brands.length,
      totalProducts: products.length,
      availableProducts,
      unavailableProducts,
    };
  },
};
