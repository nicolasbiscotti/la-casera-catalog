# Deployment Guide

## Overview

La Casera uses:

- **Frontend**: Vercel
- **Backend**: Firebase (Firestore + Auth)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., `la-casera-catalog`)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Services

**Firestore:**

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Production mode"
4. Select region (e.g., `southamerica-east1` for Argentina)

**Authentication:**

1. Go to Authentication
2. Click "Get started"
3. Enable "Email/Password" provider

### 3. Get Configuration

1. Go to Project Settings (⚙️)
2. Under "Your apps", click "Add app" → Web
3. Register app (e.g., "La Casera Web")
4. Copy the configuration object

### 4. Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Set project
firebase use your-project-id

# Deploy rules
firebase deploy --only firestore:rules
```

## Vercel Setup

### 1. Connect Repository

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Select the repository

### 2. Configure Build

Build settings should auto-detect from `vercel.json`:

- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 3. Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

| Variable                            | Production                   | Staging   |
| ----------------------------------- | ---------------------------- | --------- |
| `VITE_FIREBASE_API_KEY`             | Your API key                 | Same      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | your-project.firebaseapp.com | Same      |
| `VITE_FIREBASE_PROJECT_ID`          | your-project-id              | Same      |
| `VITE_FIREBASE_STORAGE_BUCKET`      | your-project.appspot.com     | Same      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID               | Same      |
| `VITE_FIREBASE_APP_ID`              | Your app ID                  | Same      |
| `VITE_ENVIRONMENT`                  | `production`                 | `staging` |
| `VITE_USE_EMULATORS`                | `false`                      | `false`   |

### 4. Branch Deployments

Configure in Vercel:

- **Production**: `main` branch
- **Preview**: `staging`, `develop`, and PR branches

## Environment Strategy

| Environment | Branch    | Vercel     | Firestore Path                        |
| ----------- | --------- | ---------- | ------------------------------------- |
| Production  | `main`    | Production | `/categories`, `/brands`, `/products` |
| Staging     | `staging` | Preview    | `/environments/staging/*`             |
| Development | `develop` | Preview    | `/environments/development/*`         |
| Local       | -         | -          | Emulators (root)                      |

## Admin User Setup

### Using Firebase Console

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password

### Set Custom Claims (Admin Role)

Use Firebase Admin SDK or Cloud Functions:

```javascript
// In Firebase Console → Functions or Cloud Shell
const admin = require("firebase-admin");
admin.initializeApp();

// Set admin role
admin
  .auth()
  .getUserByEmail("admin@lacasera.com")
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
  })
  .then(() => console.log("Admin role set"));
```

Or create a script:

```typescript
// scripts/set-admin.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({
  credential: cert("./serviceAccountKey.json"),
});

const email = process.argv[2];
const role = process.argv[3] || "editor";

async function setRole() {
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { role });
  console.log(`✅ Set ${role} role for ${email}`);
}

setRole();
```

Run with:

```bash
npx tsx scripts/set-admin.ts admin@lacasera.com admin
```

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test:run
      - run: pnpm build

  deploy-firebase-rules:
    needs: deploy
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Get Firebase Token

```bash
firebase login:ci
```

Add the token as `FIREBASE_TOKEN` in GitHub Secrets.

## Monitoring

### Firebase Console

- View Firestore usage and quotas
- Monitor Authentication users
- Check security rules

### Vercel Dashboard

- View deployment logs
- Monitor performance
- Check error logs

## Rollback

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Firebase Rules

```bash
# Deploy previous version of rules
git checkout HEAD~1 -- firestore.rules
firebase deploy --only firestore:rules
```

## Troubleshooting

### CORS Issues

- Verify Auth domain in Firebase Console
- Check Vercel domain is added to authorized domains

### Auth Not Working

- Verify environment variables are set correctly
- Check Firebase Auth is enabled

### Firestore Permission Denied

- Review security rules
- Verify user has correct custom claims
- Check if rules are deployed
