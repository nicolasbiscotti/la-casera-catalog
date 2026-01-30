// Logo is imported as a static asset - place lacasera-logo.png in /public folder
const LOGO_PATH = "/lacasera-logo.png";

export function renderHeader(): string {
  const today = new Date();

  return `
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <!-- Blue top bar -->
      <div class="bg-brand-600 text-white text-center py-1.5 px-4">
        <p class="text-sm font-medium">Fiambres • Quesos • Dulces</p>
      </div>
      
      <!-- Main header with logo -->
      <div class="border-b border-warm-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Logo centered on mobile, left on desktop -->
            <div class="flex justify-center sm:justify-start">
              <img 
                src="${LOGO_PATH}" 
                alt="La Casera - Fiambres, Quesos, Dulces" 
                class="h-16 sm:h-20 w-auto"
              />
            </div>
            
            <!-- Update date -->
            <div class="text-center sm:text-right">
              <p class="text-sm text-warm-500">Lista de precios actualizada</p>
              <p class="text-lg font-bold text-warm-900">${today.toLocaleDateString(
                "es-AR",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}
