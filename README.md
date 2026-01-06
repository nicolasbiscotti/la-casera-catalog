# 🥩 La Casera - Catálogo de Precios

Aplicación web para catálogo de precios de fiambrería/almacén, con panel de administración seguro.

## 📋 Características

### Para Clientes (Público)

- ✅ Catálogo navegable por categorías y marcas
- ✅ Búsqueda en tiempo real con debounce
- ✅ Sistema de precios flexible (unidad, peso, fracciones)
- ✅ Vista mobile-first responsiva
- ✅ Botón de WhatsApp para consultas
- 🔜 PWA con modo offline
- 🔜 Compartir productos por WhatsApp

### Para Administradores (Privado)

- 🔜 CRUD de categorías, marcas y productos
- 🔜 Actualización masiva de precios (CSV)
- 🔜 Historial de cambios de precios
- 🔜 Dashboard con métricas básicas

## 🛠️ Stack Tecnológico

- **Frontend**: Vite 7 + TypeScript + Tailwind CSS v4
- **Base de Datos**: Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel (frontend) + Firebase (backend)

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Firebase CLI (`npm install -g firebase-tools`)

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd la-casera-catalogo

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
pnpm dev

# En otra terminal, iniciar emuladores de Firebase (opcional)
pnpm firebase:emulators
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
pnpm build
pnpm preview
```

## 📁 Estructura del Proyecto

```
la-casera-catalogo/
├── src/
│   ├── components/       # Componentes UI
│   │   ├── Header.ts
│   │   ├── SearchBar.ts
│   │   ├── Catalog.ts
│   │   ├── CategoryAccordion.ts
│   │   ├── ProductCard.ts
│   │   ├── SearchResults.ts
│   │   ├── Footer.ts
│   │   └── icons.ts
│   ├── services/         # Servicios y datos
│   │   ├── firebase.config.ts
│   │   └── mockData.ts
│   ├── store/            # Estado global
│   │   └── catalogStore.ts
│   ├── types/            # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilidades
│   │   ├── priceUtils.ts
│   │   └── debounce.ts
│   ├── styles/           # Estilos CSS
│   │   └── main.css
│   └── main.ts           # Entry point
├── public/               # Assets estáticos
├── firebase.json         # Config Firebase
├── firestore.rules       # Reglas de seguridad
└── firestore.indexes.json
```

## 🔧 Configuración

### Variables de Entorno

| Variable                            | Descripción                                |
| ----------------------------------- | ------------------------------------------ |
| `VITE_FIREBASE_API_KEY`             | API Key de Firebase                        |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Dominio de autenticación                   |
| `VITE_FIREBASE_PROJECT_ID`          | ID del proyecto Firebase                   |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Bucket de storage                          |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID del sender                              |
| `VITE_FIREBASE_APP_ID`              | ID de la aplicación                        |
| `VITE_ENVIRONMENT`                  | `development` \| `staging` \| `production` |
| `VITE_USE_FIREBASE_EMULATORS`       | `true` \| `false`                          |
| `VITE_STORE_NAME`                   | Nombre de la tienda                        |
| `VITE_STORE_WHATSAPP`               | Número de WhatsApp                         |

### Separación de Datos por Entorno

Los datos se almacenan en colecciones separadas según el entorno:

- **Production**: `/categories`, `/products`, etc.
- **Development**: `/environments/development/categories`, etc.
- **Staging**: `/environments/staging/categories`, etc.

## 📦 Modelo de Datos

### Category (Rubro)

```typescript
{
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  isActive: boolean;
  sortOrder: number;
}
```

### Brand (Marca)

```typescript
{
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  sortOrder: number;
}
```

### Product

```typescript
{
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  description?: string;
  prices: ProductPrice[];  // Múltiples tipos de precio
  isAvailable: boolean;
  tags?: string[];
}
```

### Sistema de Precios

```typescript
// Por unidad
{ type: 'unit', price: 2500, unitLabel: 'paquete' }

// Por peso
{ type: 'weight', pricePerKg: 8500, availableWeights: [100, 250, 500, 1000] }

// Por fracción
{ type: 'fraction', prices: { whole: 25000, half: 13000, quarter: 7000 }, fractionLabel: 'horma' }
```

## 🚀 Deployment

### Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno para cada environment
3. Deploy automático con cada push

### CI/CD Workflows

Ver `.github/workflows/` para configuraciones de CI/CD.

## 👥 Agregar Usuarios Admin

Los usuarios admin se gestionan a través de Firebase Console o Cloud Functions.

```javascript
// Ejemplo: agregar admin via Firebase Admin SDK
await db.collection("adminUsers").doc(userId).set({
  email: "admin@example.com",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
});
```

## 📄 Licencia

MIT

---
