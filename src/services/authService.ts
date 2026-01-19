/**
 * Auth Service
 * Handle admin authentication with Custom Claims
 * 
 * SECURITY: Uses Custom Claims stored in Auth token (not Firestore)
 * This is faster and costs $0 per check
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
import { getAuthInstance, getDb, refreshAuthToken } from './firebase';
import { COLLECTIONS } from './firebase.config';
import type { AdminUser } from '../types';

/**
 * Sign in with email and password
 * After login, the user's token contains the admin Custom Claim
 */
export async function login(email: string, password: string): Promise<AdminUser> {
  const auth = getAuthInstance();
  const db = getDb();
  
  // Sign in with Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Force refresh token to get the latest Custom Claims
  await refreshAuthToken();
  
  // Get token with claims
  const tokenResult = await user.getIdTokenResult();
  const isAdmin = tokenResult.claims.admin === true;
  
  if (!isAdmin) {
    // Check if user exists in adminUsers collection but doesn't have claim
    // This could happen if the user was added but claims weren't set
    const adminUserRef = doc(db, COLLECTIONS.adminUsers(), user.uid);
    const adminUserSnap = await getDoc(adminUserRef);
    
    if (!adminUserSnap.exists()) {
      await signOut(auth);
      throw new Error('Usuario no autorizado. Contacte al administrador.');
    }
    
    const adminData = adminUserSnap.data();
    if (!adminData.isActive) {
      await signOut(auth);
      throw new Error('Usuario desactivado. Contacte al administrador.');
    }
    
    // User exists in DB but no admin claim - this is a configuration issue
    // For now, allow login but they won't have write access
    console.warn('User exists in adminUsers but has no admin Custom Claim ==> ');
  }
  
  // Get admin user document for additional info
  const adminUserRef = doc(db, COLLECTIONS.adminUsers(), user.uid);
  const adminUserSnap = await getDoc(adminUserRef);
  
  let adminData = {
    email: user.email || email,
    displayName: user.displayName || 'Admin',
    role: isAdmin ? 'admin' : 'viewer',
    isActive: true,
  };
  
  if (adminUserSnap.exists()) {
    const data = adminUserSnap.data();
    adminData = {
      email: data.email || adminData.email,
      displayName: data.displayName || adminData.displayName,
      role: data.role || adminData.role,
      isActive: data.isActive ?? true,
    };
    
    // Update last login
    try {
      await updateDoc(adminUserRef, {
        lastLoginAt: Timestamp.now(),
      });
    } catch {
      // Ignore if update fails (might not have permission)
    }
  }
  
  return {
    uid: user.uid,
    email: adminData.email,
    displayName: adminData.displayName,
    role: adminData.role as 'admin' | 'editor' | 'viewer',
    isActive: adminData.isActive,
    createdAt: adminUserSnap.exists() 
      ? adminUserSnap.data().createdAt?.toDate() || new Date() 
      : new Date(),
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
  
  // Check if user is anonymous (not an admin)
  if (user.isAnonymous) {
    return null;
  }
  
  // Get admin claim from token
  const tokenResult = await user.getIdTokenResult();
  const isAdmin = tokenResult.claims.admin === true;
  
  // Get admin user document for additional info
  const adminUserRef = doc(db, COLLECTIONS.adminUsers(), user.uid);
  const adminUserSnap = await getDoc(adminUserRef);
  
  if (!adminUserSnap.exists()) {
    // User is authenticated but not in adminUsers collection
    return null;
  }
  
  const adminData = adminUserSnap.data();
  
  return {
    uid: user.uid,
    email: adminData.email,
    displayName: adminData.displayName,
    role: isAdmin ? 'admin' : (adminData.role || 'viewer'),
    isActive: adminData.isActive,
    createdAt: adminData.createdAt?.toDate() || new Date(),
    lastLoginAt: adminData.lastLoginAt?.toDate(),
  };
}

/**
 * Check if current user is authenticated (not anonymous)
 */
export function isAuthenticated(): boolean {
  const auth = getAuthInstance();
  return auth.currentUser !== null && !auth.currentUser.isAnonymous;
}

/**
 * Check if current user is anonymous
 */
export function isAnonymous(): boolean {
  const auth = getAuthInstance();
  return auth.currentUser?.isAnonymous ?? false;
}

/**
 * Check if user has admin Custom Claim (fast, no DB read)
 */
export async function isAdmin(): Promise<boolean> {
  const auth = getAuthInstance();
  const user = auth.currentUser;
  
  if (!user || user.isAnonymous) {
    return false;
  }
  
  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch {
    return false;
  }
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
