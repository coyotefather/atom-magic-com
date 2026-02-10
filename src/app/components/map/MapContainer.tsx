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
