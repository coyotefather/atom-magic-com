/**
 * GridLayer.tsx
 *
 * Draws a faint cartographic grid over the entire map (land and ocean alike),
 * mimicking the latitude/longitude graticule lines found on historical maps.
 * The grid is rendered as a repeating SVG pattern of 48×48 SVG-pixel cells
 * with very low-opacity lines (6% black), so it is visible but unobtrusive.
 *
 * The 48 SVG-pixel cell size corresponds to 1.5 GeoJSON degrees given the
 * coordinate scale factor of 32 px/degree used throughout the map.
 *
 * Rendering technique: Leaflet SVGOverlay inside a custom pane ("gridPane",
 * z-index 160). A single <rect> covers the full canvas and references an SVG
 * <pattern> defined in <defs>. No external data is needed — the grid is purely
 * geometric.
 *
 * Used by:
 *   - SolumMap.tsx (rendered inside the Leaflet MapContainer)
 */
'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';

/** Faint cartographic grid over the entire map (land + ocean). */
const GridLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('gridPane')) {
			map.createPane('gridPane');
		}
		map.getPane('gridPane')!.style.zIndex = '160';
		setPaneReady(true);
	}, [map]);

	if (!paneReady) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="gridPane" interactive={false}>
			<svg
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<defs>
					<pattern
						id="map-grid"
						width={48}
						height={48}
						patternUnits="userSpaceOnUse"
					>
						<line x1={0} y1={0} x2={0} y2={48} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
						<line x1={0} y1={0} x2={48} y2={0} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
					</pattern>
				</defs>
				<rect
					width={MAP_CONFIG.SVG_WIDTH}
					height={MAP_CONFIG.SVG_HEIGHT}
					fill="url(#map-grid)"
				/>
			</svg>
		</SVGOverlay>
	);
};

export default GridLayer;
