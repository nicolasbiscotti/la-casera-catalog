/**
 * Admin Authentication Store
 * Manages authentication state for the admin panel
 * Uses Firebase Auth with Custom Claims
 */

import { createStore } from "@/store/catalogStore";
import {
  login as firebaseLogin,
  logout as firebaseLogout,
  getCurrentAdminUser,
  onAuthChange,
  isAdmin as checkIsAdmin,
} from "@/services/authService";
import { getAuthInstance } from "@/services/firebase";

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "editor" | "viewer";
}

export interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const authStore = createStore<AuthState>(initialState);

// Auth actions
export const authActions = {
  /**
   * Initialize auth state from Firebase
   */
  init: async (): Promise<void> => {
    authStore.setState({ isLoading: true });

    try {
      const auth = getAuthInstance();

      // Wait for auth state to be determined
      return new Promise((resolve) => {
        const unsubscribe = onAuthChange(async (user) => {
          unsubscribe();

          if (user && !user.isAnonymous) {
            // User is logged in (not anonymous)
            try {
              const adminUser = await getCurrentAdminUser();
              if (adminUser) {
                authStore.setState({
                  user: {
                    uid: adminUser.uid,
                    email: adminUser.email,
                    displayName: adminUser.displayName || "Admin",
                    role: adminUser.role,
                  },
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
              } else {
                authStore.setState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: null,
                });
              }
            } catch {
              authStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } else {
            // No user or anonymous user
            authStore.setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
          resolve();
        });
      });
    } catch {
      authStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<boolean> => {
    authStore.setState({ isLoading: true, error: null });

    try {
      const adminUser = await firebaseLogin(email, password);

      authStore.setState({
        user: {
          uid: adminUser.uid,
          email: adminUser.email,
          displayName: adminUser.displayName || "Admin",
          role: adminUser.role,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Credenciales inválidas. Intenta de nuevo.";

      authStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      return false;
    }
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    authStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clear error message
   */
  clearError: (): void => {
    authStore.setState({ error: null });
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: (requiredRole: "admin" | "editor" | "viewer"): boolean => {
    const { user } = authStore.getState();
    if (!user) return false;

    const roleHierarchy: Record<string, number> = {
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  },

  /**
   * Check if current user has admin Custom Claim (fast check)
   */
  checkAdminClaim: async (): Promise<boolean> => {
    return await checkIsAdmin();
  },
};

// Auth guard for protected routes
export const authGuard = (): boolean => {
  const { isAuthenticated, isLoading } = authStore.getState();

  // If still loading, wait
  if (isLoading) {
    return false;
  }

  return isAuthenticated;
};

// Initialize auth on module load
authActions.init();
