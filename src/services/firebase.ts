/**
 * Firebase initialization and service exports
 * Handles app initialization, emulator connections, and exports services
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import {
  firebaseConfig,
  useEmulators,
  emulatorConfig,
} from "./firebase.config";

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let emulatorsConnected = false;

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

// Auto-initialize on import
initializeFirebase();

export { app, db, auth };
