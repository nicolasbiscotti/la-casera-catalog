import type { Category, Brand, Product, CatalogState } from "@/types";
import {
  getActiveCategories,
  getActiveBrands,
  getAvailableProducts,
} from "@/services";
import { matchesSearch } from "@/utils";

// Initial state
const initialState: CatalogState = {
  categories: [],
  brands: [],
  products: [],
  isLoading: true,
  error: null,
  searchQuery: "",
  expandedCategories: new Set<string>(),
  expandedBrands: new Set<string>(),
};

// Current state
let state = { ...initialState };

// Subscribers for state changes
type Subscriber = (state: CatalogState) => void;
const subscribers: Set<Subscriber> = new Set();

// Get current state
export function getState(): CatalogState {
  return state;
}

// Subscribe to state changes
export function subscribe(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Notify all subscribers
function notifySubscribers(): void {
  subscribers.forEach((callback) => callback(state));
}

// Update state
function setState(updates: Partial<CatalogState>): void {
  state = { ...state, ...updates };
  notifySubscribers();
}

// Load catalog data from Firebase
export async function loadCatalog(): Promise<void> {
  setState({ isLoading: true, error: null });

  try {
    const [categories, brands, products] = await Promise.all([
      getActiveCategories(),
      getActiveBrands(),
      getAvailableProducts(),
    ]);

    setState({
      categories,
      brands,
      products,
      expandedCategories: new Set(categories.map((c) => c.id)),
      expandedBrands: new Set(brands.map((b) => b.id)),
      isLoading: false,
    });
  } catch (error) {
    console.error("Error loading catalog:", error);
    setState({
      isLoading: false,
      error:
        error instanceof Error ? error.message : "Error al cargar el catálogo",
    });
  }
}

// Search actions
export function setSearchQuery(query: string): void {
  setState({ searchQuery: query });
}

export function clearSearch(): void {
  setState({ searchQuery: "" });
}

// Expansion actions
export function toggleCategory(categoryId: string): void {
  const expanded = new Set(state.expandedCategories);
  if (expanded.has(categoryId)) {
    expanded.delete(categoryId);
  } else {
    expanded.add(categoryId);
  }
  setState({ expandedCategories: expanded });
}

export function toggleBrand(brandId: string): void {
  const expanded = new Set(state.expandedBrands);
  if (expanded.has(brandId)) {
    expanded.delete(brandId);
  } else {
    expanded.add(brandId);
  }
  setState({ expandedBrands: expanded });
}

export function expandAll(): void {
  const expandedCategories = new Set(state.categories.map((c) => c.id));
  const expandedBrands = new Set(state.brands.map((b) => b.id));
  setState({ expandedCategories, expandedBrands });
}

export function collapseAll(): void {
  setState({
    expandedCategories: new Set(),
    expandedBrands: new Set(),
  });
}

// Selectors
export function getFilteredProducts(): Product[] {
  const { products, searchQuery } = state;

  if (!searchQuery.trim()) {
    return products;
  }

  return products.filter((product) => {
    const brand = state.brands.find((b) => b.id === product.brandId);
    const category = state.categories.find((c) => c.id === product.categoryId);

    return (
      matchesSearch(product.name, searchQuery) ||
      (brand && matchesSearch(brand.name, searchQuery)) ||
      (category && matchesSearch(category.name, searchQuery)) ||
      product.tags?.some((tag) => matchesSearch(tag, searchQuery))
    );
  });
}

export function getProductsByCategory(categoryId: string): Product[] {
  return state.products.filter((p) => p.categoryId === categoryId);
}

export function getProductsByBrand(brandId: string): Product[] {
  return state.products.filter((p) => p.brandId === brandId);
}

export function getBrandsByCategory(categoryId: string): Brand[] {
  const categoryProducts = getProductsByCategory(categoryId);
  const brandIds = new Set(categoryProducts.map((p) => p.brandId));
  return state.brands.filter((b) => brandIds.has(b.id));
}

export function getCategoryById(id: string): Category | undefined {
  return state.categories.find((c) => c.id === id);
}

export function getBrandById(id: string): Brand | undefined {
  return state.brands.find((b) => b.id === id);
}

export function isSearching(): boolean {
  return state.searchQuery.trim().length > 0;
}

export function isCategoryExpanded(categoryId: string): boolean {
  return state.expandedCategories.has(categoryId);
}

export function isBrandExpanded(brandId: string): boolean {
  return state.expandedBrands.has(brandId);
}
