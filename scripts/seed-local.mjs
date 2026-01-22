/**
 * Seed script for Firebase Emulator
 *
 * Uses firebase-admin to bypass security rules for initial seeding.
 * Sets Custom Claims for admin users.
 *
 * Usage: pnpm seed:local
 *
 * Prerequisites:
 * - Firebase emulators must be running (pnpm firebase:emulators)
 * - Node.js 22+
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// 1. Set environment variables to force Admin SDK to use Emulators (see package.json -> "seed:local")

// 2. Initialize Admin App (Privileged Access)
const app = initializeApp({
  projectId: "tiger-catalog",
});

const db = getFirestore();
const auth = getAuth();

// --- Data Definitions ---
const categories = [
  {
    id: "cat-1",
    name: "Fiambres",
    slug: "fiambres",
    iconName: "meat",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cat-2",
    name: "Quesos",
    slug: "quesos",
    iconName: "cheese",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "cat-3",
    name: "Lácteos",
    slug: "lacteos",
    iconName: "milk",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "cat-4",
    name: "Almacén",
    slug: "almacen",
    iconName: "store",
    isActive: true,
    sortOrder: 4,
  },
];

const brands = [
  { id: "brand-1", name: "Paladini", isActive: true, sortOrder: 1 },
  { id: "brand-2", name: "Cagnoli", isActive: true, sortOrder: 2 },
  { id: "brand-3", name: "Santa Rosa", isActive: true, sortOrder: 3 },
  { id: "brand-4", name: "Verónica", isActive: true, sortOrder: 4 },
  { id: "brand-5", name: "La Serenísima", isActive: true, sortOrder: 5 },
  { id: "brand-6", name: "Sancor", isActive: true, sortOrder: 6 },
  { id: "brand-7", name: "La Campagnola", isActive: true, sortOrder: 7 },
];

const products = [
  // Fiambres - Paladini
  {
    id: "prod-1",
    name: "Jamón Cocido Natural",
    brandId: "brand-1",
    categoryId: "cat-1",
    prices: [
      {
        type: "weight",
        pricePerKg: 7500,
        availableWeights: [100, 250, 500, 1000],
      },
    ],
    isAvailable: true,
    tags: ["premium"],
  },
  {
    id: "prod-2",
    name: "Salame Milán",
    brandId: "brand-1",
    categoryId: "cat-1",
    prices: [
      { type: "weight", pricePerKg: 12000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
  },
  {
    id: "prod-3",
    name: "Mortadela con Aceitunas",
    brandId: "brand-1",
    categoryId: "cat-1",
    prices: [
      { type: "weight", pricePerKg: 6500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
  },
  {
    id: "prod-4",
    name: "Panceta Ahumada",
    brandId: "brand-1",
    categoryId: "cat-1",
    prices: [
      { type: "weight", pricePerKg: 9800, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    tags: ["premium"],
  },
  // Fiambres - Cagnoli
  {
    id: "prod-5",
    name: "Jamón Crudo",
    brandId: "brand-2",
    categoryId: "cat-1",
    prices: [
      { type: "weight", pricePerKg: 18000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    tags: ["premium", "importado"],
  },
  {
    id: "prod-6",
    name: "Bondiola",
    brandId: "brand-2",
    categoryId: "cat-1",
    prices: [
      { type: "weight", pricePerKg: 11000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
  },
  // Quesos - Santa Rosa
  {
    id: "prod-7",
    name: "Queso Sardo",
    brandId: "brand-3",
    categoryId: "cat-2",
    prices: [
      {
        type: "fraction",
        prices: { whole: 25000, half: 13000, quarter: 7000 },
        fractionLabel: "horma",
      },
    ],
    isAvailable: true,
    tags: ["premium"],
  },
  {
    id: "prod-8",
    name: "Queso Cremoso",
    brandId: "brand-3",
    categoryId: "cat-2",
    prices: [
      { type: "weight", pricePerKg: 7500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
  },
  {
    id: "prod-9",
    name: "Provolone",
    brandId: "brand-3",
    categoryId: "cat-2",
    prices: [
      { type: "weight", pricePerKg: 9200, availableWeights: [250, 500] },
    ],
    isAvailable: true,
  },
  // Quesos - Verónica
  {
    id: "prod-10",
    name: "Queso Rallado",
    brandId: "brand-4",
    categoryId: "cat-2",
    prices: [{ type: "unit", price: 2800, unitLabel: "paquete 250g" }],
    isAvailable: true,
  },
  {
    id: "prod-11",
    name: "Queso Port Salut",
    brandId: "brand-4",
    categoryId: "cat-2",
    prices: [
      {
        type: "fraction",
        prices: { whole: 18000, half: 9500, quarter: 5000 },
        fractionLabel: "horma",
      },
    ],
    isAvailable: true,
    tags: ["nuevo"],
  },
  // Lácteos - La Serenísima
  {
    id: "prod-12",
    name: "Leche Entera",
    brandId: "brand-5",
    categoryId: "cat-3",
    prices: [{ type: "unit", price: 1200, unitLabel: "litro" }],
    isAvailable: true,
  },
  {
    id: "prod-13",
    name: "Manteca",
    brandId: "brand-5",
    categoryId: "cat-3",
    prices: [{ type: "unit", price: 2500, unitLabel: "pan 200g" }],
    isAvailable: true,
  },
  {
    id: "prod-14",
    name: "Crema de Leche",
    brandId: "brand-5",
    categoryId: "cat-3",
    prices: [{ type: "unit", price: 1800, unitLabel: "200ml" }],
    isAvailable: true,
  },
  // Lácteos - Sancor
  {
    id: "prod-15",
    name: "Yogur Firme Vainilla",
    brandId: "brand-6",
    categoryId: "cat-3",
    prices: [{ type: "unit", price: 950, unitLabel: "pote 190g" }],
    isAvailable: true,
  },
  {
    id: "prod-16",
    name: "Dulce de Leche",
    brandId: "brand-6",
    categoryId: "cat-3",
    prices: [{ type: "unit", price: 3200, unitLabel: "pote 400g" }],
    isAvailable: true,
    tags: ["premium"],
  },
  // Almacén - La Campagnola
  {
    id: "prod-17",
    name: "Aceitunas Verdes",
    brandId: "brand-7",
    categoryId: "cat-4",
    prices: [{ type: "unit", price: 2100, unitLabel: "frasco 220g" }],
    isAvailable: true,
  },
  {
    id: "prod-18",
    name: "Aceitunas Negras",
    brandId: "brand-7",
    categoryId: "cat-4",
    prices: [{ type: "unit", price: 2400, unitLabel: "frasco 220g" }],
    isAvailable: false,
  },
  {
    id: "prod-19",
    name: "Tomates Peritas",
    brandId: "brand-7",
    categoryId: "cat-4",
    prices: [{ type: "unit", price: 1100, unitLabel: "lata 400g" }],
    isAvailable: true,
  },
  {
    id: "prod-20",
    name: "Arvejas",
    brandId: "brand-7",
    categoryId: "cat-4",
    prices: [{ type: "unit", price: 980, unitLabel: "lata 350g" }],
    isAvailable: true,
    tags: ["oferta"],
  },
];

const adminUsers = [
  {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    displayName: "Administrador",
    role: "admin",
  },
  {
    email: process.env.EDITOR_EMAIL,
    password: process.env.EDITOR_PASSWORD,
    displayName: "Editor",
    role: "editor",
  },
];

const isLocalDev = process.env.VITE_USE_FIREBASE_EMULATORS === "true";
const environment = process.env.VITE_ENVIRONMENT || "development";

// Get collection path based on environment
function getCollectionPath(collectionName) {
  if (isLocalDev) {
    return collectionName;
  }

  return `environments/development/${collectionName}`;
}

async function seed() {
  console.log("🌱 Starting seed (Admin SDK)...\n");

  try {
    const now = Timestamp.now();

    // First, create admin users in Auth and Firestore
    console.log("👤 Seeding admin users...");
    for (const adminData of adminUsers) {
      let uid;
      try {
        // Create auth user (Admin SDK method)
        const userRecord = await auth.createUser({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.displayName,
        });
        uid = userRecord.uid;

        // 🔥 CRITICAL: Set the Custom Claim for admin role
        // This is what the security rules check for!
        if (adminData.role === "admin") {
          await auth.setCustomUserClaims(uid, { role: "admin" });
          console.log(
            `   ✓ ${adminData.email} (${adminData.role}) - UID: ${uid} (Admin Claim Set)`,
          );
        } else if (adminData.role === "editor") {
          await auth.setCustomUserClaims(uid, { role: "editor" });
          console.log(
            `   ✓ ${adminData.email} (${adminData.role}) - UID: ${uid} (Editor Claim Set)`,
          );
        } else {
          console.log(
            `   ✓ ${adminData.email} (${adminData.role}) - UID: ${uid}`,
          );
        }
      } catch (error) {
        if (error.code === "auth/email-already-exists") {
          // If user exists, fetch their UID and refresh claim
          const userRecord = await auth.getUserByEmail(adminData.email);
          uid = userRecord.uid;

          // Re-apply claim just in case
          if (adminData.role === "admin") {
            await auth.setCustomUserClaims(uid, { role: "admin" });
            console.log(
              `   ⚠ ${adminData.email} exists. Admin claim refreshed.`,
            );
          } else if (adminData.role === "editor") {
            await auth.setCustomUserClaims(uid, { role: "editor" });
            console.log(
              `   ⚠ ${adminData.email} exists. Editor claim refreshed.`,
            );
          }
        } else {
          throw error;
        }
      }

      // Create admin user document (Bypasses Rules)
      await db.doc(`${getCollectionPath("adminUsers")}/${uid}`).set({
        email: adminData.email,
        displayName: adminData.displayName,
        role: adminData.role,
        isActive: true,
        createdAt: now,
      });
    }
    console.log("");

    // Seed categories
    console.log("📁 Seeding categories...");
    for (const category of categories) {
      await db.doc(`${getCollectionPath("categories")}/${category.id}`).set({
        ...category,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`   ✓ ${categories.length} categories created\n`);

    // Seed brands
    console.log("🏷️  Seeding brands...");
    for (const brand of brands) {
      await db.doc(`${getCollectionPath("brands")}/${brand.id}`).set({
        ...brand,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`   ✓ ${brands.length} brands created\n`);

    // Seed products
    console.log("📦 Seeding products...");
    for (const product of products) {
      await db.doc(`${getCollectionPath("products")}/${product.id}`).set({
        ...product,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`   ✓ ${products.length} products created\n`);

    console.log("✅ Seed completed successfully!\n");
    console.log("📝 Admin credentials:");
    console.log("   Email: admin@lacasera.com");
    console.log("   Password: admin123\n");
    console.log("   Email: editor@lacasera.com");
    console.log("   Password: editor123\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
