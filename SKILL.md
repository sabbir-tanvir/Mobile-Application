---
name: turfslot-mobile-app
description: >-
  Use this skill when building, extending, or debugging the TurfSlot mobile application.
  Covers React Native (Expo) project architecture, modular folder structure, navigation,
  state management, API integration with the existing TurfSlot backend, authentication,
  offline-first patterns, testing, CI/CD, accessibility, and performance optimization.
  Activate whenever the user requests mobile-related development work in the
  Mobile-Application directory.
---

# TurfSlot Mobile Application — Senior Engineering Skill

> A production-grade React Native (Expo) mobile application for the TurfSlot turf
> booking and management platform. This document defines the architecture, conventions,
> and engineering standards that every contributor must follow.

---

## Table of Contents

1. [Tech Stack & Tooling](#1-tech-stack--tooling)
2. [Project Structure](#2-project-structure)
3. [Architecture Overview](#3-architecture-overview)
4. [Module Contracts](#4-module-contracts)
5. [Navigation](#5-navigation)
6. [State Management](#6-state-management)
7. [API Layer & Backend Integration](#7-api-layer--backend-integration)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Offline-First & Data Persistence](#9-offline-first--data-persistence)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Forms & Validation](#11-forms--validation)
12. [Error Handling & Logging](#12-error-handling--logging)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance Optimization](#14-performance-optimization)
15. [Security](#15-security)
16. [Accessibility (a11y)](#16-accessibility-a11y)
17. [Internationalization (i18n)](#17-internationalization-i18n)
18. [CI/CD & Release Management](#18-cicd--release-management)
19. [Environment Configuration](#19-environment-configuration)
20. [Git Workflow & Code Review](#20-git-workflow--code-review)
21. [Troubleshooting & Gotchas](#21-troubleshooting--gotchas)

---

## 1. Tech Stack & Tooling

| Layer               | Technology                                   | Purpose                             |
| :------------------ | :------------------------------------------- | :---------------------------------- |
| **Runtime**         | React Native 0.76+ (Expo SDK 52+)           | Cross-platform mobile framework     |
| **Language**        | TypeScript 5.x (strict mode)                | Type safety & developer experience  |
| **Navigation**      | Expo Router (file-based routing)             | Type-safe, convention-based routing |
| **State (server)**  | TanStack React Query v5                      | Cache, sync, dedupe server state    |
| **State (client)**  | Zustand                                      | Lightweight client-only state       |
| **Forms**           | React Hook Form + Zod                        | Performant forms with schema validation |
| **Styling**         | Nativewind v4 (Tailwind for RN)             | Utility-first styling               |
| **HTTP Client**     | Axios (with interceptors)                    | HTTP requests & token management    |
| **Storage**         | expo-secure-store + MMKV                     | Secure token storage & fast KV cache|
| **Animations**      | React Native Reanimated v3                   | 60fps gesture-driven animations     |
| **Push Notifications** | expo-notifications + FCM/APNs            | Real-time booking alerts            |
| **Testing**         | Jest + React Native Testing Library + Detox | Unit, integration, E2E              |
| **Linting**         | ESLint (flat config) + Prettier              | Code quality & formatting           |
| **CI/CD**           | EAS Build + EAS Submit                       | Cloud builds & store submission     |

---

## 2. Project Structure

```text
Mobile-Application/
├── app/                          # Expo Router file-based routes
│   ├── (auth)/                   # Auth group (unauthenticated screens)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigator (authenticated)
│   │   ├── index.tsx             # Home / Dashboard
│   │   ├── bookings.tsx          # My Bookings
│   │   ├── explore.tsx           # Browse Turfs
│   │   ├── tournaments.tsx       # Tournaments
│   │   └── profile.tsx           # User Profile
│   ├── turf/
│   │   └── [id].tsx              # Turf detail (dynamic route)
│   ├── booking/
│   │   ├── [id].tsx              # Booking detail
│   │   └── create.tsx            # New booking flow
│   ├── payment/
│   │   └── [bookingId].tsx       # Payment screen
│   ├── _layout.tsx               # Root layout (providers, fonts, splash)
│   └── +not-found.tsx            # 404 fallback
│
├── src/
│   ├── api/                      # API layer (one file per resource)
│   │   ├── client.ts             # Axios instance, interceptors, base config
│   │   ├── auth.api.ts           # POST /auth/login, /auth/register, etc.
│   │   ├── turfs.api.ts          # GET/POST/PUT/DELETE /turfs
│   │   ├── bookings.api.ts       # /bookings endpoints
│   │   ├── payments.api.ts       # /payments endpoints
│   │   ├── tournaments.api.ts    # /tournaments endpoints
│   │   ├── products.api.ts       # /products endpoints
│   │   └── types/                # Shared API request/response types
│   │       ├── auth.types.ts
│   │       ├── turf.types.ts
│   │       ├── booking.types.ts
│   │       ├── payment.types.ts
│   │       └── common.types.ts   # ApiResponse<T>, PaginatedResponse<T>, etc.
│   │
│   ├── components/               # Reusable UI components (atomic design)
│   │   ├── ui/                   # Primitives (Button, Input, Card, Badge, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts         # Barrel export
│   │   ├── booking/              # Booking-specific composites
│   │   │   ├── BookingCard.tsx
│   │   │   ├── SlotPicker.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── index.ts
│   │   ├── turf/                 # Turf-specific composites
│   │   │   ├── TurfCard.tsx
│   │   │   ├── TurfGallery.tsx
│   │   │   ├── AmenityList.tsx
│   │   │   └── index.ts
│   │   ├── layout/               # Layout primitives
│   │   │   ├── SafeArea.tsx
│   │   │   ├── ScreenWrapper.tsx
│   │   │   └── KeyboardAvoid.tsx
│   │   └── feedback/             # User feedback components
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingScreen.tsx
│   │       └── RefreshControl.tsx
│   │
│   ├── hooks/                    # Custom hooks (one concern per hook)
│   │   ├── queries/              # React Query hooks per resource
│   │   │   ├── useAuth.ts
│   │   │   ├── useTurfs.ts
│   │   │   ├── useBookings.ts
│   │   │   ├── usePayments.ts
│   │   │   └── useTournaments.ts
│   │   ├── useDebounce.ts
│   │   ├── useRefreshOnFocus.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useKeyboard.ts
│   │
│   ├── stores/                   # Zustand client-state stores
│   │   ├── auth.store.ts         # Auth tokens, user session
│   │   ├── ui.store.ts           # Theme, bottom sheet state, etc.
│   │   └── booking-draft.store.ts # In-progress booking form data
│   │
│   ├── lib/                      # Pure utilities (zero side effects)
│   │   ├── constants.ts          # App-wide constants
│   │   ├── storage.ts            # MMKV + SecureStore wrappers
│   │   ├── date.ts               # Date formatting helpers (day.js)
│   │   ├── currency.ts           # ৳ formatting (Bangladeshi Taka)
│   │   ├── validators.ts         # Zod schemas shared across forms
│   │   ├── permissions.ts        # Role-based permission checks
│   │   └── analytics.ts          # Event tracking abstraction
│   │
│   ├── theme/                    # Design tokens & theming
│   │   ├── colors.ts             # Semantic color palette (light/dark)
│   │   ├── typography.ts         # Font families, sizes, line heights
│   │   ├── spacing.ts            # Consistent spacing scale
│   │   ├── shadows.ts            # Elevation shadows
│   │   └── index.ts              # Unified theme export
│   │
│   ├── providers/                # React context providers
│   │   ├── AuthProvider.tsx      # Auth state + token refresh logic
│   │   ├── QueryProvider.tsx     # TanStack Query client config
│   │   ├── ThemeProvider.tsx     # Light/dark mode
│   │   └── NotificationProvider.tsx
│   │
│   ├── config/                   # App configuration
│   │   ├── env.ts                # Typed environment variables
│   │   ├── queryClient.ts        # React Query defaults
│   │   └── app.config.ts         # Expo config (dynamic)
│   │
│   └── types/                    # Global TypeScript types
│       ├── navigation.ts         # Route param types
│       ├── env.d.ts              # Environment variable declarations
│       └── global.d.ts           # Module augmentations
│
├── assets/                       # Static assets
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── animations/               # Lottie files
│
├── __tests__/                    # Test files (mirrors src/ structure)
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── e2e/                      # Detox E2E tests
│
├── scripts/                      # Dev & CI helper scripts
│   ├── generate-api-types.ts     # Auto-generate types from backend
│   └── check-env.ts              # Validate .env before build
│
├── .env.example                  # Template for environment variables
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── app.json                      # Expo app manifest
├── babel.config.js               # Babel config (Nativewind, Reanimated)
├── eas.json                      # EAS Build profiles
├── metro.config.js               # Metro bundler customization
├── nativewind-env.d.ts           # Nativewind type declarations
├── tailwind.config.ts            # Tailwind/Nativewind config
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

### Structural Rules

1. **One export per file** — every `.tsx`/`.ts` file has a single default or named export.
2. **Barrel exports** — each directory with 3+ files must have an `index.ts` that re-exports.
3. **Co-location** — tests live in `__tests__/` mirroring `src/` paths, **not** next to source.
4. **No circular imports** — dependency flow is strictly: `app/ → hooks/ → api/ → lib/`. Components never import from `app/`.
5. **Feature isolation** — feature-specific components go in `components/<feature>/`, never in `ui/`.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Expo Router                       │
│              (File-based Routing)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐   ┌───────────┐   ┌───────────────┐  │
│  │  Screens │──▶│  Hooks    │──▶│  API Layer    │  │
│  │ (app/)   │   │ (queries/)│   │ (api/*.ts)    │  │
│  └──────────┘   └───────────┘   └───────┬───────┘  │
│       │                                  │          │
│       ▼                                  ▼          │
│  ┌──────────┐                  ┌───────────────┐   │
│  │Components│                  │ Axios Client  │   │
│  │(ui/,feat)│                  │ (client.ts)   │   │
│  └──────────┘                  └───────┬───────┘   │
│       │                                  │          │
│       ▼                                  ▼          │
│  ┌──────────┐                  ┌───────────────┐   │
│  │ Zustand  │                  │  TurfSlot     │   │
│  │ Stores   │                  │  Backend API  │   │
│  │(client)  │                  │ (Express+SQL) │   │
│  └──────────┘                  └───────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Providers: Auth │ Query │ Theme │ Notifications    │
└─────────────────────────────────────────────────────┘
```

### Layered Architecture Principles

| Layer            | Responsibility                                   | May Import From                    |
| :--------------- | :----------------------------------------------- | :--------------------------------- |
| **Screens**      | Layout, orchestration, navigation side-effects   | Components, Hooks, Stores, Lib     |
| **Components**   | Pure UI rendering, accept props, emit callbacks  | UI primitives, Theme, Lib          |
| **Hooks**        | Data-fetching, side-effects, business logic glue | API Layer, Stores, Lib             |
| **API Layer**    | HTTP requests, request/response transformation   | Axios Client, Types                |
| **Stores**       | Client-only state (UI state, drafts, session)    | Lib                                |
| **Lib**          | Pure functions, constants, no React dependencies | Nothing (leaf nodes)               |
| **Providers**    | Context setup, initialization logic              | Hooks, Stores, Lib                 |

**Rule**: Dependencies flow **downward** only. A lower layer must never import from a higher one.

---

## 4. Module Contracts

Every module must adhere to these contracts:

### 4.1 API Module Contract

```typescript
// src/api/turfs.api.ts
import { apiClient } from './client';
import type { Turf, CreateTurfPayload, UpdateTurfPayload } from './types/turf.types';
import type { ApiResponse, PaginatedResponse } from './types/common.types';

/**
 * Each API module exports pure functions that:
 * 1. Accept typed payloads
 * 2. Call apiClient with the correct endpoint
 * 3. Return typed responses
 * 4. Perform NO side effects beyond the HTTP call
 */
export const turfsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResponse<Turf>>('/turfs', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Turf>>(`/turfs/${id}`),

  create: (payload: CreateTurfPayload) =>
    apiClient.post<ApiResponse<Turf>>('/turfs', payload),

  update: (id: string, payload: UpdateTurfPayload) =>
    apiClient.put<ApiResponse<Turf>>(`/turfs/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/turfs/${id}`),
} as const;
```

### 4.2 Hook Module Contract

```typescript
// src/hooks/queries/useTurfs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turfsApi } from '@/api/turfs.api';
import type { Turf, CreateTurfPayload } from '@/api/types/turf.types';

/** Query key factory — prevents key collisions */
export const turfKeys = {
  all:    ['turfs'] as const,
  lists:  () => [...turfKeys.all, 'list'] as const,
  list:   (filters: Record<string, unknown>) => [...turfKeys.lists(), filters] as const,
  details:() => [...turfKeys.all, 'detail'] as const,
  detail: (id: string) => [...turfKeys.details(), id] as const,
};

export function useTurfs(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: turfKeys.list(filters ?? {}),
    queryFn: () => turfsApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTurf(id: string) {
  return useQuery({
    queryKey: turfKeys.detail(id),
    queryFn: () => turfsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTurf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTurfPayload) => turfsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: turfKeys.lists() });
    },
  });
}
```

### 4.3 Component Module Contract

```typescript
// src/components/turf/TurfCard.tsx
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import type { Turf } from '@/api/types/turf.types';

interface TurfCardProps {
  /** The turf data to display */
  turf: Turf;
  /** Called when the user taps the card */
  onPress: (id: string) => void;
  /** Optional test ID for E2E testing */
  testID?: string;
}

/**
 * Component rules:
 * 1. Props-in, callbacks-out — no internal data fetching
 * 2. Must accept testID for Detox E2E
 * 3. Must be wrapped in React.memo if rendering in a list
 * 4. Must use semantic theme tokens, not hardcoded colors
 */
export const TurfCard = React.memo(function TurfCard({
  turf,
  onPress,
  testID,
}: TurfCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`View ${turf.name}`}
      onPress={() => onPress(turf.id)}
    >
      {/* ... */}
    </Pressable>
  );
});
```

### 4.4 Store Module Contract

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  // Actions — always grouped at the bottom
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

/**
 * Store rules:
 * 1. Flat state — no nesting beyond one level
 * 2. Actions are part of the store, not external
 * 3. Selectors are exported separately to prevent re-renders
 * 4. Persisted stores use MMKV, never AsyncStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Granular selectors to minimize re-renders
export const selectToken = (state: AuthState) => state.token;
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuth = (state: AuthState) => state.isAuthenticated;
```

---

## 5. Navigation

### 5.1 Expo Router File-Based Routing

Navigation is **convention-based** (matching the web client's `pages.config.js` pattern). Every file in `app/` automatically becomes a route.

```text
app/
├── _layout.tsx           →  Root layout (providers, auth guard)
├── (auth)/
│   ├── _layout.tsx       →  Stack navigator for auth screens
│   ├── login.tsx          →  /login
│   └── register.tsx       →  /register
├── (tabs)/
│   ├── _layout.tsx       →  Tab navigator
│   ├── index.tsx          →  / (Dashboard)
│   ├── bookings.tsx       →  /bookings
│   └── explore.tsx        →  /explore
├── turf/
│   └── [id].tsx           →  /turf/:id
└── booking/
    └── [id].tsx           →  /booking/:id
```

### 5.2 Auth-Guarded Navigation

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const isAuthenticated = useAuthStore(selectIsAuth);
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Providers>
      <Slot />
    </Providers>
  );
}
```

### 5.3 Deep Linking

Configure universal links and deep links in `app.json`:

```json
{
  "expo": {
    "scheme": "turfslot",
    "web": { "bundler": "metro" },
    "plugins": [
      ["expo-router", { "root": "./app" }]
    ]
  }
}
```

Supported deep link patterns:
- `turfslot://turf/:id` → Turf detail
- `turfslot://booking/:id` → Booking detail
- `turfslot://explore` → Browse turfs

---

## 6. State Management

### 6.1 State Ownership Matrix

| State Type       | Tool               | Example                        | Persistence     |
| :--------------- | :----------------- | :----------------------------- | :-------------- |
| **Server state** | React Query        | Turf list, booking data        | Query cache     |
| **Auth state**   | Zustand (persisted)| JWT token, user profile        | MMKV            |
| **UI state**     | Zustand            | Theme mode, active modal       | Memory          |
| **Form state**   | React Hook Form    | Booking creation form          | Memory          |
| **Navigation**   | Expo Router        | Current route, params          | URL             |
| **Secure data**  | expo-secure-store  | Refresh tokens                 | Keychain/Keystore|

### 6.2 Golden Rules

1. **Server state ≠ client state** — never copy React Query data into Zustand.
2. **Single source of truth** — each piece of data lives in exactly one store.
3. **Derive, don't duplicate** — computed values are selectors, not stored fields.
4. **Optimistic updates** — use React Query's `onMutate` for instant UI feedback.

---

## 7. API Layer & Backend Integration

### 7.1 TurfSlot Backend Alignment

The mobile app consumes the same Express API as the web client. The backend contract is:

| Aspect               | Convention                                                       |
| :------------------- | :--------------------------------------------------------------- |
| **Base URL**         | `EXPO_PUBLIC_API_URL` (e.g. `https://turf.rumon.top/api`)       |
| **Response shape**   | `{ success: boolean, data: T, count?: number, pagination?: P }` |
| **Error shape**      | `{ success: false, error: string }`                              |
| **Auth header**      | `Authorization: Bearer <jwt>`                                    |
| **Column casing**    | `snake_case` from backend → camelCase in mobile app              |
| **Currency**         | Bangladeshi Taka (৳) — all amounts are integers (no decimals)    |
| **Payment methods**  | `bkash`, `nagad`, `rocket`, `cash`, `card`                       |
| **JSON columns**     | `amenities`, `payment_history` — arrays serialized as JSON text  |

### 7.2 Axios Client Configuration

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';
import { camelizeKeys, decamelizeKeys } from '@/lib/caseTransform';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token + transform keys ──
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Transform camelCase → snake_case for the backend
  if (config.data && !(config.data instanceof FormData)) {
    config.data = decamelizeKeys(config.data);
  }
  if (config.params) {
    config.params = decamelizeKeys(config.params);
  }
  return config;
});

// ── Response interceptor: unwrap { data } + transform keys ──
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps in { success, data }, we unwrap .data
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = camelizeKeys(body.data);
    }
    return response;
  },
  (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(normalizeError(error));
  }
);
```

### 7.3 Key Backend Endpoints

| Endpoint                            | Method | Mobile Usage                          |
| :---------------------------------- | :----- | :------------------------------------ |
| `/api/auth/login`                   | POST   | Email/password login                  |
| `/api/auth/register`               | POST   | New customer registration             |
| `/api/auth/me`                     | GET    | Fetch current user (token validation) |
| `/api/turfs`                       | GET    | List turfs with filtering/pagination  |
| `/api/turfs/:id`                   | GET    | Turf detail + amenities               |
| `/api/bookings`                    | GET    | User's booking history                |
| `/api/bookings`                    | POST   | Create a new booking                  |
| `/api/bookings/:id`               | PUT    | Update booking (partial payment)      |
| `/api/payments`                    | POST   | Record payment against a booking      |
| `/api/tournaments`                 | GET    | List active tournaments               |
| `/api/products`                    | GET    | Shop / merchandise listing            |
| `/api/upload`                      | POST   | Upload image (Cloudinary via multer)  |

### 7.4 Partial Payment Flow

The TurfSlot system supports partial payments on bookings. The mobile app must handle:

```typescript
interface Booking {
  id: string;
  totalPrice: number;       // Total booking cost in ৳
  paidAmount: number;        // Amount paid so far
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentHistory: Array<{
    amount: number;
    method: 'bkash' | 'nagad' | 'rocket' | 'cash' | 'card';
    date: string;           // ISO 8601
    note?: string;
  }>;
}
```

Display logic:
- `paymentStatus === 'pending'` → Show "Pay Now" CTA
- `paymentStatus === 'partial'` → Show remaining balance + "Pay More" CTA
- `paymentStatus === 'paid'` → Show "Paid ✓" badge

---

## 8. Authentication & Authorization

### 8.1 Auth Flow

```
┌──────────┐    POST /auth/login     ┌──────────┐
│  Login   │ ──────────────────────▶ │ Backend  │
│  Screen  │ ◀────────────────────── │          │
│          │    { token, user }      │          │
└────┬─────┘                         └──────────┘
     │
     ▼
┌──────────────────────┐
│ Store token in        │
│ expo-secure-store     │
│ Store user in Zustand │
│ (persisted via MMKV)  │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Redirect to (tabs)/  │
│ Axios interceptor    │
│ auto-attaches token  │
└──────────────────────┘
```

### 8.2 Token Refresh Strategy

1. On 401 response → clear auth state → redirect to login.
2. On app foreground → call `GET /api/auth/me` to validate token.
3. Store token in `expo-secure-store` (keychain on iOS, keystore on Android).
4. Store user profile in Zustand+MMKV for fast hydration on cold start.

### 8.3 Role-Based Access

```typescript
// src/lib/permissions.ts
type Role = 'admin' | 'owner' | 'customer';

const PERMISSIONS = {
  'booking:create':   ['admin', 'owner', 'customer'],
  'booking:cancel':   ['admin', 'owner', 'customer'], // own bookings only
  'turf:manage':      ['admin', 'owner'],
  'turf:create':      ['admin'],
  'payment:record':   ['admin', 'owner'],
  'tournament:manage':['admin', 'owner'],
} as const;

export function can(role: Role, action: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[action]?.includes(role) ?? false;
}
```

---

## 9. Offline-First & Data Persistence

### 9.1 Strategy

| Data                  | Offline Behavior                            |
| :-------------------- | :------------------------------------------ |
| Turf list             | Show cached data, stale indicator           |
| My bookings           | Show cached, disable mutations              |
| Booking creation      | Queue in local store, sync when online      |
| Payment               | Block — requires online confirmation        |
| Images                | Cache with expo-image                       |

### 9.2 Network Status Hook

```typescript
// src/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

export function useNetworkStatus() {
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(state.isConnected ?? false);
    });
  }, []);
}
```

### 9.3 Persistent Query Cache

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { mmkvStorage } from '@/lib/storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutes
      gcTime: 24 * 60 * 60 * 1000,    // 24 hours
      retry: 2,
      refetchOnReconnect: 'always',
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: mmkvStorage,
  throttleTime: 1000,
});
```

---

## 10. UI/UX Design System

### 10.1 Design Tokens

```typescript
// src/theme/colors.ts
export const colors = {
  light: {
    primary:    { DEFAULT: '#16A34A', foreground: '#FFFFFF' }, // Green — turf/sports
    secondary:  { DEFAULT: '#0EA5E9', foreground: '#FFFFFF' }, // Sky blue
    accent:     { DEFAULT: '#F59E0B', foreground: '#1A1A1A' }, // Amber
    background: { DEFAULT: '#FAFAFA', card: '#FFFFFF', muted: '#F4F4F5' },
    text:       { DEFAULT: '#18181B', secondary: '#71717A', muted: '#A1A1AA' },
    border:     { DEFAULT: '#E4E4E7', ring: '#16A34A' },
    destructive:{ DEFAULT: '#EF4444', foreground: '#FFFFFF' },
    success:    '#22C55E',
    warning:    '#F59E0B',
    info:       '#3B82F6',
  },
  dark: {
    primary:    { DEFAULT: '#22C55E', foreground: '#0A0A0A' },
    secondary:  { DEFAULT: '#38BDF8', foreground: '#0A0A0A' },
    accent:     { DEFAULT: '#FBBF24', foreground: '#0A0A0A' },
    background: { DEFAULT: '#0A0A0A', card: '#171717', muted: '#262626' },
    text:       { DEFAULT: '#FAFAFA', secondary: '#A1A1AA', muted: '#71717A' },
    border:     { DEFAULT: '#262626', ring: '#22C55E' },
    destructive:{ DEFAULT: '#DC2626', foreground: '#FAFAFA' },
    success:    '#4ADE80',
    warning:    '#FBBF24',
    info:       '#60A5FA',
  },
} as const;
```

### 10.2 Typography Scale

```typescript
// src/theme/typography.ts
export const typography = {
  fontFamily: {
    sans: 'Inter',
    mono: 'JetBrainsMono',
  },
  fontSize: {
    xs:   { size: 12, lineHeight: 16 },
    sm:   { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg:   { size: 18, lineHeight: 28 },
    xl:   { size: 20, lineHeight: 28 },
    '2xl':{ size: 24, lineHeight: 32 },
    '3xl':{ size: 30, lineHeight: 36 },
    '4xl':{ size: 36, lineHeight: 40 },
  },
} as const;
```

### 10.3 Spacing Scale

```typescript
// src/theme/spacing.ts — 4px base grid
export const spacing = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10,
  3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28,
  8: 32, 9: 36, 10: 40, 11: 44, 12: 48,
  14: 56, 16: 64, 20: 80, 24: 96,
} as const;
```

### 10.4 Component Guidelines

1. **All UI primitives** (`Button`, `Input`, `Card`) must support both light and dark themes via semantic tokens.
2. **Touch targets** must be at minimum 44×44 dp (Apple HIG) / 48×48 dp (Material).
3. **Haptic feedback** on destructive actions (delete, cancel booking).
4. **Skeleton screens** over spinners — always show content shape while loading.
5. **Pull-to-refresh** on all list screens using React Query's `refetch`.

---

## 11. Forms & Validation

### 11.1 Pattern: React Hook Form + Zod

```typescript
// src/lib/validators.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const bookingSchema = z.object({
  turfId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid BD phone number'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'cash', 'card']),
  advanceAmount: z.number().min(0).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
```

### 11.2 Form Rules

1. **Validate on blur**, not on every keystroke.
2. **Show inline errors** beneath the field, not in toasts.
3. **Disable submit** while `isSubmitting` is true (prevent double-tap).
4. **Persist draft state** in Zustand for multi-step forms (e.g., booking flow).

---

## 12. Error Handling & Logging

### 12.1 Error Boundary

```typescript
// src/components/feedback/ErrorBoundary.tsx
/**
 * Wrap each screen (not the entire app) so one crash
 * doesn't take down the whole application.
 */
```

### 12.2 Error Hierarchy

| Level       | Mechanism             | User Impact                       |
| :---------- | :-------------------- | :-------------------------------- |
| **Network** | Axios interceptor     | Toast: "No internet connection"   |
| **API 4xx** | React Query `onError` | Inline error message on the field |
| **API 5xx** | React Query `onError` | Full-screen retry prompt          |
| **JS crash**| ErrorBoundary         | Screen-level fallback UI          |
| **Fatal**   | expo-updates          | Force update prompt               |

### 12.3 Logging

```typescript
// src/lib/logger.ts
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

/**
 * Rules:
 * 1. Never log tokens, passwords, or PII
 * 2. Use structured logging: logger.error('booking:create:failed', { bookingId, statusCode })
 * 3. In production: only 'warn' and 'error' are sent to crash reporting
 * 4. In dev: all levels print to console
 */
```

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
         ╱╲
        ╱ E2E ╲          ← Detox: 5-10 critical user journeys
       ╱────────╲
      ╱Integration╲      ← RNTL: hooks + component integration
     ╱──────────────╲
    ╱   Unit Tests   ╲   ← Jest: pure functions, utilities, stores
   ╱──────────────────╲
```

| Type            | Tool                          | Target                  | Coverage Goal |
| :-------------- | :---------------------------- | :---------------------- | :------------ |
| **Unit**        | Jest                          | `lib/`, `stores/`, API  | ≥80%          |
| **Integration** | React Native Testing Library  | Components + hooks      | ≥60%          |
| **E2E**         | Detox                         | Critical user flows     | Top 5 flows   |
| **Type**        | TypeScript `tsc --noEmit`     | Full codebase           | 100%          |

### 13.2 Test File Naming

```
__tests__/
├── api/
│   └── turfs.api.test.ts          # Unit test for API functions
├── hooks/
│   └── useTurfs.test.ts           # Integration test for hook
├── components/
│   └── turf/
│       └── TurfCard.test.tsx      # Component rendering test
└── e2e/
    ├── auth.e2e.ts                # Login/logout flow
    └── booking.e2e.ts             # Create booking flow
```

### 13.3 Critical E2E Journeys

1. **Login** → Dashboard renders with user data
2. **Browse turfs** → Tap turf → See detail
3. **Create booking** → Select slot → Enter details → Confirm → See in "My Bookings"
4. **Make payment** → Select method → Enter amount → Confirm → Updated status
5. **Logout** → Redirected to login screen

### 13.4 Testing Commands

```bash
# Unit + integration tests
npx jest --coverage

# Type checking
npx tsc --noEmit

# E2E (iOS)
npx detox build --configuration ios.sim.release
npx detox test --configuration ios.sim.release

# E2E (Android)
npx detox build --configuration android.emu.release
npx detox test --configuration android.emu.release
```

---

## 14. Performance Optimization

### 14.1 Rendering

| Technique                     | When to Use                                |
| :---------------------------- | :----------------------------------------- |
| `React.memo`                  | List item components, static UI blocks     |
| `useCallback` / `useMemo`     | Event handlers and computed values in lists |
| `FlashList` (Shopify)         | All scrollable lists (replace FlatList)     |
| `expo-image`                  | All remote images (built-in caching)        |
| Reanimated `useAnimatedStyle` | Animations that must run on the UI thread   |

### 14.2 Bundle Size

1. **Tree-shake imports** — never `import * from`.
2. **Lazy load screens** — Expo Router handles this automatically.
3. **Analyze bundle** — `npx expo export --dump-sourcemap` + `source-map-explorer`.
4. **Optimize images** — use WebP format, max 2x resolution for assets.

### 14.3 Startup Time

1. **Minimal root layout** — only mount essential providers at the root.
2. **Defer non-critical** — load analytics, crash reporting after first render.
3. **Pre-warm queries** — prefetch dashboard data during splash screen.
4. **Hermes engine** — enabled by default in Expo SDK 52+ (verify in `app.json`).

---

## 15. Security

### 15.1 Checklist

- [ ] JWT stored in `expo-secure-store` (never AsyncStorage / MMKV)
- [ ] No secrets in client-side code or `.env` committed to git
- [ ] Certificate pinning enabled for production API (expo-secure-store SSL)
- [ ] All user inputs sanitized before sending to the backend
- [ ] Sensitive screens (payment) prevent screenshots (`expo-screen-capture`)
- [ ] ProGuard / R8 obfuscation enabled for Android release builds
- [ ] No `console.log` in production (stripped by Babel plugin)
- [ ] Biometric authentication option for returning users (`expo-local-authentication`)

### 15.2 Secure Storage Abstraction

```typescript
// src/lib/storage.ts
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

// Secure: tokens, secrets (uses iOS Keychain / Android Keystore)
export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

// Fast: non-sensitive cached data (user prefs, query cache)
const mmkv = new MMKV({ id: 'turfslot-app' });
export const mmkvStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string) => mmkv.delete(key),
};
```

---

## 16. Accessibility (a11y)

### 16.1 Requirements

| Requirement                        | Implementation                                    |
| :--------------------------------- | :------------------------------------------------ |
| Screen reader support              | `accessibilityLabel` on all interactive elements  |
| Touch target size                  | Minimum 44×44 dp (iOS) / 48×48 dp (Android)       |
| Color contrast                     | WCAG AA (4.5:1 for text, 3:1 for large text)      |
| Focus order                        | Logical tab order via `accessibilityOrder`         |
| Dynamic text                       | Support system font scaling (don't cap max size)   |
| Motion sensitivity                 | Respect `reduceMotion` preference                  |

### 16.2 Testing

```bash
# iOS: Enable VoiceOver in Simulator → Settings → Accessibility
# Android: Enable TalkBack in Emulator → Settings → Accessibility
# Automated: axe-react-native for static analysis
```

---

## 17. Internationalization (i18n)

### 17.1 Setup

```typescript
// Using expo-localization + i18next
// Default: Bangla (bn) and English (en)
// All user-facing strings must be in translation files, never hardcoded
```

### 17.2 Currency Formatting

```typescript
// src/lib/currency.ts
/**
 * Format amount as Bangladeshi Taka
 * Always use this helper — never concatenate ৳ manually
 */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}
```

---

## 18. CI/CD & Release Management

### 18.1 EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "http://192.168.1.x:5000/api" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://staging.turf.rumon.top/api" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://turf.rumon.top/api" },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "serviceAccountKeyPath": "./google-services.json" }
    }
  }
}
```

### 18.2 Release Flow

```
feature branch → PR → code review → merge to main
                                          │
                           ┌──────────────┼──────────────┐
                           ▼              ▼              ▼
                     eas build        eas build      eas build
                     --profile        --profile      --profile
                     development      preview        production
                           │              │              │
                           ▼              ▼              ▼
                     Dev client      Internal        App Store /
                     (simulator)     testers         Play Store
                                          │
                                          ▼
                                    OTA update
                                    (expo-updates)
```

### 18.3 OTA Updates

Use `expo-updates` for JavaScript-only changes. Native changes require a full build:

```typescript
// In app/_layout.tsx (production only)
import * as Updates from 'expo-updates';

useEffect(() => {
  if (!__DEV__) {
    Updates.checkForUpdateAsync().then(({ isAvailable }) => {
      if (isAvailable) Updates.fetchUpdateAsync().then(() => Updates.reloadAsync());
    });
  }
}, []);
```

---

## 19. Environment Configuration

### 19.1 Environment Variables

```bash
# .env.example
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
EXPO_PUBLIC_APP_ENV=development
```

### 19.2 Typed Environment Access

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  SENTRY_DSN: z.string().url().optional(),
  APP_ENV: z.enum(['development', 'preview', 'production']),
});

export const env = envSchema.parse({
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
});
```

---

## 20. Git Workflow & Code Review

### 20.1 Branch Naming

```
feature/MOB-123-turf-detail-screen
bugfix/MOB-456-booking-date-crash
hotfix/MOB-789-payment-amount-overflow
refactor/MOB-101-extract-slot-picker
```

### 20.2 Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(booking): add partial payment support
fix(auth): handle expired token on cold start
refactor(api): extract error normalizer into shared util
test(turf): add unit tests for TurfCard component
chore(deps): bump expo-router to v4.1.0
docs(readme): add setup instructions for local development
```

### 20.3 PR Checklist

Before merging, every PR must:

- [ ] Pass `npx tsc --noEmit` with zero errors
- [ ] Pass `npx jest --coverage` with no regressions
- [ ] Pass `npx eslint . --max-warnings=0`
- [ ] Include/update tests for changed behavior
- [ ] Update relevant documentation if API contracts changed
- [ ] Have at least one approval from a senior reviewer
- [ ] Not increase bundle size by more than 5% without justification

---

## 21. Troubleshooting & Gotchas

### 21.1 Common Issues

| Issue                                    | Solution                                                     |
| :--------------------------------------- | :----------------------------------------------------------- |
| Metro bundler cache stale                | `npx expo start --clear`                                     |
| Native module not found after install    | `npx expo prebuild --clean` then rebuild                     |
| Android emulator API timeout             | Use `10.0.2.2` instead of `localhost` for backend URL        |
| iOS simulator networking                 | Ensure App Transport Security allows HTTP in dev             |
| Reanimated "worklet" error               | Verify `react-native-reanimated/plugin` is in `babel.config` |
| MMKV crash on fresh install              | Ensure `react-native-mmkv` is in `expo.plugins` config      |
| Background fetch kills app state         | Always rehydrate from persisted stores, never rely on memory |

### 21.2 Backend-Specific Gotchas

| Issue                                          | Cause & Solution                                                |
| :--------------------------------------------- | :-------------------------------------------------------------- |
| Missing fields in API response                 | Backend `TABLE_CONFIG.columns` whitelist — field must be listed  |
| `amenities` comes as string instead of array   | Backend `jsonColumns` auto-parses, but verify mobile-side too   |
| 404 on `/api/license/*`                        | Expected — license endpoints only exist in desktop mode, skip   |
| Payment amounts don't match                    | `paid_amount` is cumulative; sum `payment_history` to verify    |
| CORS error on physical device                  | Add device IP/hostname to backend CORS allowlist in `app.js`    |

### 21.3 Development Commands Quick Reference

```bash
# Start the development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Generate native projects (if needed)
npx expo prebuild

# Install a new Expo-compatible package
npx expo install <package-name>

# Check for dependency issues
npx expo-doctor

# Build for internal testing
eas build --profile preview --platform all

# Submit to stores
eas submit --platform all
```

---

## Appendix: Quick Decision Matrix

> When in doubt about a pattern, use this matrix:

| Decision                          | Answer                                              |
| :-------------------------------- | :-------------------------------------------------- |
| Where does this data come from?   | Server → React Query. Local → Zustand.              |
| Should I make a new component?    | If used ≥2 places or > 80 lines, extract it.        |
| Where do I put a utility function?| Zero React deps → `lib/`. Needs hooks → `hooks/`.   |
| Should I use `any`?               | **Never.** Use `unknown` + type guard if unsure.     |
| Should I add an `index.ts`?       | Yes, if the directory has ≥3 public exports.         |
| When do I write a test?           | Always for: API modules, hooks, utilities. Optional for pure UI. |
| Inline style or Nativewind class? | Nativewind class. Inline only for truly dynamic values. |
| `FlatList` or `FlashList`?        | Always `FlashList` for production lists.             |
| `AsyncStorage` or `MMKV`?        | Always MMKV. AsyncStorage is banned.                 |
| `fetch` or `axios`?              | Always `axios` through `apiClient`.                  |
