/**
 * Firebase initialization and service exports
 * Handles app initialization, emulator connections, and exports services
 *
 * SECURITY: Uses Anonymous Auth for public catalog access (bot protection)
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  onAuthStateChanged,
  Auth,
  User,
} from "firebase/auth";
import {
  firebaseConfig,
  useEmulators,
  emulatorConfig,
} from "./firebase.config";

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let emulatorsConnected = false;
let authInitialized = false;

/**
 * Initialize Firebase app and services
 * Safe to call multiple times - will return existing instances
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
} {
  // Check if already initialized
  if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  }

  // Initialize app
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Connect to emulators if enabled (only once)
  if (useEmulators && !emulatorsConnected) {
    try {
      connectFirestoreEmulator(
        db,
        emulatorConfig.firestore.host,
        emulatorConfig.firestore.port,
      );
      connectAuthEmulator(
        auth,
        `http://${emulatorConfig.auth.host}:${emulatorConfig.auth.port}`,
      );
      emulatorsConnected = true;
      console.log("🔧 Connected to Firebase Emulators");
    } catch (error) {
      // Emulators might already be connected
      console.warn("Emulator connection warning:", error);
    }
  }

  return { app, db, auth };
}

/**
 * Ensure user is authenticated (at least anonymously)
 * Required for Firestore reads due to security rules
 *
 * This is invisible to the user - they don't need to log in
 * to view the public catalog, but we still have a valid session
 * for bot protection.
 */
export async function ensureAuthenticated(): Promise<User> {
  const auth = getAuthInstance();

  // If already signed in, return current user
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // Wait for auth state to be determined
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (user) {
        resolve(user);
      } else {
        // No user - sign in anonymously
        try {
          const credential = await signInAnonymously(auth);
          console.log("🔐 Signed in anonymously for catalog access");
          resolve(credential.user);
        } catch (error) {
          console.error("Anonymous auth failed:", error);
          reject(error);
        }
      }
    });
  });
}

/**
 * Initialize auth and ensure we have a valid session
 * Call this when the app starts
 */
export async function initializeAuth(): Promise<void> {
  if (authInitialized) return;

  try {
    await ensureAuthenticated();
    authInitialized = true;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
export function getDb(): Firestore {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

/**
 * Get Auth instance
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

/**
 * Check if user has admin custom claim
 */
export async function hasAdminClaim(): Promise<boolean> {
  const auth = getAuthInstance();
  const user = auth.currentUser;

  if (!user) return false;

  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch {
    return false;
  }
}

/**
 * Force refresh the auth token (useful after login to get updated claims)
 */
export async function refreshAuthToken(): Promise<void> {
  const auth = getAuthInstance();
  const user = auth.currentUser;

  if (user) {
    await user.getIdToken(true);
  }
}

// Auto-initialize on import
initializeFirebase();

export { app, db, auth };
