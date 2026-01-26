import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreDb, getCollectionPath } from './firebase';
import type { Product, Price, FirestoreTimestamp } from '@/types';

const COLLECTION_NAME = 'products';

// Convert Firestore document to Product
function docToProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: data.name as string,
    brandId: data.brandId as string,
    categoryId: data.categoryId as string,
    description: data.description as string | undefined,
    imageUrl: data.imageUrl as string | undefined,
    prices: data.prices as Price[],
    isAvailable: data.isAvailable as boolean,
    tags: data.tags as string[] | undefined,
    createdAt: (data.createdAt as FirestoreTimestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as FirestoreTimestamp)?.toDate() || new Date(),
    createdBy: data.createdBy as string | undefined,
    lastModifiedBy: data.lastModifiedBy as string | undefined,
  };
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const q = query(
    collection(db, collectionPath),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

// Get available products only
export async function getAvailableProducts(): Promise<Product[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const q = query(
    collection(db, collectionPath),
    where('isAvailable', '==', true),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

// Get products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const q = query(
    collection(db, collectionPath),
    where('categoryId', '==', categoryId),
    where('isAvailable', '==', true),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

// Get products by brand
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const q = query(
    collection(db, collectionPath),
    where('brandId', '==', brandId),
    where('isAvailable', '==', true),
    orderBy('name', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToProduct(doc.id, doc.data()));
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const docRef = doc(db, collectionPath, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return docToProduct(docSnap.id, docSnap.data());
}

// Create product
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Promise<Product> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const now = Timestamp.now();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    lastModifiedBy: userId,
  };
  
  const docRef = await addDoc(collection(db, collectionPath), docData);
  return docToProduct(docRef.id, { ...docData, createdAt: now, updatedAt: now });
}

// Update product
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  userId?: string
): Promise<void> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const docRef = doc(db, collectionPath, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    lastModifiedBy: userId,
  });
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);
  
  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
