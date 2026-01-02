import type { Category, Brand, Product, CategoryWithBrands, BrandWithProducts } from '@/types';

/**
 * Mock data for MVP demonstration
 * This will be replaced with Firestore data in production
 */

// Categories (Rubros)
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Fiambres',
    slug: 'fiambres',
    description: 'Jamones, salames, mortadelas y más',
    iconName: 'meat',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-2',
    name: 'Quesos',
    slug: 'quesos',
    description: 'Quesos nacionales e importados',
    iconName: 'cheese',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-3',
    name: 'Lácteos',
    slug: 'lacteos',
    description: 'Leche, yogur, manteca y cremas',
    iconName: 'milk',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cat-4',
    name: 'Almacén',
    slug: 'almacen',
    description: 'Productos de almacén general',
    iconName: 'store',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Brands (Marcas)
export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'Paladini',
    description: 'Fiambres de calidad premium',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'brand-2',
    name: 'Cagnoli',
    description: 'Tradición en fiambres',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'brand-3',
    name: 'La Serenísima',
    description: 'Lácteos de primera calidad',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'brand-4',
    name: 'Sancor',
    description: 'Productos lácteos cooperativos',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'brand-5',
    name: 'Santa Rosa',
    description: 'Quesos artesanales',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'brand-6',
    name: 'Verónica',
    description: 'Quesos y lácteos',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Products
export const mockProducts: Product[] = [
  // Fiambres - Paladini
  {
    id: 'prod-1',
    name: 'Jamón Cocido Natural',
    brandId: 'brand-1',
    categoryId: 'cat-1',
    description: 'Jamón cocido de primera calidad',
    prices: [
      { type: 'weight', pricePerKg: 8500, availableWeights: [100, 250, 500, 1000] },
    ],
    isAvailable: true,
    tags: ['premium', 'sin-tacc'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    name: 'Salame Milán',
    brandId: 'brand-1',
    categoryId: 'cat-1',
    description: 'Salame tipo milán tradicional',
    prices: [
      { type: 'weight', pricePerKg: 12000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-3',
    name: 'Mortadela con Aceitunas',
    brandId: 'brand-1',
    categoryId: 'cat-1',
    prices: [
      { type: 'weight', pricePerKg: 6500, availableWeights: [100, 250, 500, 1000] },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Fiambres - Cagnoli
  {
    id: 'prod-4',
    name: 'Jamón Crudo',
    brandId: 'brand-2',
    categoryId: 'cat-1',
    description: 'Jamón crudo estacionado',
    prices: [
      { type: 'weight', pricePerKg: 18000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    tags: ['premium'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-5',
    name: 'Bondiola',
    brandId: 'brand-2',
    categoryId: 'cat-1',
    prices: [
      { type: 'weight', pricePerKg: 15000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Quesos - Santa Rosa
  {
    id: 'prod-6',
    name: 'Queso Sardo',
    brandId: 'brand-5',
    categoryId: 'cat-2',
    description: 'Queso sardo estacionado 6 meses',
    prices: [
      { 
        type: 'fraction', 
        prices: { whole: 25000, half: 13000, quarter: 7000 },
        fractionLabel: 'horma'
      },
      { type: 'weight', pricePerKg: 9500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
    tags: ['artesanal'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-7',
    name: 'Queso Cremoso',
    brandId: 'brand-5',
    categoryId: 'cat-2',
    prices: [
      { 
        type: 'fraction', 
        prices: { whole: 18000, half: 9500, quarter: 5000 },
        fractionLabel: 'horma'
      },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Quesos - Verónica
  {
    id: 'prod-8',
    name: 'Queso Rallado',
    brandId: 'brand-6',
    categoryId: 'cat-2',
    prices: [
      { type: 'unit', price: 2800, unitLabel: 'paquete 250g' },
      { type: 'unit', price: 5200, unitLabel: 'paquete 500g' },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-9',
    name: 'Queso Port Salut',
    brandId: 'brand-6',
    categoryId: 'cat-2',
    prices: [
      { type: 'weight', pricePerKg: 8200, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Lácteos - La Serenísima
  {
    id: 'prod-10',
    name: 'Leche Entera',
    brandId: 'brand-3',
    categoryId: 'cat-3',
    prices: [
      { type: 'unit', price: 1200, unitLabel: 'litro' },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-11',
    name: 'Manteca',
    brandId: 'brand-3',
    categoryId: 'cat-3',
    prices: [
      { type: 'unit', price: 2500, unitLabel: 'pan 200g' },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-12',
    name: 'Crema de Leche',
    brandId: 'brand-3',
    categoryId: 'cat-3',
    prices: [
      { type: 'unit', price: 3200, unitLabel: 'pote 200ml' },
      { type: 'unit', price: 5800, unitLabel: 'pote 500ml' },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Lácteos - Sancor
  {
    id: 'prod-13',
    name: 'Yogur Natural',
    brandId: 'brand-4',
    categoryId: 'cat-3',
    prices: [
      { type: 'unit', price: 1800, unitLabel: 'pote 190g' },
      { type: 'unit', price: 4500, unitLabel: 'pote 500g' },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-14',
    name: 'Dulce de Leche',
    brandId: 'brand-4',
    categoryId: 'cat-3',
    prices: [
      { type: 'unit', price: 3800, unitLabel: 'pote 400g' },
      { type: 'unit', price: 6500, unitLabel: 'pote 1kg' },
    ],
    isAvailable: true,
    tags: ['clásico'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Almacén
  {
    id: 'prod-15',
    name: 'Aceitunas Verdes',
    brandId: 'brand-1',
    categoryId: 'cat-4',
    prices: [
      { type: 'weight', pricePerKg: 4500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-16',
    name: 'Aceitunas Negras',
    brandId: 'brand-1',
    categoryId: 'cat-4',
    prices: [
      { type: 'weight', pricePerKg: 5200, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: false, // Example of unavailable product
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper function to get hierarchical data structure
export function getCatalogData(): CategoryWithBrands[] {
  return mockCategories
    .filter(cat => cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => {
      const categoryProducts = mockProducts.filter(p => p.categoryId === category.id);
      const brandIds = [...new Set(categoryProducts.map(p => p.brandId))];
      
      const brands: BrandWithProducts[] = brandIds
        .map(brandId => {
          const brand = mockBrands.find(b => b.id === brandId);
          if (!brand || !brand.isActive) return null;
          
          const products = categoryProducts.filter(p => p.brandId === brandId);
          return {
            ...brand,
            products,
          };
        })
        .filter((b): b is BrandWithProducts => b !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        ...category,
        brands,
      };
    });
}

// Helper function to search products
export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return mockProducts.filter(product => {
    const brand = mockBrands.find(b => b.id === product.brandId);
    const category = mockCategories.find(c => c.id === product.categoryId);
    
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      brand?.name.toLowerCase().includes(normalizedQuery) ||
      category?.name.toLowerCase().includes(normalizedQuery) ||
      product.description?.toLowerCase().includes(normalizedQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  });
}

// Get brand by ID
export function getBrandById(id: string): Brand | undefined {
  return mockBrands.find(b => b.id === id);
}

// Get category by ID
export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find(c => c.id === id);
}
