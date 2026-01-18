/**
 * Products Service
 * CRUD operations for products collection
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getDb } from './firebase';
import { COLLECTIONS } from './firebase.config';
import type { Product, ProductPrice } from '../types';

/**
 * Convert Firestore document to Product
 */
function docToProduct(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name,
    brandId: data.brandId,
    categoryId: data.categoryId,
    description: data.description,
    prices: data.prices || [],
    imageUrl: data.imageUrl,
    isAvailable: data.isAvailable ?? true,
    tags: data.tags || [],
    stock: data.stock,
    sku: data.sku,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get all products
 */
export async function getProducts(): Promise<Product[]> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const q = query(productsRef, orderBy('name', 'asc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

/**
 * Get available products only
 */
export async function getAvailableProducts(): Promise<Product[]> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const q = query(
    productsRef, 
    where('isAvailable', '==', true),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.products(), id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docToProduct(docSnap.id, docSnap.data());
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const q = query(
    productsRef, 
    where('categoryId', '==', categoryId),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const q = query(
    productsRef, 
    where('brandId', '==', brandId),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

/**
 * Get products by category and brand
 */
export async function getProductsByCategoryAndBrand(
  categoryId: string, 
  brandId: string
): Promise<Product[]> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const q = query(
    productsRef,
    where('categoryId', '==', categoryId),
    where('brandId', '==', brandId),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

/**
 * Search products by name (client-side filtering for now)
 * For production, consider using Algolia or similar
 */
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  const products = await getProducts();
  const query = searchQuery.toLowerCase().trim();
  
  if (!query) {
    return [];
  }
  
  return products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.tags?.some(tag => tag.toLowerCase().includes(query))
  );
}

/**
 * Create a new product
 */
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  
  const now = Timestamp.now();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(productsRef, docData);
  
  return {
    id: docRef.id,
    ...data,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.products(), id);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update product prices
 */
export async function updateProductPrices(
  id: string,
  prices: ProductPrice[]
): Promise<void> {
  await updateProduct(id, { prices });
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.products(), id);
  await deleteDoc(docRef);
}

/**
 * Toggle product availability
 */
export async function toggleProductAvailable(id: string, isAvailable: boolean): Promise<void> {
  await updateProduct(id, { isAvailable });
}

/**
 * Get products count by category
 */
export async function getProductsCountByCategory(categoryId: string): Promise<number> {
  const products = await getProductsByCategory(categoryId);
  return products.length;
}

/**
 * Get products count by brand
 */
export async function getProductsCountByBrand(brandId: string): Promise<number> {
  const products = await getProductsByBrand(brandId);
  return products.length;
}
