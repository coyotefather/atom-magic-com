'use client';

import { useState, useEffect } from 'react';
import { SVGOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '@/lib/map-data';
import { RELIEF_SYMBOLS, RELIEF_PLACEMENTS } from '@/lib/relief-data';
import { TERRAIN_CLUSTERS } from '@/lib/cluster-placements';
import { computeClearanceZones, type LabelBBox } from '@/lib/label-config';

// ---------------------------------------------------------------------------
// Tolkien-style SVG symbol content for INDIVIDUAL (non-clustered) icons.
// Each type has multiple variants for organic feel. Symbols use viewBox 0 0 30 30.
// All content is black ink — grass tufts, dunes, swamp reeds, etc.
// Stroke weights kept light (0.4–1.2) for delicate pen-drawn appearance.
// ---------------------------------------------------------------------------

const TOLKIEN_VIEWBOX = '0 0 30 30';

const TOLKIEN_CONTENT: Record<string, string[]> = {
	// Grass — small curved strokes
	grass: [
		'<path d="M10,28 Q11,20 14,16" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,28 Q15,18 15,12" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M20,28 Q19,20 16,16" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/>',
		'<path d="M11,28 Q12,21 15,17" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M17,28 Q16,19 14,13" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M22,28 Q20,21 17,17" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
	],
	// Dunes — wavy mound shapes
	dune: [
		'<path d="M1,24 Q8,12 16,24 Q22,12 29,24" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
		'<path d="M2,22 Q10,10 18,22 Q24,14 28,22" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Swamp — vertical reeds with wavy water line
	swamp: [
		'<line x1="8" y1="24" x2="7" y2="8" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="15" y1="24" x2="15" y2="5" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="22" y1="24" x2="23" y2="10" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M2,22 Q8,19 15,22 Q22,25 28,22" fill="none" stroke="black" stroke-width="0.5"/>',
		'<line x1="10" y1="24" x2="9" y2="7" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="17" y1="24" x2="17" y2="4" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="24" y1="24" x2="25" y2="9" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M3,22 Q10,19 17,22 Q24,25 29,22" fill="none" stroke="black" stroke-width="0.5"/>',
		'<line x1="6" y1="24" x2="5" y2="9" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="13" y1="24" x2="13" y2="6" stroke="black" stroke-width="0.6" stroke-linecap="round"/><line x1="20" y1="24" x2="21" y2="8" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M1,22 Q7,19 13,22 Q19,25 27,22" fill="none" stroke="black" stroke-width="0.5"/>',
	],
	// Vulcan — flat-topped mountain with crater
	vulcan: [
		'<path d="M3,28 L10,6 L13,10 L17,10 L20,6 L27,28" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="18" y1="12" x2="23" y2="22" stroke="black" stroke-width="0.4"/><line x1="19" y1="16" x2="25" y2="26" stroke="black" stroke-width="0.35"/>',
	],
	// Cactus — saguaro-style
	cactus: [
		'<line x1="15" y1="28" x2="15" y2="4" stroke="black" stroke-width="1.2" stroke-linecap="round"/><path d="M15,14 Q8,14 8,8" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M15,18 Q22,18 22,12" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="5" stroke="black" stroke-width="1.2" stroke-linecap="round"/><path d="M15,16 Q7,16 7,10" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><path d="M15,12 Q23,12 23,6" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="15" y2="6" stroke="black" stroke-width="1.1" stroke-linecap="round"/><path d="M15,15 Q9,15 9,9" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M15,20 Q21,20 21,14" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Dead tree — bare branching trunk
	deadTree: [
		'<line x1="15" y1="28" x2="15" y2="8" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M15,12 L8,4" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,10 L22,3" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M15,16 L6,12" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M15,14 L24,10" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/>',
		'<line x1="15" y1="28" x2="14" y2="7" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M14,11 L7,3" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M14,9 L21,2" fill="none" stroke="black" stroke-width="0.7" stroke-linecap="round"/><path d="M14,15 L5,11" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M14,13 L23,8" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/>',
	],
};

// ---------------------------------------------------------------------------
// Cluster SVG artwork — Tolkien-style composed scenes for dense terrain.
// Each cluster uses viewBox 0 0 100 60 and contains multiple icons arranged
// as a natural grouping (mountain range, forest clump, etc.).
// ---------------------------------------------------------------------------

const CLUSTER_VIEWBOX = '0 0 100 60';

// Cluster scenes use front/back row arrangement: smaller elements higher on page
// (suggesting distance) and larger elements lower (suggesting foreground).
// This breaks up the flat "horizontal row" look at all zoom levels.
const CLUSTER_SVGS: Record<string, string[]> = {
	// Mountain ranges — back peaks (smaller, higher) + front peaks (larger, lower)
	mount: [
		// Variant 0: 2 back + 2 front
		'<path d="M22,42 L32,18 L42,42" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="33" y1="22" x2="38" y2="36" stroke="black" stroke-width="0.35"/><line x1="34" y1="28" x2="40" y2="40" stroke="black" stroke-width="0.3"/><path d="M58,44 L70,20 L82,44" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="71" y1="24" x2="76" y2="38" stroke="black" stroke-width="0.35"/><path d="M2,58 L22,10 L40,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="23" y1="16" x2="30" y2="38" stroke="black" stroke-width="0.5"/><line x1="24" y1="24" x2="32" y2="46" stroke="black" stroke-width="0.4"/><line x1="25" y1="32" x2="34" y2="52" stroke="black" stroke-width="0.35"/><path d="M50,58 L68,8 L86,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="69" y1="14" x2="76" y2="36" stroke="black" stroke-width="0.5"/><line x1="70" y1="22" x2="78" y2="44" stroke="black" stroke-width="0.45"/><line x1="71" y1="30" x2="80" y2="52" stroke="black" stroke-width="0.35"/>',
		// Variant 1: 3 peaks (1 back, 2 front), asymmetric heights
		'<path d="M36,40 L48,16 L60,40" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="49" y1="20" x2="55" y2="34" stroke="black" stroke-width="0.35"/><line x1="50" y1="26" x2="56" y2="38" stroke="black" stroke-width="0.3"/><path d="M4,58 L24,12 L44,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="25" y1="18" x2="32" y2="40" stroke="black" stroke-width="0.5"/><line x1="26" y1="26" x2="34" y2="48" stroke="black" stroke-width="0.4"/><line x1="27" y1="34" x2="36" y2="54" stroke="black" stroke-width="0.35"/><path d="M52,58 L72,6 L90,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="73" y1="12" x2="80" y2="34" stroke="black" stroke-width="0.5"/><line x1="74" y1="20" x2="82" y2="44" stroke="black" stroke-width="0.45"/><line x1="75" y1="28" x2="84" y2="52" stroke="black" stroke-width="0.35"/>',
		// Variant 2: 3 back peaks + 1 prominent front peak
		'<path d="M6,44 L14,26 L22,44" fill="none" stroke="black" stroke-width="0.8" stroke-linejoin="round"/><line x1="15" y1="30" x2="20" y2="40" stroke="black" stroke-width="0.3"/><path d="M30,42 L40,22 L50,42" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="41" y1="26" x2="46" y2="36" stroke="black" stroke-width="0.35"/><path d="M62,46 L74,24 L86,46" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="75" y1="28" x2="80" y2="40" stroke="black" stroke-width="0.35"/><path d="M24,58 L46,4 L68,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="47" y1="10" x2="56" y2="34" stroke="black" stroke-width="0.5"/><line x1="48" y1="18" x2="58" y2="44" stroke="black" stroke-width="0.45"/><line x1="49" y1="26" x2="60" y2="52" stroke="black" stroke-width="0.35"/>',
	],
	// Snow-capped ranges — same front/back layout, snow-cap lines instead of hatching
	mountSnow: [
		// Variant 0: 2 back + 2 front with snow lines
		'<path d="M24,42 L34,18 L44,42" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="26" y1="32" x2="42" y2="32" stroke="black" stroke-width="0.45"/><path d="M60,44 L72,20 L84,44" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="62" y1="34" x2="82" y2="34" stroke="black" stroke-width="0.45"/><path d="M2,58 L22,10 L40,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="8" y1="30" x2="36" y2="30" stroke="black" stroke-width="0.5"/><line x1="23" y1="24" x2="32" y2="44" stroke="black" stroke-width="0.4"/><path d="M48,58 L66,8 L84,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="54" y1="28" x2="78" y2="28" stroke="black" stroke-width="0.5"/><line x1="67" y1="22" x2="76" y2="44" stroke="black" stroke-width="0.4"/>',
		// Variant 1: 1 back + 2 front with snow lines
		'<path d="M38,40 L50,16 L62,40" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="40" y1="30" x2="60" y2="30" stroke="black" stroke-width="0.45"/><path d="M2,58 L22,12 L40,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="7" y1="32" x2="36" y2="32" stroke="black" stroke-width="0.5"/><path d="M52,58 L70,8 L88,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="57" y1="28" x2="84" y2="28" stroke="black" stroke-width="0.5"/><line x1="71" y1="20" x2="80" y2="44" stroke="black" stroke-width="0.4"/>',
	],
	// Rolling hills — back humps (smaller, higher) + front humps (larger, lower)
	hill: [
		// Variant 0: 2 back + 2 front
		'<path d="M10,46 Q25,28 40,46" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><line x1="27" y1="34" x2="34" y2="43" stroke="black" stroke-width="0.3"/><path d="M54,44 Q70,26 86,44" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><line x1="72" y1="32" x2="78" y2="41" stroke="black" stroke-width="0.3"/><path d="M0,58 Q20,34 38,58" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="22" y1="42" x2="30" y2="54" stroke="black" stroke-width="0.4"/><line x1="24" y1="46" x2="32" y2="56" stroke="black" stroke-width="0.35"/><path d="M44,58 Q64,30 82,58" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="66" y1="40" x2="74" y2="54" stroke="black" stroke-width="0.4"/><line x1="68" y1="46" x2="76" y2="56" stroke="black" stroke-width="0.35"/>',
		// Variant 1: 2 back + 3 front
		'<path d="M16,44 Q30,28 44,44" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M52,44 Q66,30 80,44" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M0,58 Q16,36 30,58" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="18" y1="44" x2="26" y2="54" stroke="black" stroke-width="0.35"/><path d="M30,58 Q50,30 68,58" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="52" y1="40" x2="60" y2="54" stroke="black" stroke-width="0.4"/><line x1="54" y1="46" x2="62" y2="56" stroke="black" stroke-width="0.35"/><path d="M68,58 Q84,38 98,58" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="86" y1="44" x2="92" y2="54" stroke="black" stroke-width="0.35"/>',
	],
	// Conifer forest — back row (smaller trees, higher) + front row (larger, lower)
	conifer: [
		// Variant 0: 4 back + 3 front
		'<path d="M8,40 L14,20 L20,40" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="14" y1="40" x2="14" y2="46" stroke="black" stroke-width="0.7"/><path d="M30,38 L37,16 L44,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="37" y1="38" x2="37" y2="44" stroke="black" stroke-width="0.7"/><path d="M56,40 L62,18 L68,40" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="62" y1="40" x2="62" y2="46" stroke="black" stroke-width="0.7"/><path d="M78,38 L84,18 L90,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="84" y1="38" x2="84" y2="44" stroke="black" stroke-width="0.7"/><path d="M4,56 L14,22 L24,56" fill="none" stroke="black" stroke-width="0.85" stroke-linejoin="round"/><line x1="14" y1="56" x2="14" y2="60" stroke="black" stroke-width="0.85"/><path d="M38,56 L50,18 L62,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><line x1="50" y1="56" x2="50" y2="60" stroke="black" stroke-width="0.9"/><path d="M74,56 L84,22 L94,56" fill="none" stroke="black" stroke-width="0.85" stroke-linejoin="round"/><line x1="84" y1="56" x2="84" y2="60" stroke="black" stroke-width="0.85"/>',
		// Variant 1: 3 back + 4 front
		'<path d="M14,38 L20,18 L26,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="20" y1="38" x2="20" y2="44" stroke="black" stroke-width="0.7"/><path d="M42,36 L49,16 L56,36" fill="none" stroke="black" stroke-width="0.75" stroke-linejoin="round"/><line x1="49" y1="36" x2="49" y2="42" stroke="black" stroke-width="0.7"/><path d="M70,38 L76,20 L82,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="76" y1="38" x2="76" y2="44" stroke="black" stroke-width="0.7"/><path d="M0,56 L10,24 L20,56" fill="none" stroke="black" stroke-width="0.8" stroke-linejoin="round"/><path d="M24,56 L35,20 L46,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><path d="M52,56 L63,18 L74,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><path d="M80,56 L90,22 L100,56" fill="none" stroke="black" stroke-width="0.8" stroke-linejoin="round"/>',
	],
	// Snow conifers — same front/back layout
	coniferSnow: [
		'<path d="M10,40 L16,22 L22,40" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="16" y1="40" x2="16" y2="46" stroke="black" stroke-width="0.7"/><path d="M32,38 L39,18 L46,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="39" y1="38" x2="39" y2="44" stroke="black" stroke-width="0.7"/><path d="M60,40 L66,20 L72,40" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="66" y1="40" x2="66" y2="46" stroke="black" stroke-width="0.7"/><path d="M82,38 L88,20 L94,38" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="88" y1="38" x2="88" y2="44" stroke="black" stroke-width="0.7"/><path d="M4,56 L14,24 L24,56" fill="none" stroke="black" stroke-width="0.85" stroke-linejoin="round"/><path d="M38,56 L50,20 L62,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><path d="M74,56 L84,24 L94,56" fill="none" stroke="black" stroke-width="0.85" stroke-linejoin="round"/>',
		'<path d="M20,36 L26,18 L32,36" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="26" y1="36" x2="26" y2="42" stroke="black" stroke-width="0.7"/><path d="M50,34 L56,16 L62,34" fill="none" stroke="black" stroke-width="0.75" stroke-linejoin="round"/><line x1="56" y1="34" x2="56" y2="40" stroke="black" stroke-width="0.7"/><path d="M74,36 L80,18 L86,36" fill="none" stroke="black" stroke-width="0.7" stroke-linejoin="round"/><line x1="80" y1="36" x2="80" y2="42" stroke="black" stroke-width="0.7"/><path d="M2,56 L12,22 L22,56" fill="none" stroke="black" stroke-width="0.8" stroke-linejoin="round"/><path d="M34,56 L46,18 L58,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/><path d="M66,56 L78,20 L90,56" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/>',
	],
	// Deciduous forest — back row (smaller canopies, higher) + front row (larger, lower)
	deciduous: [
		// Variant 0: 4 back + 3 front
		'<ellipse cx="10" cy="24" rx="6" ry="7" fill="none" stroke="black" stroke-width="0.7"/><line x1="10" y1="30" x2="10" y2="42" stroke="black" stroke-width="0.7"/><ellipse cx="32" cy="22" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.7"/><line x1="32" y1="29" x2="32" y2="42" stroke="black" stroke-width="0.7"/><ellipse cx="56" cy="24" rx="6" ry="7" fill="none" stroke="black" stroke-width="0.7"/><line x1="56" y1="30" x2="56" y2="42" stroke="black" stroke-width="0.7"/><ellipse cx="78" cy="22" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.7"/><line x1="78" y1="29" x2="78" y2="42" stroke="black" stroke-width="0.7"/><ellipse cx="18" cy="40" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.85"/><line x1="18" y1="49" x2="18" y2="58" stroke="black" stroke-width="0.85"/><ellipse cx="46" cy="38" rx="10" ry="11" fill="none" stroke="black" stroke-width="0.9"/><line x1="46" y1="48" x2="46" y2="58" stroke="black" stroke-width="0.9"/><ellipse cx="74" cy="40" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.85"/><line x1="74" y1="49" x2="74" y2="58" stroke="black" stroke-width="0.85"/>',
		// Variant 1: 3 back + 4 front
		'<ellipse cx="16" cy="22" rx="6" ry="7" fill="none" stroke="black" stroke-width="0.7"/><line x1="16" y1="28" x2="16" y2="40" stroke="black" stroke-width="0.7"/><ellipse cx="42" cy="20" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.7"/><line x1="42" y1="27" x2="42" y2="40" stroke="black" stroke-width="0.7"/><ellipse cx="68" cy="22" rx="6" ry="7" fill="none" stroke="black" stroke-width="0.7"/><line x1="68" y1="28" x2="68" y2="40" stroke="black" stroke-width="0.7"/><ellipse cx="8" cy="38" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="8" y1="46" x2="8" y2="58" stroke="black" stroke-width="0.8"/><ellipse cx="30" cy="36" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.85"/><line x1="30" y1="45" x2="30" y2="58" stroke="black" stroke-width="0.85"/><ellipse cx="56" cy="36" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.9"/><line x1="56" y1="45" x2="56" y2="58" stroke="black" stroke-width="0.9"/><ellipse cx="82" cy="38" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="82" y1="46" x2="82" y2="58" stroke="black" stroke-width="0.8"/>',
	],
	// Acacia grove — 2 back (smaller, higher) + 3 front (larger, lower)
	acacia: [
		// Variant 0
		'<path d="M16,28 Q16,20 24,18 Q32,20 32,28 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="24" y1="28" x2="24" y2="44" stroke="black" stroke-width="0.7"/><path d="M62,26 Q62,18 72,16 Q82,18 82,26 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="72" y1="26" x2="72" y2="44" stroke="black" stroke-width="0.7"/><path d="M2,42 Q2,30 14,28 Q26,30 26,42 Z" fill="none" stroke="black" stroke-width="0.85"/><line x1="14" y1="42" x2="14" y2="58" stroke="black" stroke-width="0.85"/><path d="M36,40 Q36,28 50,26 Q64,28 64,40 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="50" y1="40" x2="50" y2="58" stroke="black" stroke-width="0.9"/><path d="M72,42 Q72,32 82,30 Q92,32 92,42 Z" fill="none" stroke="black" stroke-width="0.85"/><line x1="82" y1="42" x2="82" y2="58" stroke="black" stroke-width="0.85"/>',
		// Variant 1: 1 back + 2 front
		'<path d="M38,26 Q38,16 50,14 Q62,16 62,26 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="50" y1="26" x2="50" y2="44" stroke="black" stroke-width="0.7"/><path d="M4,40 Q4,26 20,24 Q36,26 36,40 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="20" y1="40" x2="20" y2="58" stroke="black" stroke-width="0.9"/><path d="M62,40 Q62,28 76,26 Q90,28 90,40 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="76" y1="40" x2="76" y2="58" stroke="black" stroke-width="0.9"/>',
		// Variant 2: 2 back + 2 front, varied sizes
		'<path d="M8,30 Q8,22 16,20 Q24,22 24,30 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="16" y1="30" x2="16" y2="46" stroke="black" stroke-width="0.7"/><path d="M68,28 Q68,20 78,18 Q88,20 88,28 Z" fill="none" stroke="black" stroke-width="0.7"/><line x1="78" y1="28" x2="78" y2="46" stroke="black" stroke-width="0.7"/><path d="M22,42 Q22,28 38,26 Q54,28 54,42 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="38" y1="42" x2="38" y2="58" stroke="black" stroke-width="0.9"/><path d="M58,42 Q58,32 70,30 Q82,32 82,42 Z" fill="none" stroke="black" stroke-width="0.85"/><line x1="70" y1="42" x2="70" y2="58" stroke="black" stroke-width="0.85"/>',
	],
	// Palm grove — 2 back (smaller, higher) + 3 front (larger, lower)
	palm: [
		// Variant 0
		'<path d="M22,44 Q22,36 20,28" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M20,28 L14,23" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M20,28 L16,18" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M20,28 L21,16" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M20,28 L26,19" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M20,28 L27,24" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M70,44 Q70,36 68,28" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M68,28 L62,23" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M68,28 L64,18" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M68,28 L69,16" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M68,28 L74,20" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M68,28 L76,25" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M10,58 Q10,46 8,34" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M8,34 L1,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L3,20" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L9,18" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L16,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L18,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M46,58 Q48,46 50,36" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M50,36 L42,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,36 L44,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,36 L51,20" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,36 L58,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,36 L60,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M88,58 Q87,48 85,38" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M85,38 L78,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M85,38 L80,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M85,38 L86,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M85,38 L92,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M85,38 L94,34" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
		// Variant 1: 1 back + 3 front
		'<path d="M46,42 Q46,34 44,26" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M44,26 L38,21" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M44,26 L40,16" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M44,26 L45,14" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M44,26 L50,18" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M44,26 L52,23" fill="none" stroke="black" stroke-width="0.5" stroke-linecap="round"/><path d="M10,58 Q10,46 8,34" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M8,34 L1,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L3,20" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L9,18" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L16,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M8,34 L18,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,58 Q52,46 54,36" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M54,36 L46,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M54,36 L48,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M54,36 L55,20" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M54,36 L62,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M54,36 L64,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M90,58 Q89,48 87,38" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M87,38 L80,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M87,38 L82,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M87,38 L88,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M87,38 L94,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M87,38 L96,34" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
	],
};

// ---------------------------------------------------------------------------
// Individual icon helpers
// ---------------------------------------------------------------------------

/**
 * Returns Tolkien-style SVG content for a symbol ID (individual non-clustered types).
 * Falls back to a simple dot if the type is unrecognized.
 */
function getTolkienContent(symbolId: string): string {
	const type = symbolId.replace(/^relief-/, '').replace(/-\d+$/, '');
	const variantIdx = parseInt(symbolId.match(/-(\d+)$/)?.[1] ?? '0', 10);
	const variants = TOLKIEN_CONTENT[type];
	if (!variants || variants.length === 0) {
		return '<circle cx="15" cy="15" r="3" fill="black"/>';
	}
	return variants[variantIdx % variants.length];
}

// ---------------------------------------------------------------------------
// Types that keep individual thinned icons (not replaced by clusters)
// ---------------------------------------------------------------------------

const INDIVIDUAL_TYPES = new Set(['grass', 'dune', 'swamp', 'vulcan', 'cactus', 'deadTree']);

// ---------------------------------------------------------------------------
// Thinning & sizing — keep fewer icons and shrink them so terrain is
// *suggested* rather than carpeted, matching Tolkien's sparse placement style.
// Only applies to INDIVIDUAL (non-clustered) types now.
// ---------------------------------------------------------------------------

/** Fraction of icons to keep, by terrain type. */
const KEEP_RATE: Record<string, number> = {
	grass: 0.18,
	dune: 0.45,
	swamp: 0.45,
	vulcan: 0.9,
	cactus: 0.35,
	deadTree: 0.4,
};

/** Size multiplier by terrain type. */
const SIZE_SCALE: Record<string, number> = {
	grass: 0.5,
	dune: 0.6,
	swamp: 0.55,
	vulcan: 0.7,
	cactus: 0.5,
	deadTree: 0.55,
};

/** Check whether a point falls inside any rotated-rect clearance zone. */
function isInClearanceZone(px: number, py: number, zones: LabelBBox[]): boolean {
	for (const zone of zones) {
		const rad = (-zone.angle * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const dx = px - zone.cx;
		const dy = py - zone.cy;
		const localX = dx * cos - dy * sin;
		const localY = dx * sin + dy * cos;
		if (Math.abs(localX) < zone.halfW && Math.abs(localY) < zone.halfH) {
			return true;
		}
	}
	return false;
}

/** Pre-computed label clearance zones so terrain icons don't crowd text. */
const clearanceZones = computeClearanceZones(12);

/** Deterministic hash (0–1) from placement position so thinning is stable. */
function posHash(x: number, y: number): number {
	const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return n - Math.floor(n);
}

/** Derive terrain type from href (e.g. "relief-mount-1" -> "mount"). */
function hrefToType(href: string): string {
	return href.replace(/^relief-/, '').replace(/-\d+$/, '');
}

/** Pre-compute the filtered + resized placement list — only INDIVIDUAL types. */
const visiblePlacements = RELIEF_PLACEMENTS.map((p) => ({
	...p,
	type: hrefToType(p.href),
})).filter((p) => {
	// Only keep individual (non-clustered) types
	if (!INDIVIDUAL_TYPES.has(p.type)) return false;
	const rate = KEEP_RATE[p.type] ?? 0.3;
	return posHash(p.x, p.y) < rate;
}).filter((p) => {
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return !isInClearanceZone(cx, cy, clearanceZones);
}).map((p) => {
	const scale = SIZE_SCALE[p.type] ?? 0.6;
	const newW = p.w * scale;
	const newH = p.h * scale;
	// Centre the shrunken icon on the original centre point
	const cx = p.x + p.w / 2;
	const cy = p.y + p.h / 2;
	return {
		x: cx - newW / 2,
		y: cy - newH / 2,
		w: newW,
		h: newH,
		href: p.href,
	};
});

// ---------------------------------------------------------------------------
// Build unique symbol IDs needed for individual placements only
// ---------------------------------------------------------------------------

const individualSymbolIds = new Set(visiblePlacements.map((p) => p.href));
const individualSymbols = RELIEF_SYMBOLS.filter((sym) => individualSymbolIds.has(sym.id));

// ---------------------------------------------------------------------------
// Build cluster symbol IDs and pre-compute cluster rendering data
// ---------------------------------------------------------------------------

/** All cluster type+variant combinations that are actually used. */
const clusterSymbolDefs: { id: string; type: string; variantIdx: number }[] = [];
const seenClusterIds = new Set<string>();

for (const type of Object.keys(CLUSTER_SVGS)) {
	const variants = CLUSTER_SVGS[type];
	for (let i = 0; i < variants.length; i++) {
		const id = `cluster-${type}-${i}`;
		if (!seenClusterIds.has(id)) {
			seenClusterIds.add(id);
			clusterSymbolDefs.push({ id, type, variantIdx: i });
		}
	}
}

/** Pre-computed cluster placement data for rendering. */
const clusterRenderData = TERRAIN_CLUSTERS.map((cluster) => {
	const variants = CLUSTER_SVGS[cluster.type];
	if (!variants || variants.length === 0) return null;
	const variantIdx = Math.floor(posHash(cluster.cx, cluster.cy) * variants.length);
	const w = 100 * cluster.scale;
	const h = 60 * cluster.scale;
	return {
		id: `cluster-${cluster.type}-${variantIdx}`,
		x: cluster.cx - w / 2,
		y: cluster.cy - h / 2,
		w,
		h,
	};
}).filter((c): c is NonNullable<typeof c> => c !== null);

const ReliefLayer = () => {
	const map = useMap();
	const [paneReady, setPaneReady] = useState(false);

	useEffect(() => {
		if (!map.getPane('reliefPane')) {
			map.createPane('reliefPane');
			map.getPane('reliefPane')!.style.zIndex = '250';
		}
		setPaneReady(true);
	}, [map]);

	if (!paneReady || (visiblePlacements.length === 0 && clusterRenderData.length === 0)) return null;

	const bounds = L.latLngBounds(
		L.latLng(MAP_CONFIG.BOUNDS_SW[0], MAP_CONFIG.BOUNDS_SW[1]),
		L.latLng(MAP_CONFIG.BOUNDS_NE[0], MAP_CONFIG.BOUNDS_NE[1])
	);

	return (
		<SVGOverlay bounds={bounds} pane="reliefPane" interactive={false}>
			<svg viewBox={`0 0 ${MAP_CONFIG.SVG_WIDTH} ${MAP_CONFIG.SVG_HEIGHT}`} preserveAspectRatio="none">
				<defs>
					{/* Individual icon symbols (non-clustered types only) */}
					{individualSymbols.map((sym) => (
						<symbol key={sym.id} id={sym.id} viewBox={TOLKIEN_VIEWBOX}>
							{/* eslint-disable-next-line react/no-danger -- trusted build-time SVG symbol IDs mapped to static Tolkien-style content */}
							<g dangerouslySetInnerHTML={{ __html: getTolkienContent(sym.id) }} />
						</symbol>
					))}
					{/* Cluster symbols (composed terrain scenes) */}
					{clusterSymbolDefs.map((def) => (
						<symbol key={def.id} id={def.id} viewBox={CLUSTER_VIEWBOX}>
							{/* eslint-disable-next-line react/no-danger -- trusted static cluster SVG artwork */}
							<g dangerouslySetInnerHTML={{ __html: CLUSTER_SVGS[def.type][def.variantIdx] }} />
						</symbol>
					))}
				</defs>
				{/* Cluster graphics */}
				{clusterRenderData.map((c, i) => (
					<use
						key={`cluster-${i}`}
						x={c.x}
						y={c.y}
						width={c.w}
						height={c.h}
						href={`#${c.id}`}
					/>
				))}
				{/* Individual thinned icons (non-clustered types) */}
				{visiblePlacements.map((p, i) => (
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
