# 🚀 La Casera - Deployment Guide

Complete guide to set up local development, Firebase projects, and Vercel deployments for Development, Staging, and Production environments.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Vercel Setup](#vercel-setup)
5. [Local Development](#local-development)
6. [CI/CD Workflows](#cicd-workflows)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENTS                                 │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│   Development   │     Staging     │          Production             │
├─────────────────┼─────────────────┼─────────────────────────────────┤
│ Vercel Preview  │ Vercel Preview  │    Vercel Production            │
│ (PR branches)   │ (staging branch)│    (main branch)                │
├─────────────────┼─────────────────┼─────────────────────────────────┤
│                 Firebase Project: la-casera-catalog                 │
├─────────────────┼─────────────────┼─────────────────────────────────┤
│ /environments/  │ /environments/  │    / (root collections)         │
│ development/*   │ staging/*       │    /categories, /products...    │
└─────────────────┴─────────────────┴─────────────────────────────────┘
```

### Data Isolation Strategy

- **Production**: Data in root collections (`/categories`, `/products`, etc.)
- **Staging**: Data in `/environments/staging/*`
- **Development**: Data in `/environments/development/*`
- **Local**: Firebase Emulators (completely isolated)

---

## ✅ Prerequisites

### Required Tools

```bash
# Check your versions
node --version    # Required: v22.x
pnpm --version    # Required: v10.x
firebase --version # Required: v15.x
```

### Accounts Needed

- [x] GitHub account (repository access)
- [x] Firebase account (Google account)
- [x] Vercel account (can use GitHub to sign in)

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `la-casera-catalog` (or your preferred name)
4. Disable Google Analytics (optional, can enable later)
5. Click **"Create project"**

### Step 2: Enable Services

#### Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: `southamerica-east1` (São Paulo - closest to Argentina)
5. Click **"Enable"**

#### Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

### Step 3: Create Web App

1. In Firebase Console → **Project Overview** → Click web icon (`</>`)
2. App nickname: `la-casera-web`
3. **Don't** check "Firebase Hosting" (we use Vercel)
4. Click **"Register app"**
5. **COPY THE CONFIG** - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "la-casera-catalog",     // VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",     // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"              // VITE_FIREBASE_APP_ID
};
```

### Step 4: Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project (select existing project)
firebase init

# Select:
# - Firestore
# - (Skip Hosting - we use Vercel)

# Deploy rules
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 5: Create Initial Admin User

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email and password for the first admin
4. Copy the **User UID**

5. Go to **Firestore** → **Start collection**
6. Collection ID: `adminUsers`
7. Document ID: (paste the User UID)
8. Add fields:
   ```
   email: "admin@lacasera.com" (string)
   role: "admin" (string)
   isActive: true (boolean)
   displayName: "Administrador" (string)
   createdAt: (timestamp - click the clock icon)
   ```

---

## ▲ Vercel Setup

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: `nicolasbiscotti/la-casera-catalog`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Step 2: Configure Environment Variables

In Vercel → Project Settings → **Environment Variables**

Add the following variables for **Production** (select only "Production"):

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key | Production |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production |
| `VITE_FIREBASE_PROJECT_ID` | your-project-id | Production |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 123456789 | Production |
| `VITE_FIREBASE_APP_ID` | 1:123:web:abc | Production |
| `VITE_ENVIRONMENT` | `production` | Production |
| `VITE_USE_FIREBASE_EMULATORS` | `false` | Production |
| `VITE_STORE_NAME` | La Casera | Production |
| `VITE_STORE_WHATSAPP` | 5491112345678 | Production |

Then add for **Preview** (select only "Preview"):

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | (same as production) | Preview |
| `VITE_FIREBASE_AUTH_DOMAIN` | (same as production) | Preview |
| `VITE_FIREBASE_PROJECT_ID` | (same as production) | Preview |
| `VITE_FIREBASE_STORAGE_BUCKET` | (same as production) | Preview |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (same as production) | Preview |
| `VITE_FIREBASE_APP_ID` | (same as production) | Preview |
| `VITE_ENVIRONMENT` | `staging` | Preview |
| `VITE_USE_FIREBASE_EMULATORS` | `false` | Preview |
| `VITE_STORE_NAME` | La Casera (Staging) | Preview |
| `VITE_STORE_WHATSAPP` | 5491112345678 | Preview |

### Step 3: Configure Branch Deployments

In Vercel → Project Settings → **Git**

1. **Production Branch**: `main`
2. **Preview Branches**: All other branches

### Step 4: Configure Domain (Optional)

In Vercel → Project Settings → **Domains**

1. Add custom domain: `catalogo.lacasera.com.ar` (or your domain)
2. Follow DNS configuration instructions

---

## 💻 Local Development

### Step 1: Clone Repository

```bash
git clone https://github.com/nicolasbiscotti/la-casera-catalog.git
cd la-casera-catalog
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values (for local development with emulators)
```

Edit `.env.local`:

```env
# Firebase Config (same as production, but emulators will intercept)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# Local Development Settings
VITE_ENVIRONMENT=development
VITE_USE_FIREBASE_EMULATORS=true

# Store Config
VITE_STORE_NAME=La Casera (Local)
VITE_STORE_WHATSAPP=5491112345678
```

### Step 4: Start Firebase Emulators

```bash
# In terminal 1
pnpm firebase:emulators
```

This starts:
- Firestore Emulator: http://localhost:8080
- Auth Emulator: http://localhost:9099
- Emulator UI: http://localhost:4000

### Step 5: Start Development Server

```bash
# In terminal 2
pnpm dev
```

Application: http://localhost:3000

### Step 6: Seed Local Data (Optional)

Open Emulator UI at http://localhost:4000/firestore and import data, or use the seed script:

```bash
pnpm seed:local
```

---

## 🔄 CI/CD Workflows

### Branch Strategy

```
main (production)
  │
  └── staging (pre-production testing)
        │
        └── develop (integration branch)
              │
              ├── feature/xxx
              ├── fix/xxx
              └── ...
```

### Workflow Summary

| Branch | Vercel Environment | Firebase Data |
|--------|-------------------|---------------|
| `main` | Production | Root collections |
| `staging` | Preview (staging) | `/environments/staging/*` |
| `develop` | Preview (dev) | `/environments/development/*` |
| `feature/*` | Preview (dev) | `/environments/development/*` |

### GitHub Actions

The repository includes workflows in `.github/workflows/`:

1. **`ci.yml`**: Runs on all PRs
   - Lint, type-check, build
   
2. **`deploy-staging.yml`**: Runs on `staging` branch
   - Deploy to Vercel staging
   
3. **`deploy-production.yml`**: Runs on `main` branch
   - Deploy to Vercel production

---

## 📋 Environment Variables Reference

### Complete List

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `la-casera-catalog` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | App ID | `1:123:web:abc` |
| `VITE_ENVIRONMENT` | Environment name | `development` / `staging` / `production` |
| `VITE_USE_FIREBASE_EMULATORS` | Use local emulators | `true` / `false` |
| `VITE_STORE_NAME` | Store display name | `La Casera` |
| `VITE_STORE_WHATSAPP` | WhatsApp number | `5491112345678` |

### Per-Environment Values

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `VITE_ENVIRONMENT` | `development` | `staging` | `production` |
| `VITE_USE_FIREBASE_EMULATORS` | `true` | `false` | `false` |
| `VITE_STORE_NAME` | `La Casera (Local)` | `La Casera (Staging)` | `La Casera` |

---

## 🔧 Troubleshooting

### Firebase Emulators Won't Start

```bash
# Check if ports are in use
lsof -i :8080
lsof -i :9099

# Kill processes if needed
kill -9 <PID>

# Or use different ports in firebase.json
```

### Vercel Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all env variables are set
3. Try building locally: `pnpm build`

### Authentication Issues

1. Check if user exists in Firebase Auth
2. Check if user document exists in `adminUsers` collection
3. Verify `isActive: true` in user document

### Data Not Showing

1. Check browser console for errors
2. Verify `VITE_ENVIRONMENT` matches expected data location
3. For local: ensure emulators are running
4. Check Firestore rules allow read access

### CORS Errors

1. Add your domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `localhost`, `*.vercel.app`, your custom domain

---

## 📞 Support

For issues with this project:
- Open a GitHub issue
- Contact the development team

---

## 📝 Checklist

### Initial Setup
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Authentication enabled
- [ ] Web app registered
- [ ] Security rules deployed
- [ ] First admin user created

### Vercel Setup
- [ ] Project imported from GitHub
- [ ] Production env variables configured
- [ ] Preview env variables configured
- [ ] Custom domain configured (optional)

### Local Development
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Emulators working
- [ ] Dev server running
