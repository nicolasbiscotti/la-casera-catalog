/**
 * Simple state management store
 * Decoupled design allows easy migration to Zustand or other libraries
 */

type Listener<T> = (state: T) => void;

export interface Store<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

// Create a simple store with subscribe pattern
export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextPartial = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextPartial };
    listeners.forEach(listener => listener(state));
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}

// Catalog UI State
export interface CatalogState {
  searchQuery: string;
  expandedCategories: Set<string>;
  expandedBrands: Set<string>;
  isLoading: boolean;
  error: string | null;
}

const initialCatalogState: CatalogState = {
  searchQuery: '',
  expandedCategories: new Set(),
  expandedBrands: new Set(),
  isLoading: false,
  error: null,
};

// Create the catalog store
export const catalogStore = createStore<CatalogState>(initialCatalogState);

// Action helpers for catalog store
export const catalogActions = {
  setSearchQuery: (query: string) => {
    catalogStore.setState({ searchQuery: query });
  },

  toggleCategory: (categoryId: string) => {
    const { expandedCategories } = catalogStore.getState();
    const newExpanded = new Set(expandedCategories);
    
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    
    catalogStore.setState({ expandedCategories: newExpanded });
  },

  toggleBrand: (brandId: string) => {
    const { expandedBrands } = catalogStore.getState();
    const newExpanded = new Set(expandedBrands);
    
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId);
    } else {
      newExpanded.add(brandId);
    }
    
    catalogStore.setState({ expandedBrands: newExpanded });
  },

  expandAll: (categoryIds: string[], brandIds: string[]) => {
    catalogStore.setState({
      expandedCategories: new Set(categoryIds),
      expandedBrands: new Set(brandIds),
    });
  },

  collapseAll: () => {
    catalogStore.setState({
      expandedCategories: new Set(),
      expandedBrands: new Set(),
    });
  },

  setLoading: (isLoading: boolean) => {
    catalogStore.setState({ isLoading });
  },

  setError: (error: string | null) => {
    catalogStore.setState({ error });
  },

  clearSearch: () => {
    catalogStore.setState({ searchQuery: '' });
  },
};
