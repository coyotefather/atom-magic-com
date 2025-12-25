'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  moveStone,
  selectStone,
  placeWall,
  removeWall,
  placeBridge,
  removeBridge,
  completeCoinAction,
  setDisplayMessage
} from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ring configurations - doubling cells from innermost (4) outward
// Ring 4 (innermost): 4 cells (90° each)
// Ring 3: 8 cells (45° each) - each Ring 4 cell touches 2 Ring 3 cells
// Ring 2: 16 cells (22.5° each) - each Ring 3 cell touches 2 Ring 2 cells
// Ring 1: 16 cells (22.5° each) - SAME as Ring 2, rotates 1:1 with Ring 2
// Ring 0 (outermost): 32 cells (11.25° each) - each Ring 1 cell touches 2 Ring 0 cells
const RING_CONFIG = [
  { cells: 32, radius: 250, ringIndex: 0, name: 'ring1' }, // Outermost
  { cells: 16, radius: 212.5, ringIndex: 1, name: 'ring2' }, // Same as Ring 2
  { cells: 16, radius: 175, ringIndex: 2, name: 'ring3' },
  { cells: 8, radius: 136.5, ringIndex: 3, name: 'ring4' },
  { cells: 4, radius: 100, ringIndex: 4, name: 'ring5' },  // Innermost
];


const BOARD_CENTER = 250; // Half of 500px viewBox

// Pie slice path generator
function generatePieSlicePath(ringIndex: number, cellIndex: number): string {
  const config = RING_CONFIG[ringIndex];
  const anglePerCell = 360 / config.cells;
  const startAngle = cellIndex * anglePerCell;
  const endAngle = (cellIndex + 1) * anglePerCell;

  // Inner and outer radius for this ring
  const outerRadius = config.radius;
  const innerRadius = ringIndex < 4 ? RING_CONFIG[ringIndex + 1].radius : 0;

  // Convert to radians (subtract 90 to start at top)
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  // Calculate points
  const x1 = BOARD_CENTER + outerRadius * Math.cos(startRad);
  const y1 = BOARD_CENTER + outerRadius * Math.sin(startRad);
  const x2 = BOARD_CENTER + outerRadius * Math.cos(endRad);
  const y2 = BOARD_CENTER + outerRadius * Math.sin(endRad);

  if (innerRadius === 0) {
	// Innermost ring - pie slice to center
	return `M ${BOARD_CENTER} ${BOARD_CENTER} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`;
  } else {
	// Other rings - donut slice
	const x3 = BOARD_CENTER + innerRadius * Math.cos(endRad);
	const y3 = BOARD_CENTER + innerRadius * Math.sin(endRad);
	const x4 = BOARD_CENTER + innerRadius * Math.cos(startRad);
	const y4 = BOARD_CENTER + innerRadius * Math.sin(startRad);

	return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  }
}

// Get center position and rotation angle for placing stones/walls/bridges
function getCellCenter(ringIndex: number, cellIndex: number): { x: number; y: number; rotation: number } {
  const config = RING_CONFIG[ringIndex];
  const anglePerCell = 360 / config.cells;
  const angle = (cellIndex + 0.5) * anglePerCell; // Center of the slice

  // Position at 50% of the way from inner to outer radius (true center)
  const innerRadius = ringIndex < 4 ? RING_CONFIG[ringIndex + 1].radius : 0;
  const outerRadius = config.radius;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

  const radians = ((angle - 90) * Math.PI) / 180;

  return {
	x: BOARD_CENTER + radius * Math.cos(radians),
	y: BOARD_CENTER + radius * Math.sin(radians),
	rotation: angle // Rotation to orient perpendicular to center
  };
}

