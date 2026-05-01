'use client';

/**
 * OfflineContext.tsx
 *
 * React Context that tracks whether the browser currently has an internet
 * connection, making that state available to any component in the app.
 *
 * Why is this needed?
 *   Some features of the app (like the Vorago AI opponent, Algolia search,
 *   and Payload CMS data fetching) require a network connection. When the
 *   user goes offline, these features will silently fail without this context.
 *   With it, components can show an appropriate message or disable network-
 *   dependent actions before they fail.
 *
 * How it works:
 *   - On mount, reads `navigator.onLine` for the initial connection state.
 *   - Listens to the browser's `'online'` and `'offline'` window events, which
 *     fire when the connection status changes.
 *   - The context value (`isOffline`) is updated in real time as the connection
 *     changes, so any subscribed component re-renders automatically.
 *
 * Note on `navigator.onLine` accuracy:
 *   `navigator.onLine` returns `false` when definitively offline, but `true`
 *   when connected to SOME network — not necessarily the internet. It can show
 *   `true` while on a network with no internet access (e.g., a router without
 *   upstream connectivity). For most use cases this is "good enough" — we use
 *   it to prevent obvious offline errors, not as a guaranteed internet check.
 *
 * OfflineProvider is mounted in the root layout (src/app/layout.tsx).
 *
 * Consumed by:
 *   - src/app/components/vorago/* (disable AI moves when offline)
 *   - src/app/components/common/OfflineBanner.tsx (optional banner component)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OfflineContextType {
  /** True when the browser reports no network connection. False when online. */
  isOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

/**
 * Mount at the root layout level. Subscribes to the browser's online/offline
 * events and makes the current connection state available via `useOffline()`.
 */
export function OfflineProvider({ children }: { children: ReactNode }) {
  /**
   * Starts as `false` (online) rather than reading `navigator.onLine`
   * immediately, to avoid SSR/hydration mismatches — `navigator` is not
   * available on the server. The useEffect below sets the correct initial
   * value once the component mounts in the browser.
   */
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set the correct initial state now that we're in the browser
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // These events fire when the browser's connection state changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Remove listeners when the component unmounts (e.g., on page navigation)
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

/**
 * Hook to read the current offline/online state.
 *
 * Must be called from a component that is a descendant of `<OfflineProvider>`.
 * Throws an error if used outside the provider to prevent silent failures.
 *
 * @example
 *   const { isOffline } = useOffline();
 *   if (isOffline) return <p>You are offline</p>;
 */
export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
