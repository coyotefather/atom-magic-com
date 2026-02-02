# PWA Offline Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add service worker-based offline caching so users can access Codex content and tools during game sessions without reliable internet.

**Architecture:** Serwist (next-pwa successor) generates a service worker at build time. An OfflineContext provides offline status to components. Stale-while-revalidate caching for pages, cache-first for static assets. Network-dependent features show contextual offline messages.

**Tech Stack:** @serwist/next, serwist, React Context API, Next.js 16 App Router

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install serwist packages**

Run:
```bash
npm install @serwist/next serwist
```

**Step 2: Verify installation**

Run:
```bash
npm ls @serwist/next serwist
```
Expected: Both packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(pwa): install serwist dependencies"
```

---

## Task 2: Create Service Worker Entry Point

**Files:**
- Create: `src/app/sw.ts`

**Step 1: Create the service worker file**

Create `src/app/sw.ts`:

```typescript
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

**Step 2: Commit**

```bash
git add src/app/sw.ts
git commit -m "feat(pwa): add service worker entry point"
```

---

## Task 3: Configure Next.js for Serwist

**Files:**
- Modify: `next.config.mjs`
- Modify: `tsconfig.json`

**Step 1: Update next.config.mjs**

Replace the entire file with:

```javascript
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
```

**Step 2: Update tsconfig.json**

