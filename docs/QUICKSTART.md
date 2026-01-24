# Quick Start Guide

## Prerequisites

Make sure you have the following installed:
- Node.js v22.x
- pnpm v10.x
- firebase-tools v15.x

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicolasbiscotti/la-casera-catalog.git
   cd la-casera-catalog
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   For local development with emulators, the default values work out of the box.

## Development

### Option 1: Full Local Development (Recommended)

Start both Firebase emulators and the dev server:

```bash
pnpm dev:emulators
```

This will:
- Start Firebase Auth emulator on port 9099
- Start Firestore emulator on port 8080
- Start Emulator UI on port 4000
- Start Vite dev server on port 3000

### Option 2: Separate Terminals

Terminal 1 - Start emulators:
```bash
pnpm firebase:emulators
```

Terminal 2 - Start dev server:
```bash
pnpm dev
```

### Seed Test Data

With emulators running:

```bash
pnpm seed:local
```

This creates sample categories, brands, and products.

## URLs

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| Admin Panel | http://localhost:3000/#/admin |
| Emulator UI | http://localhost:4000 |
| Firestore Emulator | localhost:8080 |
| Auth Emulator | localhost:9099 |

## Demo Credentials

For admin panel (coming soon):
- **Admin**: admin@lacasera.com / admin123
- **Editor**: editor@lacasera.com / editor123

## Project Structure

```
la-casera-catalog/
├── src/
│   ├── components/     # UI components
│   ├── services/       # Firebase services
│   ├── store/          # State management
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── router/         # SPA routing
│   ├── styles/         # CSS styles
│   ├── admin/          # Admin panel (coming soon)
│   ├── CatalogApp.ts   # Main catalog app
│   └── main.ts         # Entry point
├── scripts/            # Development scripts
├── docs/               # Documentation
└── public/             # Static assets
```

## Common Issues

### Emulators not starting
Make sure no other processes are using ports 8080, 9099, or 4000.

### TypeScript errors
Run type check:
```bash
pnpm type-check
```

### Data not loading
1. Check emulators are running
2. Verify `.env.local` has `VITE_USE_EMULATORS=true`
3. Run seed script if database is empty

## Next Steps

- Explore the catalog at http://localhost:3000
- View Firestore data at http://localhost:4000/firestore
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