// Check if two cells are adjacent (accounting for rotation)
// Uses angular positions to determine adjacency since rings can rotate independently
function areCellsAdjacent(
  fromRing: number,
  fromCell: number,
  toRing: number,
  toCell: number,
  degrees: number[]
): boolean {
  // New stones (fromRing === -1) can be placed anywhere on ring 0
  if (fromRing === -1) return toRing === 0;

  // Same ring - check if cells are adjacent (rotation doesn't affect intra-ring adjacency)
  if (fromRing === toRing) {
	const cellCount = RING_CONFIG[fromRing].cells;
	const diff = Math.abs(fromCell - toCell);
	return diff === 1 || diff === cellCount - 1;
  }

  // Must be adjacent rings
  if (Math.abs(fromRing - toRing) !== 1) return false;

  // Calculate angular positions accounting for rotation
  const fromCells = RING_CONFIG[fromRing].cells;
  const toCells = RING_CONFIG[toRing].cells;
  const fromAnglePerCell = 360 / fromCells;
  const toAnglePerCell = 360 / toCells;

  // Angular center of each cell (with rotation)
  let fromAngle = ((fromCell + 0.5) * fromAnglePerCell + degrees[fromRing]) % 360;
  let toAngle = ((toCell + 0.5) * toAnglePerCell + degrees[toRing]) % 360;
  if (fromAngle < 0) fromAngle += 360;
  if (toAngle < 0) toAngle += 360;

  // Shortest angular distance around circle
  let angularDiff = Math.abs(fromAngle - toAngle);
  if (angularDiff > 180) angularDiff = 360 - angularDiff;

  // Adjacent if centers are within sum of half-widths
  const maxDistance = (fromAnglePerCell + toAnglePerCell) / 2;
  return angularDiff < maxDistance;
}

// Calculate logical cell from visual cell based on rotation
function getLogicalCell(ringIndex: number, visualCell: number, rotation: number): number {
  const config = RING_CONFIG[ringIndex];
  const anglePerCell = 360 / config.cells;
  const cellsRotated = Math.round(rotation / anglePerCell);
  let logicalCell = (visualCell - cellsRotated) % config.cells;
  if (logicalCell < 0) logicalCell += config.cells;
  return logicalCell;
}

// Debug mode - set to true to show cell/ring indices
const DEBUG_MODE = false;

