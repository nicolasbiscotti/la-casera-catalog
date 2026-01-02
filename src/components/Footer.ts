import { createWhatsAppIcon } from './icons';

/**
 * Footer component
 * Store info and WhatsApp contact
 */

// Configure store WhatsApp number here
const STORE_WHATSAPP = '5491112345678'; // Replace with actual number
const STORE_NAME = 'Fiambrería';

export function createFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = `
    mt-auto border-t border-warm-200 bg-warm-50
    px-4 py-6 sm:px-6 sm:py-8
  `.trim().replace(/\s+/g, ' ');

  const whatsappLink = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent('Hola! Quisiera hacer una consulta sobre los productos.')}`;

  footer.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-center sm:text-left">
          <p class="font-display font-semibold text-warm-800">${STORE_NAME}</p>
          <p class="text-sm text-warm-500">
            Catálogo actualizado · Precios sujetos a cambios
          </p>
        </div>
        
        <a 
          href="${whatsappLink}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="btn-whatsapp"
        >
          ${createWhatsAppIcon({ size: 20 })}
          Contactanos
        </a>
      </div>
      
      <div class="mt-6 pt-4 border-t border-warm-200 text-center">
        <p class="text-xs text-warm-400">
          © ${new Date().getFullYear()} ${STORE_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  return footer;
}
