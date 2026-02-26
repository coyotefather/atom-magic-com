# Map RoughJS + Ocean Polish — Design Doc

**Date:** 2026-02-25

## Goal

Close the visual gap between the digital map and the hand-drawn reference image by adding ocean labels, giving ocean contours a hand-drawn wobble via RoughJS, and deepening the parchment aging effect.

## Changes

### 1. Ocean Labels (`OceanLabels.tsx` — new)
Four large faded labels placed in the open ocean bodies:
- OCEANVS HIBERNIAE (upper centre, between island group and main continent)
- OCEANVS ALBIS (far right ocean)
- OCEANVS CAMBRIAE (lower centre, south of island group)
- OCEANVS MERIDIANVS (lower right, south of main continent)

Style: Noto Serif, fontSize 20 SVG units, `#6B5B3E`, opacity 0.32, letter-spacing 2, centred (`textAnchor="middle"`). Static hand-placed SVG text in a new pane at z-index 155 (above contours, below grid).

### 2. RoughJS Ocean Contours (`OceanContours.tsx` — rewrite)
Convert from react-leaflet `GeoJSON` component to `SVGOverlay` + imperative RoughJS rendering. Same `CONTOUR_STYLES` weights/opacities, same `contourPane` z-index 150. roughness 0.25, bowing 0.4, `disableMultiStroke: true`. One-time render in `useEffect`.

### 3. Enhanced Parchment Aging (`GrainOverlay.tsx` — modify)
Add a second SVG filter (`paper-blotch`) with much lower `baseFrequency` (0.025) and 2 octaves for large soft stain blotches at ~7% opacity. Rendered as a second `<rect>` below the existing fine-grain rect. No structural changes to the component.

## What stays the same
- Rivers: the Azgaar Bézier paths are already organic; RoughJS distorts them
- RegionShadows: subtle GeoJSON stroke, imperceptible at this scale
- AnnotationLayer, RoughBorders, LakesLayer: already on RoughJS
