import { adminIcon } from "../components/icons";
import { login, getAuthState } from "../store/authStore";

export function renderLoginPage(): string {
  const { isLoading, error } = getAuthState();

  return `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-warm-100 to-warm-200 p-4">
      <div class="w-full max-w-md animate-slide-up">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
            ${adminIcon("store", "w-8 h-8 text-white")}
          </div>
          <h1 class="text-2xl font-bold text-warm-800 font-display">La Casera</h1>
          <p class="text-warm-500">Panel de Administración</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form id="login-form" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
              <input 
                type="email" 
                id="email" 
                required 
                autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border-2 border-warm-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all" 
                placeholder="admin@lacasera.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-warm-700 mb-1.5">Contraseña</label>
              <div class="relative">
                <input 
                  type="password" 
                  id="password" 
                  required 
                  autocomplete="current-password"
                  class="w-full px-4 py-3 rounded-xl border-2 border-warm-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all pr-12" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  id="toggle-password" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                >
                  ${adminIcon("eye")}
                </button>
              </div>
            </div>
            <div id="login-error" class="${error ? "" : "hidden"} text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              ${error || ""}
            </div>
            <button 
              type="submit" 
              ${isLoading ? "disabled" : ""}
              class="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              ${isLoading ? `${adminIcon("loader", "w-5 h-5")} Iniciando...` : "Iniciar Sesión"}
            </button>
          </form>
          <div class="mt-6 p-4 bg-warm-50 rounded-xl">
            <p class="text-xs text-warm-500 mb-2">Credenciales de prueba:</p>
            <p class="text-xs text-warm-600"><strong>Admin:</strong> admin@lacasera.com / admin123</p>
            <p class="text-xs text-warm-600"><strong>Editor:</strong> editor@lacasera.com / editor123</p>
          </div>
        </div>
        <p class="text-center mt-6 text-sm text-warm-500">
          <a href="#/" class="text-brand-600 hover:underline">← Volver al catálogo público</a>
        </p>
      </div>
    </div>
  `;
}

// Attach login form event listeners
export function attachLoginListeners(): void {
  const form = document.getElementById("login-form");
  const toggleBtn = document.getElementById("toggle-password");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    await login(email, password);
  });

  toggleBtn?.addEventListener("click", () => {
    const input = document.getElementById("password") as HTMLInputElement;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggleBtn.innerHTML = adminIcon(isPassword ? "eyeOff" : "eye");
  });
}
