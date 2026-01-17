/**
 * Admin Login Page
 * Authentication form for admin panel access
 */

import { createIcon } from '../components/icons';
import { authStore, authActions } from '../store/authStore';
import { router } from '@/router';

export function createLoginPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'min-h-screen bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center p-4';

  page.innerHTML = `
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mb-4">
          ${createIcon('store', { size: 32, className: 'text-white' })}
        </div>
        <h1 class="font-display text-2xl font-bold text-warm-900">La Casera</h1>
        <p class="text-warm-500">Panel de Administración</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-warm-200 p-6 lg:p-8">
        <h2 class="font-display text-xl font-semibold text-warm-800 mb-6">Iniciar Sesión</h2>

        <!-- Error message -->
        <div id="error-message" class="hidden mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm  items-center gap-2">
          ${createIcon('alertCircle', { size: 18 })}
          <span id="error-text"></span>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-warm-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autocomplete="email"
              class="w-full px-4 py-3 rounded-lg border border-warm-300 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              placeholder="admin@lacasera.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-warm-700 mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <input
                type="password"
                id="password"
                name="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 rounded-lg border border-warm-300 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                id="toggle-password"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              >
                ${createIcon('eye', { size: 20 })}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submit-btn"
            class="w-full py-3 px-4 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span id="btn-text">Ingresar</span>
            <span id="btn-loader" class="hidden">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>
        </form>

        <!-- Demo credentials -->
        <div class="mt-6 pt-6 border-t border-warm-100">
          <p class="text-xs text-warm-500 mb-2">Credenciales de demo:</p>
          <div class="space-y-1 text-xs text-warm-600 bg-warm-50 rounded-lg p-3">
            <p><strong>Admin:</strong> admin@lacasera.com / admin123</p>
            <p><strong>Editor:</strong> editor@lacasera.com / editor123</p>
          </div>
        </div>
      </div>

      <!-- Back to store link -->
      <div class="text-center mt-6">
        <a href="#/" class="text-sm text-warm-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-1">
          ${createIcon('arrowLeft', { size: 16 })}
          Volver a la tienda
        </a>
      </div>
    </div>
  `;

  // Setup handlers
  setTimeout(() => setupLoginHandlers(page), 0);

  return page;
}

function setupLoginHandlers(page: HTMLElement): void {
  const form = page.querySelector('#login-form') as HTMLFormElement;
  const emailInput = page.querySelector('#email') as HTMLInputElement;
  const passwordInput = page.querySelector('#password') as HTMLInputElement;
  const togglePasswordBtn = page.querySelector('#toggle-password') as HTMLButtonElement;
  const submitBtn = page.querySelector('#submit-btn') as HTMLButtonElement;
  const btnText = page.querySelector('#btn-text') as HTMLElement;
  const btnLoader = page.querySelector('#btn-loader') as HTMLElement;
  const errorMessage = page.querySelector('#error-message') as HTMLElement;
  const errorText = page.querySelector('#error-text') as HTMLElement;

  // Toggle password visibility
  let passwordVisible = false;
  togglePasswordBtn?.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    togglePasswordBtn.innerHTML = createIcon(passwordVisible ? 'eyeOff' : 'eye', { size: 20 });
  });

  // Subscribe to auth state
  authStore.subscribe(state => {
    if (state.error) {
      errorMessage.classList.remove('hidden');
      errorMessage.classList.add('flex');
      errorText.textContent = state.error;
    } else {
      errorMessage.classList.add('hidden');
      errorMessage.classList.remove('flex');
    }

    if (state.isLoading) {
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  });

  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      authStore.setState({ error: 'Por favor completa todos los campos' });
      return;
    }

    const success = await authActions.login(email, password);
    
    if (success) {
      router.navigate('/admin');
    }
  });

  // Clear error on input
  [emailInput, passwordInput].forEach(input => {
    input?.addEventListener('input', () => {
      authActions.clearError();
    });
  });
}
