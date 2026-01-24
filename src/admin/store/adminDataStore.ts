import type { Category, Brand, Product } from "@/types";
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
  logPriceChange,
} from "@/services";
import { getCurrentUser } from "./authStore";

// Admin Data State
interface AdminDataState {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

let state: AdminDataState = {
  categories: [],
  brands: [],
  products: [],
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
    const userId = getCurrentUser()?.uid;

    if (id) {
      await updateBrand(id, data, userId);
    } else {
      await createBrand(data, userId);
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
    const userId = getCurrentUser()?.uid || "unknown";

    // Track price changes in Firestore when editing existing product
    if (id) {
      const existingProduct = state.products.find((p) => p.id === id);
      if (existingProduct) {
        const oldPrices = JSON.stringify(existingProduct.prices);
        const newPrices = JSON.stringify(data.prices);

        // Log price change to Firestore if prices are different
        if (oldPrices !== newPrices) {
          try {
            await logPriceChange({
              productId: id,
              productName: existingProduct.name,
              previousPrices: existingProduct.prices,
              newPrices: data.prices,

              changedBy: userId,
            });
          } catch (logError) {
            // Log error but don't fail the product update
            console.error("Error logging price change:", logError);
          }
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
