/**
 * Export PDF Page
 * Generates a PDF catalog with La Casera logo
 */

import { adminIcon } from "../components/icons";
import { renderAdminHeader } from "../components/AdminLayout";
import { getAdminState } from "../store/adminDataStore";
import { formatCurrency } from "@/utils";
import type { Category, Brand, Product, Price } from "@/types";

// PDF Generation using jsPDF (loaded from CDN)
declare const jspdf: {
  jsPDF: new () => JsPDFInstance;
};

interface JsPDFInstance {
  internal: {
    pageSize: { getWidth(): number; getHeight(): number };
    getNumberOfPages(): number;
  };
  setFillColor(...args: number[]): void;
  setTextColor(...args: number[]): void;
  setFontSize(size: number): void;
  setFont(font: string, style: string): void;
  rect(x: number, y: number, w: number, h: number, style: string): void;
  roundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number,
    ry: number,
    style: string,
  ): void;
  text(
    text: string,
    x: number,
    y: number,
    options?: { align?: string; maxWidth?: number },
  ): void;
  addPage(): void;
  setPage(page: number): void;
  save(filename: string): void;
  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void;
}

interface CatalogData {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  generatedAt: Date;
  storeName: string;
}

interface ExportStats {
  totalCategories: number;
  totalBrands: number;
  totalProducts: number;
  availableProducts: number;
  unavailableProducts: number;
}

// La Casera logo as base64 - will be loaded from file
let logoBase64: string | null = null;