const VoragoBoard = () => {
  const dispatch = useAppDispatch();
  const {
	cells,
	degrees,
	selectedStone,
	turn,
	hasMovedStone,
	selectedCoin,
	lockedRings
  } = useAppSelector(state => state.vorago);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const handleCellClick = (ring: number, visualCell: number) => {
	// Goal handling
	if (ring === 5 && selectedStone) {
	  if (selectedStone.ring === 4) {
		dispatch(moveStone({ stone: selectedStone, toRing: 5, toCell: 0 }));
		dispatch(selectStone(null));
	  } else {
		dispatch(setDisplayMessage('You must be on the innermost ring to reach the goal'));
		setTimeout(() => dispatch(setDisplayMessage('')), 2000);
	  }
	  return;
	}

	// With group rotation, visualCell IS the logical cell
	const logicalCell = visualCell;
	const cellKey = `${ring}-${logicalCell}`;
	const cellData = cells[cellKey];

	// Stone movement logic
	if (selectedStone) {
	  // NEW STONE PLACEMENT: Must be on outermost ring (ring 0)
	  if (selectedStone.ring === -1 && ring !== 0) {
		dispatch(setDisplayMessage('New stones must be placed on the outermost ring'));
		setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		return;
	  }

	  // ADJACENCY CHECK: Stones can only move to adjacent cells (unless using bridge)
	  if (selectedStone.ring >= 0 && !cellData.hasBridge) {
		if (!areCellsAdjacent(selectedStone.ring, selectedStone.cell, ring, logicalCell, degrees)) {
		  dispatch(setDisplayMessage('Stones can only move to adjacent cells'));
		  setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		  return;
		}
	  }

	  if (cellData.hasWall) {
		dispatch(setDisplayMessage('Cannot move to a cell with a wall'));
		setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		return;
	  }

	  if (cellData.stone) {
		dispatch(setDisplayMessage('Cell is already occupied'));
		setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		return;
	  }

	  // Bridge logic
	  if (cellData.hasBridge) {
		const targetRing = ring < 4 ? ring + 1 : 5;

		if (targetRing === 5) {
		  dispatch(setDisplayMessage('Using bridge to reach the goal!'));
		  setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		  dispatch(moveStone({ stone: selectedStone, toRing: 5, toCell: 0 }));
		} else {
		  dispatch(setDisplayMessage('Using bridge to jump to inner ring!'));
		  setTimeout(() => dispatch(setDisplayMessage('')), 2000);

		  const currentRingCells = RING_CONFIG[ring].cells;
		  const targetRingCells = RING_CONFIG[targetRing].cells;
		  let targetLogicalCell = Math.floor(logicalCell * (targetRingCells / currentRingCells));
		  targetLogicalCell = targetLogicalCell % targetRingCells;

		  dispatch(moveStone({ stone: selectedStone, toRing: targetRing, toCell: targetLogicalCell }));
		}

		dispatch(selectStone(null));
		return;
	  }

	  dispatch(moveStone({ stone: selectedStone, toRing: ring, toCell: logicalCell }));
	  dispatch(selectStone(null));
	}
	// Coin placement logic
	else if (selectedCoin) {
	  switch (selectedCoin) {
		case 'Sovereign':
		  if (cellData.hasBridge) {
			dispatch(setDisplayMessage('Cannot place wall on a cell with a bridge'));
			setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		  } else if (!cellData.hasWall) {
			dispatch(placeWall({ ring, cell: logicalCell }));
			dispatch(completeCoinAction());
		  }
		  break;
		case 'Rubicon':
		  if (cellData.hasWall) {
			dispatch(removeWall({ ring, cell: logicalCell }));
			dispatch(completeCoinAction());
		  }
		  break;
		case 'Arcadia':
		  if (cellData.hasWall) {
			dispatch(setDisplayMessage('Cannot place bridge on a cell with a wall'));
			setTimeout(() => dispatch(setDisplayMessage('')), 2000);
		  } else if (!cellData.hasBridge) {
			dispatch(placeBridge({ ring, cell: logicalCell }));
			dispatch(completeCoinAction());
		  }
		  break;
		case 'Gamma':
		  if (cellData.hasBridge) {
			dispatch(removeBridge({ ring, cell: logicalCell }));
			dispatch(completeCoinAction());
		  }
		  break;
	  }
	}
	// Stone selection
	else if (cellData.stone && cellData.stone.player === turn && !hasMovedStone) {
	  dispatch(selectStone(cellData.stone));
	}
  };

  return (
	<div className="relative w-full max-w-[600px] mx-auto aspect-square">
	  {/* Debug panel */}
	  {DEBUG_MODE && (
		<div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-2 rounded z-10 font-mono">
		  <div className="font-bold mb-1">Ring Rotations:</div>
		  {degrees.map((deg, i) => (
			<div key={i}>R{i}: {deg.toFixed(1)}°</div>
		  ))}
		  {selectedStone && (
			<div className="mt-2 border-t border-white/30 pt-1">
			  <div className="font-bold">Selected:</div>
			  <div>Ring: {selectedStone.ring}</div>
			  <div>Cell: {selectedStone.cell}</div>
			</div>
		  )}
		</div>
	  )}
	  <svg viewBox="0 0 500 500" className="w-full h-full">
		{/* Background gradient */}
		<defs>
		  <radialGradient id="boardGradient">
			<stop offset="0%" stopColor="#fffef5" />
			<stop offset="100%" stopColor="#f5f0e5" />
		  </radialGradient>

		{/* Drop shadow filters for depth */}
		<filter id="ringShadow0"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dx="0" dy="2"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="ringShadow1"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dx="0" dy="3"/><feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="ringShadow2"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dx="0" dy="4"/><feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="ringShadow3"><feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feOffset dx="0" dy="5"/><feComponentTransfer><feFuncA type="linear" slope="0.6"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="ringShadow4"><feGaussianBlur in="SourceAlpha" stdDeviation="6"/><feOffset dx="0" dy="6"/><feComponentTransfer><feFuncA type="linear" slope="0.7"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		</defs>

		<rect width="500" height="500" fill="url(#boardGradient)" />

		{/* Rings */}
		{RING_CONFIG.map((config, ringIdx) => (
		  <motion.g
			key={`ring-${ringIdx}`}
			animate={{ rotate: degrees[ringIdx] }}
			transition={{ type: 'spring', stiffness: 100, damping: 20 }}
			style={{ transformOrigin: '250px 250px' }}
		  >
			{/* Cells */}
			{Array.from({ length: config.cells }).map((_, cellIdx) => {
			  // Use cellIdx directly - the group transform handles visual rotation
			  const cellKey = `${ringIdx}-${cellIdx}`;
			  const cellData = cells[cellKey];
			  const center = getCellCenter(ringIdx, cellIdx);
			  const isHovered = hoveredCell === cellKey;
			  const isSelected = selectedStone?.ring === ringIdx && selectedStone?.cell === cellIdx;

			  return (
				<g key={cellKey}>
				  {/* Pie slice cell */}
				  <motion.path
					d={generatePieSlicePath(ringIdx, cellIdx)}
					fill={
					  isHovered ? 'rgba(255, 255, 200, 0.8)' :
					  cellData.stone ? 'rgba(200, 200, 200, 0.3)' :
					  // Depth-based coloring - darker as you go deeper
					  ringIdx === 0 ? 'rgba(255, 255, 255, 0.85)' :
					  ringIdx === 1 ? 'rgba(245, 245, 240, 0.80)' :
					  ringIdx === 2 ? 'rgba(235, 235, 230, 0.75)' :
					  ringIdx === 3 ? 'rgba(225, 225, 220, 0.70)' :
					  'rgba(215, 215, 210, 0.65)'
					}
					stroke="#3e3a36"
					strokeWidth="1.5"
					filter={`url(#ringShadow${ringIdx})`}
					className="cursor-pointer transition-colors"
					onMouseEnter={() => setHoveredCell(cellKey)}
					onMouseLeave={() => setHoveredCell(null)}
					onClick={() => handleCellClick(ringIdx, cellIdx)}
					whileHover={{ scale: 1.02 }}
					style={{ transformOrigin: '250px 250px' }}
				  />

				  {/* Wall */}
				  {cellData.hasWall && (
					<g transform={`translate(${center.x}, ${center.y}) rotate(${center.rotation})`}>
					  <motion.rect
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						x={-15}
						y={-15}
						width="30"
						height="30"
						fill="#5a5550"
						stroke="#000"
						strokeWidth="2"
						rx="3"
						className="pointer-events-none"
					  />
					</g>
				  )}

				  {/* Bridge */}
				  {cellData.hasBridge && (
					<g transform={`translate(${center.x}, ${center.y}) rotate(${center.rotation})`}>
					  <motion.g
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="pointer-events-none"
					  >
						<line x1={-15} y1={0} x2={15} y2={0}
							  stroke="#6b8e23" strokeWidth="4" strokeLinecap="round"/>
						<line x1={-12} y1={-6} x2={12} y2={-6}
							  stroke="#6b8e23" strokeWidth="2" strokeLinecap="round"/>
						<line x1={-12} y1={6} x2={12} y2={6}
							  stroke="#6b8e23" strokeWidth="2" strokeLinecap="round"/>
					  </motion.g>
					</g>
				  )}

				  {/* Debug: Cell index label */}
				  {DEBUG_MODE && (
					<text
					  x={center.x}
					  y={center.y + (cellData.stone ? -20 : 0)}
					  textAnchor="middle"
					  dominantBaseline="central"
					  fill="#666"
					  fontSize={ringIdx === 0 ? "7" : ringIdx <= 2 ? "9" : "11"}
					  className="pointer-events-none select-none"
					  fontFamily="monospace"
					>
					  {cellIdx}
					</text>
				  )}

				  {/* Stone */}
				  <AnimatePresence mode="wait">
					{cellData.stone && (
					  <g key={`stone-group-${cellKey}-p${cellData.stone.player}`}>
						<motion.circle
						  key={`stone-${cellKey}-p${cellData.stone.player}`}
						  initial={{ scale: 0, opacity: 0 }}
						  animate={{ scale: 1, opacity: 1 }}
						  exit={{ scale: 2, opacity: 0 }}
						  cx={center.x}
						  cy={center.y}
						  r="14"
						  fill={cellData.stone.player === 1 ? '#4682b4' : '#dc143c'}
						  stroke={isSelected ? '#d4af37' : '#000'}
						  strokeWidth={isSelected ? '4' : '2.5'}
						  className="cursor-pointer"
						  onClick={() => handleCellClick(ringIdx, cellIdx)}
						  whileHover={{ scale: 1.15 }}
						/>
					  </g>
					)}
				  </AnimatePresence>

				  {/* Pulsing selection ring - separate AnimatePresence */}
				  <AnimatePresence>
					{cellData.stone && isSelected && (
					  <motion.circle
						key={`pulse-${ringIdx}-${cellIdx}-p${cellData.stone.player}`}
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1.3, opacity: 0.6 }}
						exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
						transition={{
						  repeat: Infinity,
						  duration: 1,
						  ease: "easeInOut",
						  repeatType: "reverse"
						}}
						cx={center.x}
						cy={center.y}
						r="20"
						fill="none"
						stroke="#d4af37"
						strokeWidth="3"
						className="pointer-events-none"
					  />
					)}
				  </AnimatePresence>
				</g>
			  );
			})}

			{/* Lock icon for this ring (rotates with ring) */}
			{lockedRings[ringIdx] && (
			  <motion.g
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0 }}
			  >
				{/* Position lock ON the ring itself */}
				<g transform={`translate(${BOARD_CENTER}, ${BOARD_CENTER - config.radius + 15})`}>
				  <circle cx="0" cy="0" r="12" fill="#ffb6c1" stroke="#000" strokeWidth="2"/>
				  <g transform="translate(-5, -5) scale(0.4)">
					<rect x="5" y="10" width="14" height="12" fill="#3e3a36" stroke="#000" strokeWidth="2" rx="2"/>
					<path d="M 8 10 L 8 6 C 8 3.8 9.8 2 12 2 C 14.2 2 16 3.8 16 6 L 16 10"
						  fill="none" stroke="#3e3a36" strokeWidth="2.5" strokeLinecap="round"/>
					<circle cx="12" cy="16" r="2" fill="#000"/>
				  </g>
				</g>
			  </motion.g>
			)}
		  </motion.g>
		))}

		{/* Goal */}
		<motion.circle
		  cx={BOARD_CENTER}
		  cy={BOARD_CENTER}
		  r="40"
		  fill="#d4af37"
		  stroke="#000"
		  strokeWidth="4"
		  className="cursor-pointer"
		  onClick={() => handleCellClick(5, 0)}
		  whileHover={{ scale: 1.05 }}
		/>
		<text
		  x={BOARD_CENTER}
		  y={BOARD_CENTER}
		  textAnchor="middle"
		  dominantBaseline="central"
		  className="font-bold pointer-events-none select-none"
		  fill="#000"
		  fontSize="18"
		  fontFamily="Marcellus, serif"
		>
		  GOAL
		</text>
	  </svg>
	</div>
  );
};

export default VoragoBoard;