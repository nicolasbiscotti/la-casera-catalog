/**
 * Firebase configuration
 * Replace with your actual Firebase project config
 */

// Environment-based configuration
const getEnvironmentId = (): string => {
  // This will be set based on Vercel environment
  const env = import.meta.env.VITE_ENVIRONMENT || 'development';
  return env;
};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Firestore collection paths based on environment
// This allows separate data for dev/staging/production
export const getCollectionPath = (collection: string): string => {
  const envId = getEnvironmentId();
  
  // In production, use root collections
  if (envId === 'production') {
    return collection;
  }
  
  // In other environments, namespace under /environments/{envId}/
  return `environments/${envId}/${collection}`;
};

// Collection names
export const COLLECTIONS = {
  categories: () => getCollectionPath('categories'),
  brands: () => getCollectionPath('brands'),
  products: () => getCollectionPath('products'),
  priceHistory: () => getCollectionPath('priceHistory'),
  adminUsers: () => getCollectionPath('adminUsers'),
  analytics: () => getCollectionPath('analytics'),
} as const;

// Check if using emulators
export const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

export const emulatorConfig = {
  firestore: {
    host: 'localhost',
    port: 8080,
  },
  auth: {
    host: 'localhost',
    port: 9099,
  },
};
