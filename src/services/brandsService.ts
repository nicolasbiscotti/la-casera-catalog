/**
 * Brands Service
 * CRUD operations for brands collection
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
import type { Brand } from '../types';

/**
 * Convert Firestore document to Brand
 */
function docToBrand(id: string, data: DocumentData): Brand {
  return {
    id,
    name: data.name,
    logoUrl: data.logoUrl,
    description: data.description,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get all brands
 */
export async function getBrands(): Promise<Brand[]> {
  const db = getDb();
  const brandsRef = collection(db, COLLECTIONS.brands());
  const q = query(brandsRef, orderBy('sortOrder', 'asc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToBrand(doc.id, doc.data()));
}

/**
 * Get active brands only
 */
export async function getActiveBrands(): Promise<Brand[]> {
  const db = getDb();
  const brandsRef = collection(db, COLLECTIONS.brands());
  const q = query(
    brandsRef, 
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToBrand(doc.id, doc.data()));
}

/**
 * Get brand by ID
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.brands(), id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docToBrand(docSnap.id, docSnap.data());
}

/**
 * Get brands by category (brands that have products in the category)
 */
export async function getBrandsByCategory(categoryId: string): Promise<Brand[]> {
  // First get all products in the category to find brand IDs
  const db = getDb();
  const productsRef = collection(db, COLLECTIONS.products());
  const productsQuery = query(productsRef, where('categoryId', '==', categoryId));
  const productsSnapshot = await getDocs(productsQuery);
  
  const brandIds = [...new Set(productsSnapshot.docs.map(doc => doc.data().brandId))];
  
  if (brandIds.length === 0) {
    return [];
  }
  
  // Get the brands
  const brands = await getBrands();
  return brands.filter(brand => brandIds.includes(brand.id) && brand.isActive);
}

/**
 * Create a new brand
 */
export async function createBrand(
  data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Brand> {
  const db = getDb();
  const brandsRef = collection(db, COLLECTIONS.brands());
  
  const now = Timestamp.now();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(brandsRef, docData);
  
  return {
    id: docRef.id,
    ...data,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

/**
 * Update a brand
 */
export async function updateBrand(
  id: string,
  data: Partial<Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.brands(), id);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.brands(), id);
  await deleteDoc(docRef);
}

/**
 * Toggle brand active status
 */
export async function toggleBrandActive(id: string, isActive: boolean): Promise<void> {
  await updateBrand(id, { isActive });
}
