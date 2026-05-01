/**
 * MapContainer.tsx
 *
 * Thin client-side wrapper that lazy-loads SolumMap via Next.js dynamic import
 * with SSR disabled. Leaflet manipulates the DOM directly and assumes a browser
 * environment, so it cannot run during server-side rendering. The `ssr: false`
 * option in next/dynamic prevents the import from running on the server.
 *
 * While the map chunk is loading, a simple parchment-coloured placeholder div
 * is displayed to prevent layout shift.
 *
 * This wrapper also satisfies the requirement that pages using
 * `export const metadata` (a server-only export) cannot themselves be
 * 'use client' components. The map page stays a server component, and this
 * wrapper is the client boundary.
 *
 * Used by:
 *   - src/app/(website)/map/page.tsx
 */
'use client';

import dynamic from 'next/dynamic';

const SolumMap = dynamic(() => import('./SolumMap'), {
	ssr: false,
	loading: () => (
		<div
			className="w-full bg-parchment border-2 border-stone flex items-center justify-center"
			style={{ minHeight: '400px' }}
		>
			<p className="text-stone-dark marcellus">Loading map...</p>
		</div>
	),
});

const MapClientContainer = () => {
	return <SolumMap />;
};

export default MapClientContainer;
