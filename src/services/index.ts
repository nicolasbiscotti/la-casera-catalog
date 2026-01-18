/**
 * Services barrel export
 * Import all services from this single file
 */

// Firebase initialization
export { initializeFirebase, getDb, getAuthInstance, db, auth } from './firebase';

// Configuration
export { 
  firebaseConfig, 
  COLLECTIONS, 
  getCollectionPath, 
  useEmulators, 
  emulatorConfig 
} from './firebase.config';

// Categories
export {
  getCategories,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from './categoriesService';

// Brands
export {
  getBrands,
  getActiveBrands,
  getBrandById,
  getBrandsByCategory,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandActive,
} from './brandsService';

// Products
export {
  getProducts,
  getAvailableProducts,
  getProductById,
  getProductsByCategory,
  getProductsByBrand,
  getProductsByCategoryAndBrand,
  searchProducts,
  createProduct,
  updateProduct,
  updateProductPrices,
  deleteProduct,
  toggleProductAvailable,
  getProductsCountByCategory,
  getProductsCountByBrand,
} from './productsService';

// Price History
export {
  getPriceHistory,
  getProductPriceHistory,
  logPriceChange,
  getRecentPriceChanges,
} from './priceHistoryService';

// Authentication
export {
  login,
  logout,
  getCurrentUser,
  getCurrentAdminUser,
  isAuthenticated,
  isAdmin,
  onAuthChange,
  waitForAuth,
} from './authService';
