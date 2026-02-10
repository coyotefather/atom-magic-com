'use client';

import { useEffect, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CAPITALS } from '@/lib/map-data';

const MIN_ZOOM = 3;

function makeIcon(name: string) {
	return L.divIcon({
		className: 'solum-capital-marker',
		html: `<span class="solum-capital-dot"></span><span class="solum-capital-label">${name}</span>`,
		iconSize: [0, 0],
		iconAnchor: [4, 4],
	});
}

const CapitalMarkers = () => {
	const map = useMap();
	const [visible, setVisible] = useState(map.getZoom() >= MIN_ZOOM);

	useMapEvents({
		zoomend: () => setVisible(map.getZoom() >= MIN_ZOOM),
	});

	// Also check on mount in case initial zoom qualifies
	useEffect(() => {
		setVisible(map.getZoom() >= MIN_ZOOM);
	}, [map]);

	if (!visible || MAP_CAPITALS.length === 0) return null;

	return (
		<>
			{MAP_CAPITALS.map((capital) => (
				<Marker
					key={capital.id}
					position={[capital.lat, capital.lng]}
					icon={makeIcon(capital.name)}
					interactive={false}
				/>
			))}
		</>
	);
};

export default CapitalMarkers;
