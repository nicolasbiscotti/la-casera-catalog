import { icon } from "./icons";
import { formatDate } from "@/utils";

// WhatsApp number - configure this
const WHATSAPP_NUMBER = import.meta.env.VITE_STORE_WHATSAPP; // Replace with actual number
const WHATSAPP_MESSAGE =
  "Hola! Quiero consultar sobre los productos del catálogo de La Casera.";

export function renderFooter(): string {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const today = new Date();

  return `
    <footer class="bg-warm-900 text-warm-100 mt-auto">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                ${icon("store", "w-4 h-4 text-white")}
              </div>
              <span class="font-display font-bold text-lg">La Casera</span>
            </div>
            <p class="text-warm-400 text-sm">Fiambrería y Almacén</p>
            <p class="text-warm-500 text-xs mt-1">Precios sujetos a cambios sin previo aviso</p>
          </div>
          <div class="flex flex-col items-center sm:items-end gap-3">
            <a 
              href="${whatsappUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-lg"
            >
              ${icon("whatsapp", "w-5 h-5")}
              Consultar por WhatsApp
            </a>
            <p class="text-warm-500 text-xs">
              Actualizado: ${formatDate(today)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  `;
}