Add to the `compilerOptions.lib` array (create if doesn't exist):

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"]
  }
}
```

Also add to `compilerOptions.types` (create if doesn't exist):

```json
{
  "compilerOptions": {
    "types": ["@serwist/next/typings"]
  }
}
```

**Step 3: Add sw.js to .gitignore**

Append to `.gitignore`:

```
# PWA
public/sw.js
public/sw.js.map
public/swe-worker-*.js
public/swe-worker-*.js.map
public/workbox-*.js
public/workbox-*.js.map
```

**Step 4: Commit**

```bash
git add next.config.mjs tsconfig.json .gitignore
git commit -m "feat(pwa): configure serwist in next.config"
```

---

## Task 4: Create Offline Context

**Files:**
- Create: `src/lib/OfflineContext.tsx`

**Step 1: Create the context file**

Create `src/lib/OfflineContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OfflineContextType {
  isOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add src/lib/OfflineContext.tsx
git commit -m "feat(pwa): add OfflineContext for offline detection"
```

---

## Task 5: Add OfflineProvider to Layout

**Files:**
- Modify: `src/app/(website)/layout.tsx`

**Step 1: Import and wrap with OfflineProvider**

Add import at top:

```typescript
import { OfflineProvider } from "@/lib/OfflineContext";
```

Wrap the children in the layout (inside ThemeProvider):

```tsx
<ThemeProvider>
  <OfflineProvider>
    <RollProvider>
      {/* ... rest of the layout ... */}
    </RollProvider>
  </OfflineProvider>
</ThemeProvider>
```

**Step 2: Commit**

```bash
git add src/app/(website)/layout.tsx
git commit -m "feat(pwa): add OfflineProvider to layout"
```

---

## Task 6: Create Offline Fallback Page

**Files:**
- Create: `src/app/(website)/offline/page.tsx`

**Step 1: Create the offline page**

Create `src/app/(website)/offline/page.tsx`:

```tsx
import PageHero from '@/app/components/common/PageHero';
import LinkButton from '@/app/components/common/LinkButton';
import { mdiWifiOff } from '@mdi/js';

export const metadata = {
  title: 'Offline | Atom Magic',
  description: 'This page is not available offline.',
};

const OfflinePage = () => {
  return (
    <main className="notoserif bg-parchment dark:bg-darkbg min-h-screen">
      <PageHero
        title="You're Offline"
        description="This page isn't available offline."
        icon={mdiWifiOff}
        accentColor="stone"
      />

      <section className="py-12 md:py-16 px-6 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-charcoal dark:text-parchment leading-relaxed mb-8">
            The page you're trying to access hasn't been cached for offline use.
            You can access pages you've previously visited, or reconnect to the
            internet to continue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/" variant="primary">
              Go to Home
            </LinkButton>
            <LinkButton href="/character" variant="secondary">
              Character Manager
            </LinkButton>
            <LinkButton href="/tools" variant="secondary">
              Tools
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OfflinePage;
```

**Step 2: Commit**

```bash
git add src/app/(website)/offline/page.tsx
git commit -m "feat(pwa): add offline fallback page"
```

---

## Task 7: Add Offline Message to Search Component

**Files:**
- Modify: `src/app/components/global/search/Search.tsx`

**Step 1: Update Search component with offline handling**

Replace the entire file:

```tsx
'use client';

import { Hits, Stats } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import Hit from '@/app/components/global/search/Hit';
import CustomSearchBox from '@/app/components/global/search/CustomSearchBox';
import CustomPagination from '@/app/components/global/search/CustomPagination';
import CustomHitsPerPage from '@/app/components/global/search/CustomHitsPerPage';
import { createCachedSearchClient } from '@/app/components/global/search/cachedSearchClient';
import { useOffline } from '@/lib/OfflineContext';
import Icon from '@mdi/react';
import { mdiWifiOff } from '@mdi/js';

const searchClient = createCachedSearchClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export function Search() {
  const { isOffline } = useOffline();

  if (isOffline) {
    return (
      <div className="text-center py-12">
        <Icon path={mdiWifiOff} size={2} className="mx-auto mb-4 text-stone" />
        <h2 className="marcellus text-xl mb-2 text-charcoal dark:text-parchment">
          Search Unavailable Offline
        </h2>
        <p className="text-stone dark:text-stone/80">
          Search requires an internet connection. You can still browse cached
          Codex pages.
        </p>
      </div>
    );
  }

  return (
    <InstantSearchNext
      indexName="entries"
      future={{ preserveSharedStateOnUnmount: false }}
      searchClient={searchClient}
      routing={{
        router: {
          cleanUrlOnDispose: false,
          windowTitle(routeState) {
            const indexState = routeState.indexName || {};
            return indexState.query
              ? `Atom Magic Codex - Results for: ${indexState.query}`
              : 'Atom Magic Codex - Results page';
          },
        },
      }}
    >
      <div className="space-y-6">
        {/* Search bar and controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-grow w-full sm:w-auto">
            <CustomSearchBox />
          </div>
          <CustomHitsPerPage
            items={[
              { label: '10 per page', value: 10, default: true },
              { label: '25 per page', value: 25 },
              { label: '50 per page', value: 50 },
            ]}
          />
        </div>

        {/* Stats */}
        <div className="text-sm text-stone">
          <Stats
            translations={{
              rootElementText({ nbHits, processingTimeMS }) {
                return `${nbHits.toLocaleString()} ${nbHits === 1 ? 'result' : 'results'} found in ${processingTimeMS}ms`;
              },
            }}
          />
        </div>

        {/* Results grid */}
        <Hits
          hitComponent={Hit}
          classNames={{
            list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
            item: '',
          }}
        />

        {/* Pagination */}
        <div className="flex justify-center pt-4">
          <CustomPagination />
        </div>
      </div>
    </InstantSearchNext>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/components/global/search/Search.tsx
git commit -m "feat(pwa): add offline message to search component"
```

---

## Task 8: Add Offline Handling to Vorago GameSetup

**Files:**
- Modify: `src/app/components/vorago/GameSetup.tsx`

**Step 1: Update GameSetup with offline handling for AI**

Add import at top:

```typescript
import { useOffline } from '@/lib/OfflineContext';
import { mdiWifiOff } from '@mdi/js';
```

Add inside the component, before the return:

```typescript
const { isOffline } = useOffline();
```

Update the AI Difficulty section (around line 96-123) to:

```tsx
{/* AI Difficulty (only show if vs AI) */}
{vsAI && (
  <div>
    <label className="block mb-2 text-sm uppercase tracking-wider text-stone">
      AI Difficulty
    </label>
    {isOffline ? (
      <div className="flex items-center gap-2 py-3 px-4 border-2 border-stone bg-parchment">
        <Icon path={mdiWifiOff} size={0.8} className="text-stone" />
        <span className="text-stone text-sm">
          AI opponent requires internet connection
        </span>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-3 gap-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setAIDifficulty(level)}
              className={`py-3 px-4 border-2 transition-all capitalize marcellus ${
                aiDifficulty === level
                  ? 'bg-laurel text-white border-laurel'
                  : 'bg-white text-black border-stone hover:border-laurel'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-sm text-stone mt-2">
          {aiDifficulty === 'easy' && 'AI makes basic moves'}
          {aiDifficulty === 'medium' && 'AI uses simple strategy'}
          {aiDifficulty === 'hard' && 'AI plays competitively'}
        </p>
      </>
    )}
  </div>
)}
```

Also update the Start Button to disable when offline and AI is selected:

```tsx
{/* Start Button */}
<button
  onClick={handleStartGame}
  disabled={vsAI && isOffline}
  className={`w-full py-4 px-6 border-2 marcellus text-xl transition-colors ${
    vsAI && isOffline
      ? 'bg-stone/50 text-white border-stone cursor-not-allowed'
      : 'bg-laurel text-white border-laurel hover:bg-laurel-dark'
  }`}
>
  {vsAI && isOffline ? 'AI Requires Internet' : 'Start Game'}
</button>
```

**Step 2: Commit**

```bash
git add src/app/components/vorago/GameSetup.tsx
git commit -m "feat(pwa): add offline handling to vorago game setup"
```

---

## Task 9: Add Offline Handling to Contact Form

**Files:**
- Modify: `src/app/components/contact/ContactForm.tsx`

**Step 1: Update ContactForm with offline handling**

Add import at top:

```typescript
import { useOffline } from '@/lib/OfflineContext';
import { mdiWifiOff } from '@mdi/js';
```

Add inside the component, after the useState hooks:

```typescript
const { isOffline } = useOffline();
```

Add an offline message before the form (after line ~34, before the form element). Find the `<form` tag and add this before it:

```tsx
{isOffline && (
  <div className="mb-6 flex items-center gap-3 py-4 px-4 border-2 border-stone bg-parchment dark:bg-charcoal/20">
    <Icon path={mdiWifiOff} size={1} className="text-stone flex-shrink-0" />
    <p className="text-stone dark:text-stone/80 text-sm">
      Contact form requires an internet connection. Please reconnect to send your message.
    </p>
  </div>
)}
```

Update the submit button to disable when offline. Find the submit button (around line 239) and update:

```tsx
<button
  type="submit"
  disabled={status.type === 'loading' || isOffline}
  className={`w-full py-4 px-6 marcellus text-lg flex items-center justify-center gap-2 transition-colors ${
    status.type === 'loading' || isOffline
      ? 'bg-stone/50 text-white cursor-not-allowed'
      : 'bg-gold text-black hover:bg-brightgold'
  }`}
>
  {status.type === 'loading' ? (
    'Sending...'
  ) : isOffline ? (
    <>
      <Icon path={mdiWifiOff} size={0.9} />
      Offline
    </>
  ) : (
    <>
      <Icon path={mdiSend} size={0.9} />
      Send Message
    </>
  )}
</button>
```

**Step 2: Commit**

```bash
git add src/app/components/contact/ContactForm.tsx
git commit -m "feat(pwa): add offline handling to contact form"
```

---

## Task 10: Build and Test

**Step 1: Run production build**

Run:
```bash
npm run build
```

Expected: Build completes successfully, generates `public/sw.js`

**Step 2: Verify service worker was generated**

Run:
```bash
ls -la public/sw.js
```

Expected: File exists

**Step 3: Test locally with production build**

Run:
```bash
npm run start
```

Then in Chrome:
1. Open http://localhost:3000
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Check "Offline" checkbox
5. Navigate to various pages - cached pages should load, uncached should show offline page
6. Verify Search shows offline message
7. Verify Vorago setup shows AI offline message
8. Verify Contact form shows offline state

**Step 4: Commit any fixes if needed**

---

## Task 11: Final Commit and Cleanup

**Step 1: Update ROADMAP.md**

Mark PWA support as complete:

```markdown
- [x] **PWA support** - Offline access to Codex entries would be valuable for sessions without reliable internet
```

**Step 2: Final commit**

```bash
git add ROADMAP.md
git commit -m "feat(pwa): mark PWA support complete in roadmap"
```

---

## Testing Checklist

Manual testing in production build:

- [ ] Service worker registers on first visit
- [ ] Static assets cached (CSS, JS, fonts)
- [ ] Visited pages available offline
- [ ] Offline fallback page shows for uncached pages
- [ ] Search shows "unavailable offline" message
- [ ] Vorago AI difficulty disabled when offline
- [ ] Vorago "vs Human" still works offline
- [ ] Contact form disabled when offline
- [ ] Character Manager works offline (uses localStorage)
- [ ] Dice roller works offline
- [ ] Quick reference works offline
- [ ] Going back online restores functionality
