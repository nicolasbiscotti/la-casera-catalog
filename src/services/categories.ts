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
} from "firebase/firestore";
import { getFirestoreDb, getCollectionPath } from "./firebase";
import type { Category, FirestoreTimestamp } from "@/types";

const COLLECTION_NAME = "categories";

// Convert Firestore document to Category
function docToCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: data.name as string,
    slug: data.slug as string,
    description: data.description as string | undefined,
    iconName: data.iconName as string | undefined,
    isActive: data.isActive as boolean,
    sortOrder: data.sortOrder as number,
    createdAt: (data.createdAt as FirestoreTimestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as FirestoreTimestamp)?.toDate() || new Date(),
    createdBy: data.createdBy as string | undefined,
    lastModifiedBy: data.lastModifiedBy as string | undefined,
  };
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  console.log("data base ==> ", db);
  console.log("collection path ==> ", collectionPath);

  const q = query(collection(db, collectionPath), orderBy("sortOrder", "asc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToCategory(doc.id, doc.data()));
}

// Get active categories only
export async function getActiveCategories(): Promise<Category[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  console.log("data base ==> ", db);
  console.log("collection path ==> ", collectionPath);

  const q = query(
    collection(db, collectionPath),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToCategory(doc.id, doc.data()));
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const docRef = doc(db, collectionPath, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docToCategory(docSnap.id, docSnap.data());
}

// Get category by slug
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const q = query(collection(db, collectionPath), where("slug", "==", slug));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return docToCategory(doc.id, doc.data());
}

// Create category
export async function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
  userId?: string,
): Promise<Category> {
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
  return docToCategory(docRef.id, {
    ...docData,
    createdAt: now,
    updatedAt: now,
  });
}

// Update category
export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
  userId?: string,
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

// Delete category
export async function deleteCategory(id: string): Promise<void> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
