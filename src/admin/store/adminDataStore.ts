import type { Category, Brand, Product, PriceChange } from "@/types";
import {
  getCategories,
  getBrands,
  getProducts,
  createCategory,
  updateCategory,
  deleteCategory as deleteFirestoreCategory,
  createBrand,
  updateBrand,
  deleteBrand as deleteFirestoreBrand,
  createProduct,
  updateProduct,
  deleteProduct as deleteFirestoreProduct,
} from "@/services";
import { getCurrentUser } from "./authStore";

// Admin Data State
interface AdminDataState {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  priceHistory: PriceChange[];
  isLoading: boolean;
  error: string | null;
}

let state: AdminDataState = {
  categories: [],
  brands: [],
  products: [],
  priceHistory: [],
  isLoading: true,
  error: null,
};

// Subscribers
type Subscriber = (state: AdminDataState) => void;
const subscribers: Set<Subscriber> = new Set();

// Get current state
export function getAdminState(): AdminDataState {
  return state;
}

// Subscribe to state changes
export function subscribeAdmin(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Notify subscribers
function notifySubscribers(): void {
  subscribers.forEach((callback) => callback(state));
}

// Update state
function setAdminState(updates: Partial<AdminDataState>): void {
  state = { ...state, ...updates };
  notifySubscribers();
}

// Load all data
export async function loadAdminData(): Promise<void> {
  setAdminState({ isLoading: true, error: null });

  try {
    const [categories, brands, products] = await Promise.all([
      getCategories(),
      getBrands(),
      getProducts(),
    ]);

    setAdminState({
      categories,
      brands,
      products,
      isLoading: false,
    });
  } catch (error) {
    console.error("Error loading admin data:", error);
    setAdminState({
      isLoading: false,
      error: error instanceof Error ? error.message : "Error al cargar datos",
    });
  }
}

// Category CRUD
export async function saveCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  id?: string,
): Promise<boolean> {
  try {
    const userId = getCurrentUser()?.uid;

    if (id) {
      await updateCategory(id, data, userId);
    } else {
      await createCategory(data, userId);
    }

    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error saving category:", error);
    return false;
  }
}

export async function removeCategory(id: string): Promise<boolean> {
  // Check if category has products
  const hasProducts = state.products.some((p) => p.categoryId === id);
  if (hasProducts) {
    return false;
  }

  try {
    await deleteFirestoreCategory(id);
    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
}

// Brand CRUD
export async function saveBrand(
  data: Omit<Brand, "id" | "createdAt" | "updatedAt">,
  id?: string,
): Promise<boolean> {
  try {
    console.log("save brand function ==> ", data);

    const userId = getCurrentUser()?.uid;

    if (id) {
      await updateBrand(id, data, userId);
    } else {
      console.log("create new one ==> ", data);
      const brand = await createBrand(data, userId);
      console.log("new brand ==> ", brand);
    }

    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error saving brand:", error);
    return false;
  }
}

export async function removeBrand(id: string): Promise<boolean> {
  // Check if brand has products
  const hasProducts = state.products.some((p) => p.brandId === id);
  if (hasProducts) {
    return false;
  }

  try {
    await deleteFirestoreBrand(id);
    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error deleting brand:", error);
    return false;
  }
}

// Product CRUD
export async function saveProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">,
  id?: string,
): Promise<boolean> {
  try {
    const userId = getCurrentUser()?.uid;

    // Track price changes
    if (id) {
      const existingProduct = state.products.find((p) => p.id === id);
      if (existingProduct) {
        const oldPrices = JSON.stringify(existingProduct.prices);
        const newPrices = JSON.stringify(data.prices);

        if (oldPrices !== newPrices) {
          const priceChange: PriceChange = {
            id: `ph-${Date.now()}`,
            productId: id,
            previousPrices: existingProduct.prices,
            newPrices: data.prices,
            changedAt: new Date(),
            changedBy: userId || "unknown",
          };

          state.priceHistory = [priceChange, ...state.priceHistory];
        }
      }

      await updateProduct(id, data, userId);
    } else {
      await createProduct(data, userId);
    }

    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error saving product:", error);
    return false;
  }
}

export async function removeProduct(id: string): Promise<boolean> {
  try {
    await deleteFirestoreProduct(id);
    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

export async function toggleProductAvailability(id: string): Promise<boolean> {
  const product = state.products.find((p) => p.id === id);
  if (!product) return false;

  try {
    const userId = getCurrentUser()?.uid;
    await updateProduct(id, { isAvailable: !product.isAvailable }, userId);
    await loadAdminData();
    return true;
  } catch (error) {
    console.error("Error toggling product availability:", error);
    return false;
  }
}

// Selectors
export function getCategoryById(id: string): Category | undefined {
  return state.categories.find((c) => c.id === id);
}

export function getBrandById(id: string): Brand | undefined {
  return state.brands.find((b) => b.id === id);
}

export function getProductById(id: string): Product | undefined {
  return state.products.find((p) => p.id === id);
}

export function getProductCountByCategory(categoryId: string): number {
  return state.products.filter((p) => p.categoryId === categoryId).length;
}

export function getProductCountByBrand(brandId: string): number {
  return state.products.filter((p) => p.brandId === brandId).length;
}

export function getAvailableProductsCount(): number {
  return state.products.filter((p) => p.isAvailable).length;
}

export function getPriceHistory(): PriceChange[] {
  return state.priceHistory;
}
