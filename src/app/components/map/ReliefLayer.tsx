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

const CLUSTER_SVGS: Record<string, string[]> = {
	// Mountain ranges — 3-5 connected peaks with right-side hatching
	mount: [
		// Variant 0: 5 peaks, tallest in centre
		'<path d="M2,58 L18,20 L30,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="19" y1="24" x2="25" y2="42" stroke="black" stroke-width="0.4"/><line x1="20" y1="30" x2="27" y2="48" stroke="black" stroke-width="0.35"/><path d="M22,58 L42,8 L60,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="43" y1="14" x2="52" y2="40" stroke="black" stroke-width="0.5"/><line x1="44" y1="20" x2="54" y2="46" stroke="black" stroke-width="0.4"/><line x1="45" y1="28" x2="56" y2="52" stroke="black" stroke-width="0.35"/><path d="M52,58 L70,22 L88,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="71" y1="26" x2="78" y2="44" stroke="black" stroke-width="0.4"/><line x1="72" y1="32" x2="80" y2="50" stroke="black" stroke-width="0.35"/>',
		// Variant 1: 4 peaks, asymmetric
		'<path d="M5,58 L20,26 L32,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="21" y1="30" x2="27" y2="48" stroke="black" stroke-width="0.4"/><path d="M25,58 L48,10 L68,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="49" y1="16" x2="58" y2="40" stroke="black" stroke-width="0.5"/><line x1="50" y1="22" x2="60" y2="46" stroke="black" stroke-width="0.4"/><line x1="51" y1="30" x2="62" y2="52" stroke="black" stroke-width="0.35"/><path d="M58,58 L75,18 L92,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="76" y1="22" x2="84" y2="44" stroke="black" stroke-width="0.45"/><line x1="77" y1="28" x2="86" y2="50" stroke="black" stroke-width="0.35"/><path d="M82,58 L95,30 L98,58" fill="none" stroke="black" stroke-width="0.9" stroke-linejoin="round"/>',
		// Variant 2: 3 broad peaks
		'<path d="M0,58 L22,14 L42,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="23" y1="18" x2="32" y2="42" stroke="black" stroke-width="0.5"/><line x1="24" y1="24" x2="34" y2="48" stroke="black" stroke-width="0.4"/><line x1="25" y1="32" x2="36" y2="54" stroke="black" stroke-width="0.35"/><path d="M32,58 L55,8 L78,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="56" y1="14" x2="66" y2="40" stroke="black" stroke-width="0.5"/><line x1="57" y1="20" x2="68" y2="46" stroke="black" stroke-width="0.4"/><line x1="58" y1="28" x2="70" y2="52" stroke="black" stroke-width="0.35"/><path d="M68,58 L88,20 L100,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="89" y1="24" x2="94" y2="42" stroke="black" stroke-width="0.4"/>',
	],
	// Snow-capped mountain ranges — peaks with snow-cap lines
	mountSnow: [
		// Variant 0: 4 peaks with snow lines
		'<path d="M4,58 L22,16 L38,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="14" y1="36" x2="30" y2="36" stroke="black" stroke-width="0.5"/><line x1="23" y1="32" x2="32" y2="48" stroke="black" stroke-width="0.4"/><path d="M30,58 L52,6 L72,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="40" y1="34" x2="62" y2="34" stroke="black" stroke-width="0.5"/><line x1="53" y1="28" x2="64" y2="48" stroke="black" stroke-width="0.4"/><line x1="54" y1="36" x2="66" y2="52" stroke="black" stroke-width="0.35"/><path d="M62,58 L82,18 L98,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="72" y1="38" x2="90" y2="38" stroke="black" stroke-width="0.5"/>',
		// Variant 1: 3 peaks with snow lines
		'<path d="M2,58 L28,12 L50,58" fill="none" stroke="black" stroke-width="1.2" stroke-linejoin="round"/><line x1="16" y1="34" x2="40" y2="34" stroke="black" stroke-width="0.5"/><line x1="29" y1="26" x2="42" y2="46" stroke="black" stroke-width="0.4"/><line x1="30" y1="34" x2="44" y2="52" stroke="black" stroke-width="0.35"/><path d="M40,58 L60,20 L78,58" fill="none" stroke="black" stroke-width="1.1" stroke-linejoin="round"/><line x1="50" y1="38" x2="70" y2="38" stroke="black" stroke-width="0.5"/><path d="M70,58 L88,24 L100,58" fill="none" stroke="black" stroke-width="1.0" stroke-linejoin="round"/><line x1="78" y1="40" x2="94" y2="40" stroke="black" stroke-width="0.5"/>',
	],
	// Rolling hills — 3-4 overlapping rounded bumps with hatching
	hill: [
		// Variant 0: 4 bumps
		'<path d="M0,54 Q15,28 30,54" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="18" y1="38" x2="26" y2="50" stroke="black" stroke-width="0.35"/><path d="M22,54 Q42,22 60,54" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="44" y1="32" x2="54" y2="48" stroke="black" stroke-width="0.4"/><line x1="46" y1="38" x2="56" y2="52" stroke="black" stroke-width="0.35"/><path d="M52,54 Q70,30 86,54" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="72" y1="38" x2="80" y2="50" stroke="black" stroke-width="0.35"/><path d="M80,54 Q92,36 100,54" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
		// Variant 1: 3 bumps, wider
		'<path d="M0,54 Q22,20 44,54" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="26" y1="32" x2="38" y2="48" stroke="black" stroke-width="0.4"/><line x1="28" y1="38" x2="40" y2="52" stroke="black" stroke-width="0.35"/><path d="M34,54 Q58,24 80,54" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="60" y1="34" x2="72" y2="48" stroke="black" stroke-width="0.4"/><line x1="62" y1="40" x2="74" y2="52" stroke="black" stroke-width="0.35"/><path d="M72,54 Q88,32 100,54" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/>',
		// Variant 2: 4 bumps, varied heights
		'<path d="M2,54 Q12,34 24,54" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/><path d="M18,54 Q36,18 54,54" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><line x1="38" y1="30" x2="48" y2="46" stroke="black" stroke-width="0.4"/><line x1="40" y1="36" x2="50" y2="50" stroke="black" stroke-width="0.35"/><path d="M46,54 Q62,28 78,54" fill="none" stroke="black" stroke-width="0.9" stroke-linecap="round"/><line x1="64" y1="36" x2="72" y2="50" stroke="black" stroke-width="0.35"/><path d="M72,54 Q86,38 98,54" fill="none" stroke="black" stroke-width="0.8" stroke-linecap="round"/>',
	],
	// Pine forest — 5-7 pointed triangular trees in a clump
	conifer: [
		// Variant 0: 6 trees, varied heights
		'<path d="M8,56 L8,48 L4,48 L8,38 L6,38 L8,28 L12,28 L14,38 L12,38 L16,48 L12,48 L12,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M22,56 L22,44 L18,44 L22,32 L20,32 L22,20 L26,20 L28,32 L26,32 L30,44 L26,44 L26,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M36,56 L36,50 L33,50 L36,42 L34,42 L36,34 L40,34 L42,42 L40,42 L43,50 L40,50 L40,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M50,56 L50,42 L46,42 L50,30 L48,30 L50,18 L54,18 L56,30 L54,30 L58,42 L54,42 L54,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M64,56 L64,48 L61,48 L64,40 L62,40 L64,32 L68,32 L70,40 L68,40 L71,48 L68,48 L68,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M78,56 L78,46 L75,46 L78,36 L76,36 L78,24 L82,24 L84,36 L82,36 L85,46 L82,46 L82,56" fill="none" stroke="black" stroke-width="0.8"/>',
		// Variant 1: 7 trees, tighter spacing
		'<path d="M5,56 L5,46 L2,46 L5,36 L3,36 L5,26 L9,26 L11,36 L9,36 L12,46 L9,46 L9,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M16,56 L16,50 L14,50 L16,42 L14,42 L16,34 L20,34 L22,42 L20,42 L22,50 L20,50 L20,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M28,56 L28,44 L25,44 L28,32 L26,32 L28,22 L32,22 L34,32 L32,32 L35,44 L32,44 L32,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M40,56 L40,48 L37,48 L40,38 L38,38 L40,28 L44,28 L46,38 L44,38 L47,48 L44,48 L44,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M52,56 L52,42 L49,42 L52,30 L50,30 L52,18 L56,18 L58,30 L56,30 L59,42 L56,42 L56,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M64,56 L64,50 L62,50 L64,44 L62,44 L64,36 L68,36 L70,44 L68,44 L70,50 L68,50 L68,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M76,56 L76,46 L73,46 L76,34 L74,34 L76,24 L80,24 L82,34 L80,34 L83,46 L80,46 L80,56" fill="none" stroke="black" stroke-width="0.8"/>',
		// Variant 2: 5 trees, spread out
		'<path d="M6,56 L6,44 L3,44 L6,32 L4,32 L6,22 L10,22 L12,32 L10,32 L13,44 L10,44 L10,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M24,56 L24,48 L21,48 L24,38 L22,38 L24,28 L28,28 L30,38 L28,38 L31,48 L28,48 L28,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M42,56 L42,40 L38,40 L42,26 L40,26 L42,14 L46,14 L48,26 L46,26 L50,40 L46,40 L46,56" fill="none" stroke="black" stroke-width="0.9"/><path d="M60,56 L60,48 L57,48 L60,38 L58,38 L60,30 L64,30 L66,38 L64,38 L67,48 L64,48 L64,56" fill="none" stroke="black" stroke-width="0.8"/><path d="M80,56 L80,44 L77,44 L80,32 L78,32 L80,20 L84,20 L86,32 L84,32 L87,44 L84,44 L84,56" fill="none" stroke="black" stroke-width="0.8"/>',
	],
	// Snow conifers — same as conifer (snow implied by mountSnow context)
	coniferSnow: [
		'<path d="M8,56 L8,48 L4,48 L8,38 L6,38 L8,28 L12,28 L14,38 L12,38 L16,48 L12,48 L12,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M24,56 L24,42 L20,42 L24,30 L22,30 L24,18 L28,18 L30,30 L28,30 L32,42 L28,42 L28,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M40,56 L40,50 L37,50 L40,42 L38,42 L40,32 L44,32 L46,42 L44,42 L47,50 L44,50 L44,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M56,56 L56,44 L52,44 L56,32 L54,32 L56,20 L60,20 L62,32 L60,32 L64,44 L60,44 L60,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M74,56 L74,48 L71,48 L74,38 L72,38 L74,26 L78,26 L80,38 L78,38 L81,48 L78,48 L78,56" fill="none" stroke="black" stroke-width="0.7"/>',
		'<path d="M6,56 L6,46 L3,46 L6,36 L4,36 L6,24 L10,24 L12,36 L10,36 L13,46 L10,46 L10,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M20,56 L20,50 L18,50 L20,44 L18,44 L20,36 L24,36 L26,44 L24,44 L26,50 L24,50 L24,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M36,56 L36,42 L33,42 L36,30 L34,30 L36,18 L40,18 L42,30 L40,30 L43,42 L40,42 L40,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M54,56 L54,48 L51,48 L54,38 L52,38 L54,28 L58,28 L60,38 L58,38 L61,48 L58,48 L58,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M70,56 L70,44 L67,44 L70,32 L68,32 L70,22 L74,22 L76,32 L74,32 L77,44 L74,44 L74,56" fill="none" stroke="black" stroke-width="0.7"/><path d="M86,56 L86,50 L84,50 L86,44 L84,44 L86,34 L90,34 L92,44 L90,44 L92,50 L90,50 L90,56" fill="none" stroke="black" stroke-width="0.7"/>',
	],
	// Deciduous forest — 5-7 rounded canopy ellipses with trunks
	deciduous: [
		// Variant 0: 6 trees, overlapping canopies
		'<ellipse cx="10" cy="32" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="10" y1="40" x2="10" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="26" cy="28" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="26" y1="37" x2="26" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="42" cy="30" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="42" y1="38" x2="42" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="58" cy="26" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="58" y1="35" x2="58" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="74" cy="30" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="74" y1="38" x2="74" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="88" cy="34" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.8"/><line x1="88" y1="41" x2="88" y2="56" stroke="black" stroke-width="0.8"/>',
		// Variant 1: 5 trees, more spread
		'<ellipse cx="10" cy="30" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="10" y1="39" x2="10" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="30" cy="26" rx="10" ry="11" fill="none" stroke="black" stroke-width="0.8"/><line x1="30" y1="36" x2="30" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="52" cy="28" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="52" y1="37" x2="52" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="72" cy="32" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="72" y1="40" x2="72" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="90" cy="28" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="90" y1="37" x2="90" y2="56" stroke="black" stroke-width="0.8"/>',
		// Variant 2: 7 trees, dense
		'<ellipse cx="8" cy="34" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.8"/><line x1="8" y1="41" x2="8" y2="56" stroke="black" stroke-width="0.7"/><ellipse cx="20" cy="28" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="20" y1="36" x2="20" y2="56" stroke="black" stroke-width="0.7"/><ellipse cx="34" cy="32" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.8"/><line x1="34" y1="39" x2="34" y2="56" stroke="black" stroke-width="0.7"/><ellipse cx="48" cy="26" rx="9" ry="10" fill="none" stroke="black" stroke-width="0.8"/><line x1="48" y1="35" x2="48" y2="56" stroke="black" stroke-width="0.8"/><ellipse cx="62" cy="30" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="62" y1="38" x2="62" y2="56" stroke="black" stroke-width="0.7"/><ellipse cx="76" cy="34" rx="7" ry="8" fill="none" stroke="black" stroke-width="0.8"/><line x1="76" y1="41" x2="76" y2="56" stroke="black" stroke-width="0.7"/><ellipse cx="90" cy="30" rx="8" ry="9" fill="none" stroke="black" stroke-width="0.8"/><line x1="90" y1="38" x2="90" y2="56" stroke="black" stroke-width="0.7"/>',
	],
	// Acacia grove — 3-4 flat-topped trees
	acacia: [
		// Variant 0: 4 trees
		'<path d="M4,32 Q4,20 14,18 Q24,20 24,32 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="14" y1="32" x2="14" y2="56" stroke="black" stroke-width="0.8"/><path d="M30,28 Q30,16 42,14 Q54,16 54,28 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="42" y1="28" x2="42" y2="56" stroke="black" stroke-width="0.8"/><path d="M58,34 Q58,24 66,22 Q74,24 74,34 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="66" y1="34" x2="66" y2="56" stroke="black" stroke-width="0.8"/><path d="M78,30 Q78,20 88,18 Q98,20 98,30 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="88" y1="30" x2="88" y2="56" stroke="black" stroke-width="0.8"/>',
		// Variant 1: 3 trees, wider canopies
		'<path d="M2,30 Q2,16 16,14 Q30,16 30,30 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="16" y1="30" x2="16" y2="56" stroke="black" stroke-width="0.8"/><path d="M36,26 Q36,12 52,10 Q68,12 68,26 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="52" y1="26" x2="52" y2="56" stroke="black" stroke-width="0.8"/><path d="M72,32 Q72,20 86,18 Q100,20 100,32 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="86" y1="32" x2="86" y2="56" stroke="black" stroke-width="0.8"/>',
		// Variant 2: 4 trees, varied sizes
		'<path d="M2,34 Q2,26 10,24 Q18,26 18,34 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="10" y1="34" x2="10" y2="56" stroke="black" stroke-width="0.7"/><path d="M22,28 Q22,14 36,12 Q50,14 50,28 Z" fill="none" stroke="black" stroke-width="0.9"/><line x1="36" y1="28" x2="36" y2="56" stroke="black" stroke-width="0.8"/><path d="M54,32 Q54,22 64,20 Q74,22 74,32 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="64" y1="32" x2="64" y2="56" stroke="black" stroke-width="0.8"/><path d="M80,30 Q80,20 90,18 Q100,20 100,30 Z" fill="none" stroke="black" stroke-width="0.8"/><line x1="90" y1="30" x2="90" y2="56" stroke="black" stroke-width="0.8"/>',
	],
	// Palm grove — 3-4 curved-trunk palms with frond lines
	palm: [
		// Variant 0: 4 palms
		'<path d="M12,56 Q11,42 9,32" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M9,32 L2,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M9,32 L4,20" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M9,32 L10,19" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M9,32 L16,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M9,32 L18,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M36,56 Q35,44 33,34" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M33,34 L26,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M33,34 L28,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M33,34 L34,21" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M33,34 L40,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M33,34 L42,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M62,56 Q63,44 65,36" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M65,36 L58,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M65,36 L60,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M65,36 L66,23" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M65,36 L72,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M65,36 L74,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M86,56 Q85,46 83,38" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M83,38 L76,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M83,38 L78,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M83,38 L84,25" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M83,38 L90,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M83,38 L92,34" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
		// Variant 1: 3 palms, wider spacing
		'<path d="M16,56 Q15,40 13,30" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M13,30 L5,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,30 L7,16" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,30 L14,15" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,30 L21,18" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M13,30 L23,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M50,56 Q51,42 53,34" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M53,34 L46,28" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M53,34 L48,22" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M53,34 L54,21" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M53,34 L60,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M53,34 L62,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M84,56 Q83,44 81,36" fill="none" stroke="black" stroke-width="1.0" stroke-linecap="round"/><path d="M81,36 L74,30" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M81,36 L76,24" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M81,36 L82,23" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M81,36 L88,26" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/><path d="M81,36 L90,32" fill="none" stroke="black" stroke-width="0.6" stroke-linecap="round"/>',
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
