// Firebase
export {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getCollectionPath,
  environment,
  isLocalDev,
} from "./firebase";

// Categories
export {
  getCategories,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories";

// Brands
export {
  getBrands,
  getActiveBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "./brands";

// Products
export {
  getProducts,
  getAvailableProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products";

// Price History
export {
  getPriceHistory,
  getProductPriceHistory,
  logPriceChange,
  getRecentPriceChanges,
} from "./priceHistoryService";

export type { PriceChangeLog } from "./priceHistoryService";
