import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from 'serwist';
import { Serwist, NetworkOnly } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Custom runtime caching that excludes Sanity Studio and API
const runtimeCaching: RuntimeCaching[] = [
  // Exclude Sanity API calls - always go to network
  {
    matcher: ({ url }) => url.hostname.endsWith('.sanity.io'),
    handler: new NetworkOnly(),
  },
  // Exclude /studio routes - always go to network
  {
    matcher: ({ url }) => url.pathname.startsWith('/studio'),
    handler: new NetworkOnly(),
  },
  // Use default caching for everything else
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          // Don't show offline fallback for studio routes
          const url = new URL(request.url);
          if (url.pathname.startsWith('/studio')) {
            return false;
          }
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
