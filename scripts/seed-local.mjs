/**
 * Seed script for Firebase Emulator
 *
 * Uses firebase-admin to bypass security rules for initial seeding.
 * Sets Custom Claims for admin users.
 * Uses Firestore-generated IDs and populates audit fields.
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
initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore();
const auth = getAuth();

// --- Data Definitions (without hardcoded IDs) ---
const categoriesData = [
  {
    name: "Fiambres",
    slug: "fiambres",
    iconName: "meat",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Quesos",
    slug: "quesos",
    iconName: "cheese",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Lácteos",
    slug: "lacteos",
    iconName: "milk",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Almacén",
    slug: "almacen",
    iconName: "store",
    isActive: true,
    sortOrder: 4,
  },
];

const brandsData = [
  { name: "Paladini", isActive: true, sortOrder: 1 },
  { name: "Cagnoli", isActive: true, sortOrder: 2 },
  { name: "Santa Rosa", isActive: true, sortOrder: 3 },
  { name: "Verónica", isActive: true, sortOrder: 4 },
  { name: "La Serenísima", isActive: true, sortOrder: 5 },
  { name: "Sancor", isActive: true, sortOrder: 6 },
  { name: "La Campagnola", isActive: true, sortOrder: 7 },
];

// Products will reference categories and brands by name initially
// We'll map them to IDs after creating categories and brands
const productsData = [
  // Fiambres - Paladini
  {
    name: "Jamón Cocido Natural",
    brandName: "Paladini",
    categoryName: "Fiambres",
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
    name: "Salame Milán",
    brandName: "Paladini",
    categoryName: "Fiambres",
    prices: [
      { type: "weight", pricePerKg: 12000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
  },
  {
    name: "Mortadela con Aceitunas",
    brandName: "Paladini",
    categoryName: "Fiambres",
    prices: [
      { type: "weight", pricePerKg: 6500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
  },
  {
    name: "Panceta Ahumada",
    brandName: "Paladini",
    categoryName: "Fiambres",
    prices: [
      { type: "weight", pricePerKg: 9800, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    tags: ["premium"],
  },
  // Fiambres - Cagnoli
  {
    name: "Jamón Crudo",
    brandName: "Cagnoli",
    categoryName: "Fiambres",
    prices: [
      { type: "weight", pricePerKg: 18000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
    tags: ["premium", "importado"],
  },
  {
    name: "Bondiola",
    brandName: "Cagnoli",
    categoryName: "Fiambres",
    prices: [
      { type: "weight", pricePerKg: 11000, availableWeights: [100, 250, 500] },
    ],
    isAvailable: true,
  },
  // Quesos - Santa Rosa
  {
    name: "Queso Sardo",
    brandName: "Santa Rosa",
    categoryName: "Quesos",
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
    name: "Queso Cremoso",
    brandName: "Santa Rosa",
    categoryName: "Quesos",
    prices: [
      { type: "weight", pricePerKg: 7500, availableWeights: [250, 500, 1000] },
    ],
    isAvailable: true,
  },
  {
    name: "Provolone",
    brandName: "Santa Rosa",
    categoryName: "Quesos",
    prices: [
      { type: "weight", pricePerKg: 9200, availableWeights: [250, 500] },
    ],
    isAvailable: true,
  },
  // Quesos - Verónica
  {
    name: "Queso Rallado",
    brandName: "Verónica",
    categoryName: "Quesos",
    prices: [{ type: "unit", price: 2800, unitLabel: "paquete 250g" }],
    isAvailable: true,
  },
  {
    name: "Queso Port Salut",
    brandName: "Verónica",
    categoryName: "Quesos",
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
    name: "Leche Entera",
    brandName: "La Serenísima",
    categoryName: "Lácteos",
    prices: [{ type: "unit", price: 1200, unitLabel: "litro" }],
    isAvailable: true,
  },
  {
    name: "Manteca",
    brandName: "La Serenísima",
    categoryName: "Lácteos",
    prices: [{ type: "unit", price: 2500, unitLabel: "pan 200g" }],
    isAvailable: true,
  },
  {
    name: "Crema de Leche",
    brandName: "La Serenísima",
    categoryName: "Lácteos",
    prices: [{ type: "unit", price: 1800, unitLabel: "200ml" }],
    isAvailable: true,
  },
  // Lácteos - Sancor
  {
    name: "Yogur Firme Vainilla",
    brandName: "Sancor",
    categoryName: "Lácteos",
    prices: [{ type: "unit", price: 950, unitLabel: "pote 190g" }],
    isAvailable: true,
  },
  {
    name: "Dulce de Leche",
    brandName: "Sancor",
    categoryName: "Lácteos",
    prices: [{ type: "unit", price: 3200, unitLabel: "pote 400g" }],
    isAvailable: true,
    tags: ["premium"],
  },
  // Almacén - La Campagnola
  {
    name: "Aceitunas Verdes",
    brandName: "La Campagnola",
    categoryName: "Almacén",
    prices: [{ type: "unit", price: 2100, unitLabel: "frasco 220g" }],
    isAvailable: true,
  },
  {
    name: "Aceitunas Negras",
    brandName: "La Campagnola",
    categoryName: "Almacén",
    prices: [{ type: "unit", price: 2400, unitLabel: "frasco 220g" }],
    isAvailable: false,
  },
  {
    name: "Tomates Peritas",
    brandName: "La Campagnola",
    categoryName: "Almacén",
    prices: [{ type: "unit", price: 1100, unitLabel: "lata 400g" }],
    isAvailable: true,
  },
  {
    name: "Arvejas",
    brandName: "La Campagnola",
    categoryName: "Almacén",
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
    let adminUserId = null;

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

        // Store first admin user ID for audit fields
        if (adminData.role === "admin" && !adminUserId) {
          adminUserId = uid;
        }

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

          // Store first admin user ID for audit fields
          if (adminData.role === "admin" && !adminUserId) {
            adminUserId = uid;
          }

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
      // await db.doc(`${getCollectionPath("adminUsers")}/${uid}`).set({
      //   email: adminData.email,
      //   displayName: adminData.displayName,
      //   role: adminData.role,
      //   isActive: true,
      //   createdAt: now,
      // });
    }
    console.log("");

    // Seed categories with Firestore-generated IDs
    console.log("📁 Seeding categories...");
    const categoryIdMap = new Map(); // name -> id mapping
    for (const categoryData of categoriesData) {
      const docRef = db.collection(getCollectionPath("categories")).doc();
      await docRef.set({
        ...categoryData,
        createdAt: now,
        updatedAt: now,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId,
      });
      categoryIdMap.set(categoryData.name, docRef.id);
      console.log(`   ✓ ${categoryData.name} - ID: ${docRef.id}`);
    }
    console.log(`   ✓ ${categoriesData.length} categories created\n`);

    // Seed brands with Firestore-generated IDs
    console.log("🏷️  Seeding brands...");
    const brandIdMap = new Map(); // name -> id mapping
    for (const brandData of brandsData) {
      const docRef = db.collection(getCollectionPath("brands")).doc();
      await docRef.set({
        ...brandData,
        createdAt: now,
        updatedAt: now,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId,
      });
      brandIdMap.set(brandData.name, docRef.id);
      console.log(`   ✓ ${brandData.name} - ID: ${docRef.id}`);
    }
    console.log(`   ✓ ${brandsData.length} brands created\n`);

    // Seed products with Firestore-generated IDs
    console.log("📦 Seeding products...");
    for (const productData of productsData) {
      const { brandName, categoryName, ...productFields } = productData;

      const brandId = brandIdMap.get(brandName);
      const categoryId = categoryIdMap.get(categoryName);

      if (!brandId || !categoryId) {
        console.warn(
          `   ⚠ Skipping ${productData.name}: missing brand or category`,
        );
        continue;
      }

      const docRef = db.collection(getCollectionPath("products")).doc();
      await docRef.set({
        ...productFields,
        brandId,
        categoryId,
        createdAt: now,
        updatedAt: now,
        createdBy: adminUserId,
        lastModifiedBy: adminUserId,
      });
      console.log(`   ✓ ${productData.name} - ID: ${docRef.id}`);
    }
    console.log(`   ✓ ${productsData.length} products created\n`);

    console.log("✅ Seed completed successfully!\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
