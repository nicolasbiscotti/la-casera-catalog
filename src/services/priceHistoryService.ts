/**
 * Price History Service
 * Track and query price changes in Firestore
 */

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { getFirestoreDb, getCollectionPath } from "./firebase";
import type { Price } from "@/types";

// Price Change Log type (extends the base PriceChange with productName for history display)
export interface PriceChangeLog {
  id: string;
  productId: string;
  productName: string;
  previousPrices: Price[];
  newPrices: Price[];
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

/**
 * Convert Firestore document to PriceChangeLog
 */
function docToPriceChangeLog(id: string, data: DocumentData): PriceChangeLog {
  return {
    id,
    productId: data.productId,
    productName: data.productName,
    previousPrices: data.previousPrices || [],
    newPrices: data.newPrices || [],
    changedBy: data.changedBy,
    changedAt: data.changedAt?.toDate() || new Date(),
    reason: data.reason,
  };
}

/**
 * Get the price history collection reference
 */
function getPriceHistoryCollection() {
  const db = getFirestoreDb();
  return collection(db, getCollectionPath("priceHistory"));
}

/**
 * Get all price history entries, ordered by date descending
 */
export async function getPriceHistory(
  limitCount: number = 50,
): Promise<PriceChangeLog[]> {
  const historyRef = getPriceHistoryCollection();
  const q = query(historyRef, orderBy("changedAt", "desc"), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToPriceChangeLog(doc.id, doc.data()));
}

/**
 * Get price history for a specific product
 */
export async function getProductPriceHistory(
  productId: string,
): Promise<PriceChangeLog[]> {
  const historyRef = getPriceHistoryCollection();
  const q = query(
    historyRef,
    where("productId", "==", productId),
    orderBy("changedAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToPriceChangeLog(doc.id, doc.data()));
}

/**
 * Log a price change to Firestore
 */
export async function logPriceChange(data: {
  productId: string;
  productName: string;
  previousPrices: Price[];
  newPrices: Price[];
  changedBy: string;
  reason?: string;
}): Promise<PriceChangeLog> {
  const historyRef = getPriceHistoryCollection();

  const now = Timestamp.now();
  const docData = {
    ...data,
    changedAt: now,
  };

  const docRef = await addDoc(historyRef, docData);

  return {
    id: docRef.id,
    ...data,
    changedAt: now.toDate(),
  };
}

/**
 * Get recent price changes (last N days)
 */
export async function getRecentPriceChanges(
  days: number = 7,
): Promise<PriceChangeLog[]> {
  const historyRef = getPriceHistoryCollection();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const q = query(
    historyRef,
    where("changedAt", ">=", Timestamp.fromDate(cutoffDate)),
    orderBy("changedAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => docToPriceChangeLog(doc.id, doc.data()));
}
