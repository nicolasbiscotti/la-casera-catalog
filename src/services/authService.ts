/**
 * Auth Service
 * Handle admin authentication
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuthInstance, getDb } from './firebase';
import { COLLECTIONS } from './firebase.config';
import type { AdminUser } from '../types';

/**
 * Sign in with email and password
 */
export async function login(email: string, password: string): Promise<AdminUser> {
  const auth = getAuthInstance();
  const db = getDb();
  
  // Sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Get admin user document
  const adminUserRef = doc(db, COLLECTIONS.adminUsers(), user.uid);
  const adminUserSnap = await getDoc(adminUserRef);
  
  if (!adminUserSnap.exists()) {
    // User exists in Auth but not in adminUsers collection
    await signOut(auth);
    throw new Error('Usuario no autorizado. Contacte al administrador.');
  }
  
  const adminData = adminUserSnap.data();
  
  if (!adminData.isActive) {
    await signOut(auth);
    throw new Error('Usuario desactivado. Contacte al administrador.');
  }
  
  // Update last login
  await updateDoc(adminUserRef, {
    lastLoginAt: Timestamp.now(),
  });
  
  return {
    uid: user.uid,
    email: adminData.email,
    displayName: adminData.displayName,
    role: adminData.role,
    isActive: adminData.isActive,
    createdAt: adminData.createdAt?.toDate() || new Date(),
    lastLoginAt: new Date(),
  };
}

/**
 * Sign out
 */
export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  await signOut(auth);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

/**
 * Get current admin user data
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const auth = getAuthInstance();
  const db = getDb();
  
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  
  const adminUserRef = doc(db, COLLECTIONS.adminUsers(), user.uid);
  const adminUserSnap = await getDoc(adminUserRef);
  
  if (!adminUserSnap.exists()) {
    return null;
  }
  
  const adminData = adminUserSnap.data();
  
  return {
    uid: user.uid,
    email: adminData.email,
    displayName: adminData.displayName,
    role: adminData.role,
    isActive: adminData.isActive,
    createdAt: adminData.createdAt?.toDate() || new Date(),
    lastLoginAt: adminData.lastLoginAt?.toDate(),
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const auth = getAuthInstance();
  return auth.currentUser !== null;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const adminUser = await getCurrentAdminUser();
  return adminUser?.role === 'admin';
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
}

/**
 * Wait for auth to initialize
 */
export function waitForAuth(): Promise<User | null> {
  const auth = getAuthInstance();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
