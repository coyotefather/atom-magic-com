'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  moveStone,
  selectStone,
  placeWall,
  removeWall,
  placeBridge,
  removeBridge,
  setDisplayMessage
} from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ring configurations - using the actual sizes from Vue
const RING_CONFIG = [
  { cells: 12, radius: 250, ringIndex: 0, name: 'ring1' }, // Outermost (was 20 cells in Vue double-row)
  { cells: 10, radius: 212.5, ringIndex: 1, name: 'ring2' },
  { cells: 8, radius: 175, ringIndex: 2, name: 'ring3' },
  { cells: 6, radius: 136.5, ringIndex: 3, name: 'ring4' },
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

// Get center position of a cell for placing stones/walls/bridges
function getCellCenter(ringIndex: number, cellIndex: number): { x: number; y: number } {
  const config = RING_CONFIG[ringIndex];
  const anglePerCell = 360 / config.cells;
  const angle = (cellIndex + 0.5) * anglePerCell; // Center of the slice

  // Position at 70% of the way from inner to outer radius
  const innerRadius = ringIndex < 4 ? RING_CONFIG[ringIndex + 1].radius : 0;
  const outerRadius = config.radius;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;

  const radians = ((angle - 90) * Math.PI) / 180;

  return {
	x: BOARD_CENTER + radius * Math.cos(radians),
	y: BOARD_CENTER + radius * Math.sin(radians)
  };
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

	const logicalCell = getLogicalCell(ring, visualCell, degrees[ring]);
	const cellKey = `${ring}-${logicalCell}`;
	const cellData = cells[cellKey];

	// Stone movement logic
	if (selectedStone) {
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
		  if (!cellData.hasWall) dispatch(placeWall({ ring, cell: logicalCell }));
		  break;
		case 'Rubicon':
		  if (cellData.hasWall) dispatch(removeWall({ ring, cell: logicalCell }));
		  break;
		case 'Arcadia':
		  if (!cellData.hasBridge) dispatch(placeBridge({ ring, cell: logicalCell }));
		  break;
		case 'Gamma':
		  if (cellData.hasBridge) dispatch(removeBridge({ ring, cell: logicalCell }));
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
	  <svg viewBox="0 0 500 500" className="w-full h-full">
		{/* Background gradient */}
		<defs>
		  <radialGradient id="boardGradient">
			<stop offset="0%" stopColor="#fffef5" />
			<stop offset="100%" stopColor="#f5f0e5" />
		  </radialGradient>
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
			  const logicalCell = getLogicalCell(ringIdx, cellIdx, degrees[ringIdx]);
			  const cellKey = `${ringIdx}-${logicalCell}`;
			  const cellData = cells[cellKey];
			  const center = getCellCenter(ringIdx, cellIdx);
			  const isHovered = hoveredCell === cellKey;
			  const isSelected = selectedStone?.ring === ringIdx && selectedStone?.cell === logicalCell;

			  return (
				<g key={cellKey}>
				  {/* Pie slice cell */}
				  <motion.path
					d={generatePieSlicePath(ringIdx, cellIdx)}
					fill={
					  isSelected ? '#d4af37' :
					  isHovered ? 'rgba(255, 255, 200, 0.8)' :
					  cellData.stone ? 'rgba(200, 200, 200, 0.3)' :
					  'rgba(255, 255, 255, 0.7)'
					}
					stroke="#3e3a36"
					strokeWidth="1.5"
					className="cursor-pointer transition-colors"
					onMouseEnter={() => setHoveredCell(cellKey)}
					onMouseLeave={() => setHoveredCell(null)}
					onClick={() => handleCellClick(ringIdx, cellIdx)}
					whileHover={{ scale: 1.02 }}
					style={{ transformOrigin: '250px 250px' }}
				  />

				  {/* Wall */}
				  {cellData.hasWall && (
					<motion.rect
					  initial={{ scale: 0 }}
					  animate={{ scale: 1 }}
					  x={center.x - 15}
					  y={center.y - 15}
					  width="30"
					  height="30"
					  fill="#5a5550"
					  stroke="#000"
					  strokeWidth="2"
					  rx="3"
					  className="pointer-events-none"
					/>
				  )}

				  {/* Bridge */}
				  {cellData.hasBridge && (
					<motion.g
					  initial={{ opacity: 0, y: -10 }}
					  animate={{ opacity: 1, y: 0 }}
					  className="pointer-events-none"
					>
					  <line x1={center.x - 15} y1={center.y} x2={center.x + 15} y2={center.y}
							stroke="#6b8e23" strokeWidth="4" strokeLinecap="round"/>
					  <line x1={center.x - 12} y1={center.y - 6} x2={center.x + 12} y2={center.y - 6}
							stroke="#6b8e23" strokeWidth="2" strokeLinecap="round"/>
					  <line x1={center.x - 12} y1={center.y + 6} x2={center.x + 12} y2={center.y + 6}
							stroke="#6b8e23" strokeWidth="2" strokeLinecap="round"/>
					</motion.g>
				  )}

				  {/* Stone */}
				  <AnimatePresence>
					{cellData.stone && (
					  <motion.circle
						key={`stone-${cellKey}`}
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 2, opacity: 0 }}
						cx={center.x}
						cy={center.y}
						r="14"
						fill={cellData.stone.player === 1 ? '#4682b4' : '#dc143c'}
						stroke="#000"
						strokeWidth="2.5"
						className="cursor-pointer"
						onClick={() => handleCellClick(ringIdx, cellIdx)}
						whileHover={{ scale: 1.15 }}
					  />
					)}
				  </AnimatePresence>
				</g>
			  );
			})}
		  </motion.g>
		))}

		{/* Lock icons (non-rotating) */}
		{RING_CONFIG.map((config, idx) => (
		  lockedRings[idx] && (
			<AnimatePresence key={`lock-${idx}`}>
			  <motion.g
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				exit={{ scale: 0 }}
				transform={`translate(${BOARD_CENTER}, ${BOARD_CENTER - config.radius - 25})`}
			  >
				<circle cx="0" cy="0" r="16" fill="#ffb6c1" stroke="#000" strokeWidth="2"/>
				<g transform="translate(-6, -6) scale(0.5)">
				  <rect x="5" y="10" width="14" height="12" fill="#3e3a36" stroke="#000" strokeWidth="2" rx="2"/>
				  <path d="M 8 10 L 8 6 C 8 3.8 9.8 2 12 2 C 14.2 2 16 3.8 16 6 L 16 10"
						fill="none" stroke="#3e3a36" strokeWidth="2.5" strokeLinecap="round"/>
				  <circle cx="12" cy="16" r="2" fill="#000"/>
				</g>
			  </motion.g>
			</AnimatePresence>
		  )
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