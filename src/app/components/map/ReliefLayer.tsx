'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';

const ReliefLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('reliefPane')) {
			map.createPane('reliefPane');
			const pane = map.getPane('reliefPane')!;
			pane.style.zIndex = '250';
			// Force all relief icons to pure black ink regardless of original color
			pane.style.filter = 'brightness(0)';
			pane.style.opacity = '0.8';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || RELIEF_PLACEMENTS.length === 0) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	// Symbol content is build-time SVG path data from Azgaar export (trusted static data)
	return (
		<SVGOverlay bounds={bounds} pane="reliefPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				<defs>
					{RELIEF_SYMBOLS.map((sym) => (
						<symbol key={sym.id} id={sym.id} viewBox={sym.viewBox}>
							{/* eslint-disable-next-line react/no-danger -- trusted build-time SVG data */}
							<g dangerouslySetInnerHTML={{ __html: sym.content }} />
						</symbol>
					))}
				</defs>
				{RELIEF_PLACEMENTS.map((p, i) => (
					<use
						key={i}
						x={p.x}
						y={p.y}
						width={p.w}
						height={p.h}
						href={`#${p.href}`}
					/>
				))}
			</svg>
		</SVGOverlay>
	);
};

export default ReliefLayer;
