import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Environment detection
const isLocalDev =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
const environment = import.meta.env.VITE_ENVIRONMENT || "development";

// Get collection prefix based on environment
export function getCollectionPath(collection: string): string {
  if (isLocalDev) {
    return collection; // Emulators use root collections
  }

  if (environment === "production") {
    return collection; // Production uses root collections
  }

  // Staging and development use prefixed collections
  return `environments/${environment}/${collection}`;
}

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

function initializeFirebase(): void {
  if (app) return;

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Connect to emulators in local development

  console.log("is local dev ==> ", isLocalDev);

  if (isLocalDev) {
    try {
      connectFirestoreEmulator(db, "localhost", 8080);
      connectAuthEmulator(auth, "http://localhost:9099");
      console.log("🔧 Connected to Firebase emulators");
    } catch (error) {
      // Emulators might already be connected
      console.warn("Emulator connection warning:", error);
    }
  }

  console.log(`🔥 Firebase initialized (${environment})`);
}

// Lazy initialization
export function getFirebaseApp(): FirebaseApp {
  if (!app) initializeFirebase();
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) initializeFirebase();
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase();
  return auth;
}

export { environment, isLocalDev };
