/**
 * Price History Service
 * Track and query price changes
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getDb } from './firebase';
import { COLLECTIONS } from './firebase.config';
import type { PriceChangeLog, ProductPrice } from '../types';

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
 * Get all price history entries, ordered by date descending
 */
export async function getPriceHistory(limitCount: number = 50): Promise<PriceChangeLog[]> {
  const db = getDb();
  const historyRef = collection(db, COLLECTIONS.priceHistory());
  const q = query(
    historyRef, 
    orderBy('changedAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToPriceChangeLog(doc.id, doc.data()));
}

/**
 * Get price history for a specific product
 */
export async function getProductPriceHistory(productId: string): Promise<PriceChangeLog[]> {
  const db = getDb();
  const historyRef = collection(db, COLLECTIONS.priceHistory());
  const q = query(
    historyRef,
    where('productId', '==', productId),
    orderBy('changedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToPriceChangeLog(doc.id, doc.data()));
}

/**
 * Log a price change
 */
export async function logPriceChange(data: {
  productId: string;
  productName: string;
  previousPrices: ProductPrice[];
  newPrices: ProductPrice[];
  changedBy: string;
  reason?: string;
}): Promise<PriceChangeLog> {
  const db = getDb();
  const historyRef = collection(db, COLLECTIONS.priceHistory());
  
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
export async function getRecentPriceChanges(days: number = 7): Promise<PriceChangeLog[]> {
  const db = getDb();
  const historyRef = collection(db, COLLECTIONS.priceHistory());
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const q = query(
    historyRef,
    where('changedAt', '>=', Timestamp.fromDate(cutoffDate)),
    orderBy('changedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToPriceChangeLog(doc.id, doc.data()));
}
