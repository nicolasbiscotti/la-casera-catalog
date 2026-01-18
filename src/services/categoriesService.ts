/**
 * Categories Service
 * CRUD operations for categories collection
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
import type { Category } from '../types';

/**
 * Convert Firestore document to Category
 */
function docToCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    iconName: data.iconName,
    imageUrl: data.imageUrl,
    parentId: data.parentId,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const db = getDb();
  const categoriesRef = collection(db, COLLECTIONS.categories());
  const q = query(categoriesRef, orderBy('sortOrder', 'asc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToCategory(doc.id, doc.data()));
}

/**
 * Get active categories only
 */
export async function getActiveCategories(): Promise<Category[]> {
  const db = getDb();
  const categoriesRef = collection(db, COLLECTIONS.categories());
  const q = query(
    categoriesRef, 
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToCategory(doc.id, doc.data()));
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.categories(), id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docToCategory(docSnap.id, docSnap.data());
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = getDb();
  const categoriesRef = collection(db, COLLECTIONS.categories());
  const q = query(categoriesRef, where('slug', '==', slug));
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return docToCategory(doc.id, doc.data());
}

/**
 * Create a new category
 */
export async function createCategory(
  data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Category> {
  const db = getDb();
  const categoriesRef = collection(db, COLLECTIONS.categories());
  
  const now = Timestamp.now();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(categoriesRef, docData);
  
  return {
    id: docRef.id,
    ...data,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  };
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.categories(), id);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTIONS.categories(), id);
  await deleteDoc(docRef);
}

/**
 * Toggle category active status
 */
export async function toggleCategoryActive(id: string, isActive: boolean): Promise<void> {
  await updateCategory(id, { isActive });
}
