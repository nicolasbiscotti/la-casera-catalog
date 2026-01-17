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

- ✅ Login con autenticación
- ✅ Dashboard con estadísticas
- ✅ CRUD de categorías
- ✅ CRUD de marcas
- ✅ CRUD de productos con precios múltiples
- ✅ Historial de cambios de precios
- ✅ Exportar catálogo a PDF
- 🔜 Actualización masiva de precios (CSV)
- 🔜 Métricas avanzadas

## 🛠️ Stack Tecnológico

- **Frontend**: Vite + TypeScript + Tailwind CSS v4
- **Base de Datos**: Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel (frontend) + Firebase (backend)

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
node --version    # v22.x required
pnpm --version    # v10.x required
firebase --version # v15.x required
```

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/nicolasbiscotti/la-casera-catalog.git
cd la-casera-catalog

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Desarrollo Local

```bash
# Opción recomendada: iniciar emuladores y dev server juntos
pnpm dev:emulators

# O por separado:
pnpm firebase:emulators  # Terminal 1
pnpm dev                 # Terminal 2
```

La aplicación estará disponible en `http://localhost:3000`

**URLs de desarrollo:**

- App: http://localhost:3000
- Admin: http://localhost:3000/#/admin
- Emulator UI: http://localhost:4000

**Credenciales demo:**

- Admin: `admin@lacasera.com` / `admin123`
- Editor: `editor@lacasera.com` / `editor123`

### Sembrar Datos de Prueba

```bash
# Con emuladores corriendo
pnpm seed:local
```

### Build de Producción

```bash
pnpm build
pnpm preview
```

## 📁 Estructura del Proyecto

```
la-casera-catalog/
├── src/
│   ├── admin/            # Panel de administración
│   │   ├── components/   # AdminLayout, DataTable, icons
│   │   ├── pages/        # Login, Dashboard, CRUD pages
│   │   └── store/        # authStore, adminDataStore
│   ├── components/       # Componentes públicos
│   ├── services/         # Firebase config
│   ├── store/            # Estado global
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilidades
│   ├── router/           # Enrutamiento SPA
│   ├── styles/           # Estilos CSS
│   └── main.ts           # Entry point
├── scripts/              # Scripts de desarrollo
├── docs/                 # Documentación
├── public/               # Assets estáticos
├── .github/workflows/    # CI/CD
├── firebase.json         # Config emuladores
├── firestore.rules       # Reglas de seguridad
├── vercel.json           # Config Vercel
└── package.json
```

## 📖 Documentación

- **[Quick Start](./docs/QUICKSTART.md)** - Guía rápida para desarrollo local
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Setup completo de Firebase + Vercel

## 🔧 Scripts Disponibles

| Comando                      | Descripción              |
| ---------------------------- | ------------------------ |
| `pnpm dev`                   | Servidor de desarrollo   |
| `pnpm dev:emulators`         | Emuladores + dev server  |
| `pnpm build`                 | Build de producción      |
| `pnpm preview`               | Preview del build        |
| `pnpm lint`                  | Ejecutar ESLint          |
| `pnpm type-check`            | Verificar tipos          |
| `pnpm test`                  | Ejecutar tests (watch)   |
| `pnpm test:run`              | Ejecutar tests (una vez) |
| `pnpm firebase:emulators`    | Iniciar emuladores       |
| `pnpm firebase:deploy:rules` | Desplegar reglas         |
| `pnpm seed:local`            | Sembrar datos de prueba  |

## 🌍 Entornos

| Entorno     | Branch    | Vercel     | Firestore                     |
| ----------- | --------- | ---------- | ----------------------------- |
| Production  | `main`    | Production | `/` (root)                    |
| Staging     | `staging` | Preview    | `/environments/staging/*`     |
| Development | `develop` | Preview    | `/environments/development/*` |
| Local       | -         | -          | Emulators                     |

## 📦 Modelo de Datos

### Category

```typescript
{ id, name, slug, description?, iconName?, isActive, sortOrder }
```

### Brand

```typescript
{ id, name, description?, logoUrl?, isActive, sortOrder }
```

### Product

```typescript
{ id, name, brandId, categoryId, description?, prices[], isAvailable, tags?[] }
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

## 📄 Licencia

MIT

---
