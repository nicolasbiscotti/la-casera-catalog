# 🚀 Quick Start - Local Development

This guide gets you running locally in 5 minutes.

## Prerequisites

```bash
node --version  # v22.x required
pnpm --version  # v10.x required
firebase --version  # v15.x required
```

## Setup Steps

### 1. Clone & Install

```bash
git clone https://github.com/nicolasbiscotti/la-casera-catalog.git
cd la-casera-catalog
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` - for local development with emulators, you only need to set:

```env
VITE_ENVIRONMENT=development
VITE_USE_FIREBASE_EMULATORS=true
VITE_STORE_NAME=La Casera (Local)
VITE_STORE_WHATSAPP=5491112345678
```

The Firebase config values can remain as defaults since emulators don't validate them.

### 3. Start Development

**Option A: All-in-one (recommended)**

```bash
pnpm dev:emulators
```

This starts both Firebase emulators and Vite dev server.

**Option B: Separate terminals**

```bash
# Terminal 1 - Start emulators
pnpm firebase:emulators

# Terminal 2 - Start dev server
pnpm dev
```

### 4. Access the App

- **App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/#/admin
- **Emulator UI**: http://localhost:4000

### 5. Seed Sample Data (Optional)

With emulators running, in a new terminal:

```bash
pnpm seed:local
```

This creates:
- 4 categories
- 7 brands  
- 20 products
- 2 admin users

**Default Admin Credentials:**
- Email: `admin@lacasera.com`
- Password: `admin123`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm dev:emulators` | Start emulators + dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript check |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm firebase:emulators` | Start Firebase emulators |
| `pnpm seed:local` | Seed emulator with sample data |

## Troubleshooting

### Emulators won't start

```bash
# Check if ports are in use
lsof -i :8080   # Firestore
lsof -i :9099   # Auth
lsof -i :4000   # UI

# Kill if needed
kill -9 <PID>
```

### Build errors

```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### Data not persisting

Make sure you're using the import/export flags:

```bash
pnpm firebase:emulators  # Auto imports/exports firebase-data/
```

## Next Steps

- Read the full [Deployment Guide](./docs/DEPLOYMENT.md) for production setup
- Configure Firebase project for staging/production
- Set up Vercel deployment
