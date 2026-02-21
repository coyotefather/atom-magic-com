'use client';

import { useState, useEffect, useRef } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import rough from 'roughjs';
import { MAP_CONFIG, MAP_CAPITALS, REGION_BOUNDARIES, MAP_REGIONS } from '@/lib/map-data';

function toSvgX(lng: number): number { return lng * 32; }
function toSvgY(lat: number): number { return -lat * 32; }

function ringCentroid(ring: number[][]): [number, number] {
	let minLng = Infinity, maxLng = -Infinity;
	let minLat = Infinity, maxLat = -Infinity;
	for (const [lng, lat] of ring) {
		if (lng < minLng) minLng = lng;
		if (lng > maxLng) maxLng = lng;
		if (lat < minLat) minLat = lat;
		if (lat > maxLat) maxLat = lat;
	}
	return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

const DEAD_LAND_IDS = new Set(
	MAP_REGIONS
		.filter((r) => r.name.includes('Terrae Mortuae'))
		.map((r) => r.id)
);

const PENCIL_STYLE = {
	stroke: '#8A7A6A',
	strokeWidth: 1.0,
	roughness: 1.2,
	fill: 'none',
} as const;

interface AnnotationLayerProps {
	visible: boolean;
}

const AnnotationLayer = ({ visible }: AnnotationLayerProps) => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);
	const svgRef = useRef<SVGSVGElement>(null);
	const gRef = useRef<SVGGElement>(null);

	useEffect(() => {
		if (!map.getPane('annotationPane')) {
			map.createPane('annotationPane');
		}
		map.getPane('annotationPane')!.style.zIndex = '445';
		setPaneReady(true);
	}, [map]);

	useEffect(() => {
		if (!paneReady || !visible || !gRef.current || !svgRef.current) return;

		const g = gRef.current;
		while (g.firstChild) g.removeChild(g.firstChild);

		const rc = rough.svg(svgRef.current);

		// Route line through all capitals in order
		const capitalPoints: [number, number][] = MAP_CAPITALS.map((c) => [
			toSvgX(c.lng),
			toSvgY(c.lat),
		]);
		if (capitalPoints.length >= 2) {
			g.appendChild(rc.linearPath(capitalPoints, {
				...PENCIL_STYLE,
				strokeLineDash: [6, 4],
			}));
		}

		// Warning circles near Terrae Mortuae region centroids
		for (const feature of REGION_BOUNDARIES.features) {
			if (!DEAD_LAND_IDS.has(feature.properties?.regionId as string)) continue;
			const geom = feature.geometry;
			let ring: number[][] | null = null;
			if (geom.type === 'Polygon') {
				ring = geom.coordinates[0] as number[][];
			} else if (geom.type === 'MultiPolygon') {
				ring = (geom.coordinates as number[][][][])[0][0];
			}
			if (!ring) continue;
			const [cLng, cLat] = ringCentroid(ring);
			g.appendChild(rc.circle(toSvgX(cLng), toSvgY(cLat), 30, {
				...PENCIL_STYLE,
				roughness: 1.5,
			}));
		}
	}, [paneReady, visible]);

	if (!paneReady || !visible) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="annotationPane" interactive={false}>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`}
				preserveAspectRatio="none"
			>
				<g ref={gRef} />
				<text
					x={1350}
					y={200}
					fontStyle="italic"
					fill="#8A7A6A"
					opacity={0.5}
					fontSize={10}
					fontFamily="Georgia, serif"
				>
					Unexplored?
				</text>
			</svg>
		</SVGOverlay>
	);
};

export default AnnotationLayer;