async function loadLogo(): Promise<string | null> {
  if (logoBase64) return logoBase64;

  try {
    const response = await fetch("/lacasera-logo.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64 = reader.result as string;
        resolve(logoBase64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getExportStats(): ExportStats {
  const { categories, brands, products } = getAdminState();
  const availableProducts = products.filter((p) => p.isAvailable).length;

  return {
    totalCategories: categories.filter((c) => c.isActive).length,
    totalBrands: brands.filter((b) => b.isActive).length,
    totalProducts: products.length,
    availableProducts,
    unavailableProducts: products.length - availableProducts,
  };
}

function formatPriceForPDF(price: Price): string {
  if (price.type === "unit") {
    return `${formatCurrency(price.price)} / ${price.unitLabel}`;
  } else if (price.type === "weight") {
    return `${formatCurrency(price.pricePerKg)} / kg`;
  } else if (price.type === "fraction") {
    const parts: string[] = [];
    parts.push(`Entera: ${formatCurrency(price.prices.whole)}`);
    if (price.prices.half)
      parts.push(`1/2: ${formatCurrency(price.prices.half)}`);
    if (price.prices.quarter)
      parts.push(`1/4: ${formatCurrency(price.prices.quarter)}`);
    return parts.join(" | ");
  }
  return "-";
}

function loadJsPDF(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof jspdf !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
}

async function generatePDF(options: {
  includeUnavailable: boolean;
  groupBy: "category" | "brand";
}): Promise<void> {
  // Load jsPDF and logo
  await loadJsPDF();
  const logo = await loadLogo();

  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  const { categories, brands, products } = getAdminState();

  const data: CatalogData = {
    categories: categories.filter((c) => c.isActive),
    brands: brands.filter((b) => b.isActive),
    products: options.includeUnavailable
      ? products
      : products.filter((p) => p.isAvailable),
    generatedAt: new Date(),
    storeName: "La Casera",
  };

  // Colors - La Casera Logo palette (Blue primary, Red secondary, Orange accent)
  const colors = {
    primary: [30, 75, 156] as [number, number, number], // #1E4B9C - Blue
    secondary: [227, 30, 38] as [number, number, number], // #E31E26 - Red
    accent: [232, 119, 34] as [number, number, number], // #E87722 - Orange
    dark: [26, 26, 26] as [number, number, number], // #1A1A1A - Black (text)
    medium: [82, 82, 82] as [number, number, number], // #525252 - Gray
    light: [212, 212, 212] as [number, number, number], // #D4D4D4 - Light gray
    bg: [248, 248, 248] as [number, number, number], // #F8F8F8 - Background
  };

  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  function checkNewPage(requiredSpace: number): void {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      addHeader();
    }
  }

  function addHeader(): void {
    // Blue header bar
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 14, "F");

    // Red accent line
    doc.setFillColor(...colors.secondary);
    doc.rect(0, 14, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(data.storeName + " - Catálogo de Precios", margin, 9);
    doc.text(
      `Actualizado: ${data.generatedAt.toLocaleDateString("es-AR")}`,
      pageWidth - margin,
      9,
      { align: "right" },
    );
    yPos = 24;
  }

  function addFooter(): void {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
      doc.text(
        "Precios sujetos a cambios sin previo aviso",
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" },
      );
    }
  }

  // ===== TITLE PAGE =====

  // Blue header band
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 20, "F");

  // Red accent band
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 20, pageWidth, 4, "F");

  // Add logo if available
  if (logo) {
    // Center logo on page
    const logoWidth = 80;
    const logoHeight = 80;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logo, "PNG", logoX, 35, logoWidth, logoHeight);
    yPos = 105;
  } else {
    // Fallback to text if logo not available
    doc.setTextColor(...colors.primary);
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.text(data.storeName, pageWidth / 2, 55, { align: "center" });

    doc.setTextColor(...colors.accent);
    doc.setFontSize(14);
    doc.text("Fiambres • Quesos • Dulces", pageWidth / 2, 65, {
      align: "center",
    });
    yPos = 80;
  }

  // "Catálogo de Precios" title
  doc.setTextColor(...colors.dark);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Catálogo de Precios", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Summary box
  doc.setFillColor(...colors.bg);
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, "F");
  doc.setDrawColor(...colors.primary);
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, "S");

  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen del Catálogo", margin + 10, yPos + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.dark);
  doc.text(`• ${data.categories.length} categorías`, margin + 10, yPos + 24);
  doc.text(`• ${data.brands.length} marcas`, margin + 70, yPos + 24);
  doc.text(`• ${data.products.length} productos`, margin + 125, yPos + 24);

  doc.setFontSize(10);
  doc.setTextColor(...colors.medium);
  doc.text(
    `Generado: ${data.generatedAt.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    margin + 10,
    yPos + 35,
  );

  // Start catalog content on new page
  doc.addPage();
  addHeader();

  if (options.groupBy === "category") {
    // Group by category
    for (const category of data.categories) {
      const categoryProducts = data.products.filter(
        (p) => p.categoryId === category.id,
      );
      if (categoryProducts.length === 0) continue;

      checkNewPage(25);

      // Category header - BLUE
      doc.setFillColor(...colors.primary);
      doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(category.name.toUpperCase(), margin + 5, yPos + 8);
      doc.setFontSize(10);
      doc.text(
        `${categoryProducts.length} productos`,
        pageWidth - margin - 5,
        yPos + 8,
        { align: "right" },
      );
      yPos += 18;

      // Group products by brand within category
      const brandIds = [...new Set(categoryProducts.map((p) => p.brandId))];

      for (const brandId of brandIds) {
        const brand = data.brands.find((b) => b.id === brandId);
        const brandProducts = categoryProducts.filter(
          (p) => p.brandId === brandId,
        );

        if (!brand || brandProducts.length === 0) continue;

        checkNewPage(20);

        // Brand subheader - RED
        doc.setFillColor(...colors.accent);
        doc.rect(margin, yPos, contentWidth, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(brand.name, margin + 3, yPos + 6.5);
        yPos += 14;

        // Products table
        for (const product of brandProducts) {
          checkNewPage(14);

          const rowIndex = brandProducts.indexOf(product);
          if (rowIndex % 2 === 0) {
            doc.setFillColor(255, 255, 255);
          } else {
            doc.setFillColor(...colors.bg);
          }
          doc.rect(margin, yPos - 1, contentWidth, 12, "F");

          // Product name - BLACK and BOLD
          doc.setTextColor(...colors.dark);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");

          let productName = product.name;
          if (!product.isAvailable) {
            productName += " (Sin stock)";
            doc.setTextColor(...colors.medium);
          }
          doc.text(productName, margin + 3, yPos + 6, { maxWidth: 85 });

          // Price - BLACK and BOLD
          doc.setTextColor(...colors.dark);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          const priceText = product.prices[0]
            ? formatPriceForPDF(product.prices[0])
            : "-";
          doc.text(priceText, pageWidth - margin - 3, yPos + 6, {
            align: "right",
          });

          yPos += 12;
        }

        yPos += 5;
      }

      yPos += 10;
    }
  } else {
    // Group by brand
    for (const brand of data.brands) {
      const brandProducts = data.products.filter((p) => p.brandId === brand.id);
      if (brandProducts.length === 0) continue;

      checkNewPage(25);

      // Brand header - BLUE
      doc.setFillColor(...colors.primary);
      doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(brand.name.toUpperCase(), margin + 5, yPos + 8);
      doc.setFontSize(10);
      doc.text(
        `${brandProducts.length} productos`,
        pageWidth - margin - 5,
        yPos + 8,
        { align: "right" },
      );
      yPos += 18;

      // Products table
      for (const product of brandProducts) {
        checkNewPage(14);

        const category = data.categories.find(
          (c) => c.id === product.categoryId,
        );
        const rowIndex = brandProducts.indexOf(product);

        if (rowIndex % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(...colors.bg);
        }
        doc.rect(margin, yPos - 1, contentWidth, 12, "F");

        // Product name - BLACK and BOLD
        doc.setTextColor(...colors.dark);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");

        let productName = product.name;
        if (!product.isAvailable) {
          productName += " (Sin stock)";
          doc.setTextColor(...colors.medium);
        }
        doc.text(productName, margin + 3, yPos + 6, { maxWidth: 70 });

        // Category badge - RED
        doc.setTextColor(...colors.primary);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(category?.name || "", margin + 78, yPos + 6);

        // Price - BLACK and BOLD
        doc.setTextColor(...colors.dark);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const priceText = product.prices[0]
          ? formatPriceForPDF(product.prices[0])
          : "-";
        doc.text(priceText, pageWidth - margin - 3, yPos + 6, {
          align: "right",
        });

        yPos += 12;
      }

      yPos += 10;
    }
  }

  // Add footers
  addFooter();

  // Save PDF
  const fileName = `catalogo-la-casera-${
    data.generatedAt.toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
}

// Render the Export PDF page
export function renderExportPage(
  _showToast: (message: string, type?: "success" | "error") => void,
): string {
  const stats = getExportStats();

  return `
    ${renderAdminHeader("Exportar PDF")}
    <main class="p-4 lg:p-6">
      <div class="bg-white rounded-xl border border-warm-200 max-w-2xl">
        <div class="px-6 py-4 border-b border-warm-100">
          <h3 class="font-display text-lg font-semibold text-warm-800">Exportar Catálogo a PDF</h3>
          <p class="text-sm text-warm-500 mt-1">Genera un PDF profesional del catálogo para imprimir o compartir</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Preview stats -->
          <div class="bg-warm-50 rounded-lg p-4">
            <h4 class="font-medium text-warm-700 mb-3">El PDF incluirá:</h4>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-brand-600">${stats.totalCategories}</p>
                <p class="text-xs text-warm-500">Categorías</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-brand-600">${stats.totalBrands}</p>
                <p class="text-xs text-warm-500">Marcas</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-brand-600">${stats.totalProducts}</p>
                <p class="text-xs text-warm-500">Productos</p>
              </div>
            </div>
          </div>

          <!-- Options -->
          <div class="space-y-4">
            <h4 class="font-medium text-warm-700">Opciones de exportación</h4>
            
            <div class="space-y-3">
              <label class="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="includeUnavailable" 
                  class="w-5 h-5 rounded border-warm-300 text-brand-600 focus:ring-brand-400"
                />
                <div>
                  <span class="text-sm font-medium text-warm-700">Incluir productos sin stock</span>
                  <p class="text-xs text-warm-500">${stats.unavailableProducts} productos marcados como sin stock</p>
                </div>
              </label>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-warm-700">Agrupar por:</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="groupBy" 
                    value="category" 
                    checked
                    class="text-brand-600 focus:ring-brand-400"
                  />
                  <span class="text-sm text-warm-700">Categoría</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="groupBy" 
                    value="brand"
                    class="text-brand-600 focus:ring-brand-400"
                  />
                  <span class="text-sm text-warm-700">Marca</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Generate button -->
          <div class="pt-4 border-t border-warm-100">
            <button
              id="generate-pdf-btn"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              ${adminIcon("download", "w-5 h-5")}
              <span id="btn-text">Generar y Descargar PDF</span>
              <span id="btn-loader" class="hidden">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Info card -->
      <div class="mt-4 bg-brand-50 border border-brand-200 rounded-xl p-4 max-w-2xl">
        <div class="flex gap-3">
          ${adminIcon("alertCircle", "w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5")}
          <div>
            <p class="font-medium text-brand-800">Sobre el PDF generado</p>
            <ul class="text-sm text-brand-700 mt-1 space-y-1">
              <li>• Incluye el logo de La Casera en la portada</li>
              <li>• Formato A4 optimizado para impresión</li>
              <li>• Fecha de generación en cada página</li>
              <li>• Precios formateados en pesos argentinos</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  `;
}

// Attach event listeners for the Export PDF page
export function attachExportListeners(
  showToast: (message: string, type?: "success" | "error") => void,
): void {
  const generateBtn = document.getElementById(
    "generate-pdf-btn",
  ) as HTMLButtonElement;
  const btnText = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const includeUnavailableCheckbox = document.getElementById(
    "includeUnavailable",
  ) as HTMLInputElement;
  const groupByRadios = document.querySelectorAll(
    'input[name="groupBy"]',
  ) as NodeListOf<HTMLInputElement>;

  generateBtn?.addEventListener("click", async () => {
    if (!generateBtn || !btnText || !btnLoader) return;

    // Show loading state
    generateBtn.disabled = true;
    btnText.textContent = "Generando...";
    btnLoader.classList.remove("hidden");

    try {
      const options = {
        includeUnavailable: includeUnavailableCheckbox?.checked || false,
        groupBy: (Array.from(groupByRadios).find((r) => r.checked)?.value ||
          "category") as "category" | "brand",
      };

      await generatePDF(options);

      // Success feedback
      btnText.textContent = "¡PDF Descargado!";
      showToast("PDF generado exitosamente");

      setTimeout(() => {
        btnText.textContent = "Generar y Descargar PDF";
      }, 2000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      btnText.textContent = "Error al generar";
      showToast("Error al generar PDF", "error");

      setTimeout(() => {
        btnText.textContent = "Generar y Descargar PDF";
      }, 2000);
    } finally {
      generateBtn.disabled = false;
      btnLoader.classList.add("hidden");
    }
  });
}
