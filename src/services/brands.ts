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
import type { Brand, FirestoreTimestamp } from "@/types";

const COLLECTION_NAME = "brands";

// Convert Firestore document to Brand
function docToBrand(id: string, data: Record<string, unknown>): Brand {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    logoUrl: data.logoUrl as string | undefined,
    isActive: data.isActive as boolean,
    sortOrder: data.sortOrder as number,
    createdAt: (data.createdAt as FirestoreTimestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as FirestoreTimestamp)?.toDate() || new Date(),
    createdBy: data.createdBy as string | undefined,
    lastModifiedBy: data.lastModifiedBy as string | undefined,
  };
}

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const q = query(collection(db, collectionPath), orderBy("sortOrder", "asc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToBrand(doc.id, doc.data()));
}

// Get active brands only
export async function getActiveBrands(): Promise<Brand[]> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const q = query(
    collection(db, collectionPath),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToBrand(doc.id, doc.data()));
}

// Get brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const docRef = doc(db, collectionPath, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return docToBrand(docSnap.id, docSnap.data());
}

// Create brand
export async function createBrand(
  data: Omit<Brand, "id" | "createdAt" | "updatedAt">,
  userId?: string,
): Promise<Brand> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  console.log("db ==> ", db);
  console.log("collectionPath ==> ", collectionPath);
  console.log("create brand function ==> ", data);

  const now = Timestamp.now();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    lastModifiedBy: userId,
  };

  const docRef = await addDoc(collection(db, collectionPath), docData);
  return docToBrand(docRef.id, { ...docData, createdAt: now, updatedAt: now });
}

// Update brand
export async function updateBrand(
  id: string,
  data: Partial<Omit<Brand, "id" | "createdAt" | "updatedAt">>,
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

// Delete brand
export async function deleteBrand(id: string): Promise<void> {
  const db = getFirestoreDb();
  const collectionPath = getCollectionPath(COLLECTION_NAME);

  const docRef = doc(db, collectionPath, id);
  await deleteDoc(docRef);
}
