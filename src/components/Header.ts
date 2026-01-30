// Logo is imported as a static asset - place lacasera-logo.png in /public folder
const LOGO_PATH = "/lacasera-logo.png";

export function renderHeader(): string {
  const today = new Date();

  return `
    <header class="sticky top-0 z-50 bg-white border-b-2 border-brand-600 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img 
              src="${LOGO_PATH}" 
              alt="La Casera - Fiambres, Quesos, Dulces" 
              class="h-12 sm:h-16 w-auto"
            />
          </div>
          <div class="text-right">
            <p class="text-sm text-warm-600 font-medium">Actualizado</p>
            <p class="text-base font-bold text-warm-900">${today.toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>
    </header>
  `;
}
