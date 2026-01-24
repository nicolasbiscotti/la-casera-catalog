import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/services/firebase";

// Admin State
interface AdminAuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

let state: AdminAuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

// Subscribers
type Subscriber = (state: AdminAuthState) => void;
const subscribers: Set<Subscriber> = new Set();

// Get current state
export function getAuthState(): AdminAuthState {
  return state;
}

// Subscribe to state changes
export function subscribeAuth(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// Notify subscribers
function notifySubscribers(): void {
  subscribers.forEach((callback) => callback(state));
}

// Update state
function setAuthState(updates: Partial<AdminAuthState>): void {
  state = { ...state, ...updates };
  notifySubscribers();
}

// Initialize auth listener
export function initAuthListener(): void {
  const auth = getFirebaseAuth();

  onAuthStateChanged(auth, (user) => {
    setAuthState({
      user,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  });
}

// Login
export async function login(email: string, password: string): Promise<boolean> {
  setAuthState({ isLoading: true, error: null });

  try {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
    setAuthState({ isLoading: false });
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error de autenticación";
    setAuthState({ isLoading: false, error: message });
    return false;
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return state.user !== null;
}

// Get current user
export function getCurrentUser(): User | null {
  return state.user;
}

// Get user display info
export function getUserInfo(): { name: string; email: string } {
  const user = state.user;
  return {
    name: user?.displayName || user?.email?.split("@")[0] || "Usuario",
    email: user?.email || "",
  };
}
