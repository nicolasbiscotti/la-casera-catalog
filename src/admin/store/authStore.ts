/**
 * Admin Authentication Store
 * Manages authentication state for the admin panel
 * In production, this connects to Firebase Auth
 */

import { createStore } from '@/store/catalogStore';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'viewer';
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

// Mock admin users for demo (in production, use Firebase Auth)
const MOCK_ADMIN_USERS: Record<string, { password: string; user: AdminUser }> = {
  'admin@lacasera.com': {
    password: 'admin123',
    user: {
      uid: 'admin-001',
      email: 'admin@lacasera.com',
      displayName: 'Administrador',
      role: 'admin',
    },
  },
  'editor@lacasera.com': {
    password: 'editor123',
    user: {
      uid: 'editor-001',
      email: 'editor@lacasera.com',
      displayName: 'Editor',
      role: 'editor',
    },
  },
};

// Session storage key
const SESSION_KEY = 'la_casera_admin_session';

// Auth actions
export const authActions = {
  /**
   * Initialize auth state from session storage
   */
  init: (): void => {
    authStore.setState({ isLoading: true });
    
    try {
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session) {
        const user = JSON.parse(session) as AdminUser;
        authStore.setState({
          user,
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
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<boolean> => {
    authStore.setState({ isLoading: true, error: null });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockUser = MOCK_ADMIN_USERS[email.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      authStore.setState({
        isLoading: false,
        error: 'Credenciales inválidas. Intenta de nuevo.',
      });
      return false;
    }

    // Store session
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockUser.user));

    authStore.setState({
      user: mockUser.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return true;
  },

  /**
   * Logout current user
   */
  logout: (): void => {
    sessionStorage.removeItem(SESSION_KEY);
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
  hasPermission: (requiredRole: 'admin' | 'editor' | 'viewer'): boolean => {
    const { user } = authStore.getState();
    if (!user) return false;

    const roleHierarchy: Record<string, number> = {
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
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
