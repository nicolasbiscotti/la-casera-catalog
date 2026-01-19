# 🔐 Security Architecture

This document describes the security model implemented in La Casera catalog application.

## Overview

The application uses a layered security approach:

1. **Firebase Authentication** - Identity management
2. **Custom Claims** - Role-based access (stored in Auth token)
3. **Anonymous Auth** - Bot protection for public access
4. **Firestore Security Rules** - Data access control

## Authentication Flow

### Public Users (Catalog Viewers)

```
User visits site → Anonymous Sign-in (automatic) → Can READ catalog data
```

- Users don't need to create an account
- Anonymous authentication happens automatically on page load
- This protects against bots/scrapers (they need a valid Firebase session)
- Anonymous users can only READ categories, brands, and products

### Admin Users

```
Admin visits /admin → Email/Password Sign-in → Gets admin Custom Claim → Can READ/WRITE
```

- Admin users must be created via Firebase Admin SDK (seed script)
- Custom Claims are set on the user's Auth token
- No database lookups needed to verify admin status (faster, free)

## Custom Claims

Instead of checking a database on every request, we store the admin role in the user's Auth token:

```javascript
// Set by Admin SDK (seed script)
await auth.setCustomUserClaims(uid, { admin: true });

// Checked in Firestore Rules
request.auth.token.admin == true
```

### Benefits

| Method | Cost per Check | Speed |
|--------|---------------|-------|
| Database lookup (old) | 1 read ($0.06/100K) | ~100ms |
| Custom Claim (new) | $0 | ~1ms |

## Firestore Security Rules

### Helper Functions

```javascript
// Check for admin Custom Claim in Auth token (FREE!)
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

// Check if user is signed in (even anonymously)
function isAuthenticated() {
  return request.auth != null;
}
```

### Access Matrix

| Collection | Anonymous | Authenticated | Admin |
|------------|-----------|---------------|-------|
| categories | ❌ | ✅ READ | ✅ READ/WRITE |
| brands | ❌ | ✅ READ | ✅ READ/WRITE |
| products | ❌ | ✅ READ | ✅ READ/WRITE |
| priceHistory | ❌ | ❌ | ✅ READ/WRITE |
| adminUsers | ❌ | Own profile only | Own profile only |
| analytics | ❌ | ✅ CREATE | ✅ FULL |

### Why Anonymous Auth?

Without authentication requirement:
```javascript
allow read: if true;  // Anyone can read - including bots!
```

A scraper could:
1. Make millions of requests
2. Increase your Firebase bill
3. Steal your entire price catalog

With anonymous auth requirement:
```javascript
allow read: if isAuthenticated();  // Must have valid session
```

Now scrapers must:
1. Initialize Firebase SDK
2. Sign in anonymously
3. Each request has a traceable session

You can monitor and rate-limit suspicious anonymous accounts in Firebase Console.

## Creating Admin Users

Admin users can ONLY be created through the Firebase Admin SDK (backend):

```javascript
// 1. Create auth user
const userRecord = await auth.createUser({
  email: 'admin@lacasera.com',
  password: 'securePassword123',
});

// 2. Set admin Custom Claim
await auth.setCustomUserClaims(userRecord.uid, { admin: true });

// 3. Create profile document (optional, for additional metadata)
await db.collection('adminUsers').doc(userRecord.uid).set({
  email: 'admin@lacasera.com',
  displayName: 'Administrator',
  role: 'admin',
  isActive: true,
});
```

**Important**: The seed script (`pnpm seed:local`) does this automatically for development.

## Frontend Auth Initialization

The app initializes authentication on startup:

```typescript
// main.ts
async function initApp() {
  // This ensures we have a valid session before querying Firestore
  await initializeAuth();
  
  // Now we can safely query the catalog
  const categories = await getCategories();
}
```

For anonymous users, `initializeAuth()` calls:
```typescript
await signInAnonymously(auth);
```

This is invisible to the user - they don't see a login screen.

## Security Checklist

- [x] Firestore rules require authentication for reads
- [x] Admin writes require Custom Claim verification
- [x] Admin users can only be created server-side
- [x] adminUsers collection is write-protected (client can't modify)
- [x] Anonymous auth enabled for bot protection
- [x] Custom Claims used instead of database lookups
- [x] Environment separation (dev/staging/production data)

## Potential Improvements

1. **Rate Limiting**: Add Firebase App Check for additional bot protection
2. **IP Blocking**: Monitor and block abusive anonymous accounts
3. **2FA**: Add two-factor authentication for admin users
4. **Audit Logging**: Track all admin actions with timestamps
