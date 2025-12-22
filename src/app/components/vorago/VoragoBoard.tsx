'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { moveStone, selectStone, placeWall, removeWall, placeBridge, removeBridge } from '@/lib/slices/voragoSlice';
import { useState } from 'react';

// Ring configurations (cells per ring, radius)
const RING_CONFIG = [
  { cells: 12, radius: 260, ringIndex: 0 }, // Outermost
  { cells: 10, radius: 210, ringIndex: 1 },
  { cells: 8, radius: 160, ringIndex: 2 },
  { cells: 6, radius: 110, ringIndex: 3 },
  { cells: 4, radius: 60, ringIndex: 4 },  // Innermost
];

const BOARD_CENTER = 300;

interface CellPosition {
  x: number;
  y: number;
  angle: number;
}

// Calculate cell positions on a ring
function getCellPosition(ringIndex: number, cellIndex: number, rotation: number): CellPosition {
  const config = RING_CONFIG[ringIndex];
  const anglePerCell = 360 / config.cells;
  const baseAngle = cellIndex * anglePerCell;
  const totalAngle = baseAngle + rotation;
  const radians = (totalAngle - 90) * (Math.PI / 180); // -90 to start at top

  return {
	x: BOARD_CENTER + config.radius * Math.cos(radians),
	y: BOARD_CENTER + config.radius * Math.sin(radians),
	angle: totalAngle
  };
}

const VoragoBoard = () => {
  const dispatch = useAppDispatch();
  const { cells, degrees, selectedStone, turn, hasMovedStone, selectedCoin } = useAppSelector(state => state.vorago);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const handleCellClick = (ring: number, cell: number) => {
	const cellKey = `${ring}-${cell}`;
	const cellData = cells[cellKey];

	// If a stone is selected, try to move it
	if (selectedStone) {
	  // Check if the cell is valid for movement
	  if (!cellData.stone && !cellData.hasWall) {
		dispatch(moveStone({
		  stone: selectedStone,
		  toRing: ring,
		  toCell: cell
		}));
		dispatch(selectStone(null));
	  }
	}
	// If a coin is selected that affects cells
	else if (selectedCoin) {
	  switch (selectedCoin) {
		case 'Sovereign': // Place wall
		  if (!cellData.hasWall) {
			dispatch(placeWall({ ring, cell }));
		  }
		  break;
		case 'Rubicon': // Remove wall
		  if (cellData.hasWall) {
			dispatch(removeWall({ ring, cell }));
		  }
		  break;
		case 'Arcadia': // Place bridge
		  if (!cellData.hasBridge) {
			dispatch(placeBridge({ ring, cell }));
		  }
		  break;
		case 'Gamma': // Remove bridge
		  if (cellData.hasBridge) {
			dispatch(removeBridge({ ring, cell }));
		  }
		  break;
	  }
	}
	// Otherwise, if there's a stone here, select it
	else if (cellData.stone && cellData.stone.player === turn && !hasMovedStone) {
	  dispatch(selectStone(cellData.stone));
	}
  };

  return (
	<div className="relative w-full max-w-[600px] mx-auto aspect-square">
	  <svg viewBox="0 0 600 600" className="w-full h-full">
		{/* Background */}
		<rect width="600" height="600" fill="var(--color-ivory)" />

		{/* Rings */}
		{RING_CONFIG.map((config, idx) => (
		  <g key={`ring-${idx}`} transform={`rotate(${degrees[idx]} ${BOARD_CENTER} ${BOARD_CENTER})`}>
			{/* Ring circle */}
			<circle
			  cx={BOARD_CENTER}
			  cy={BOARD_CENTER}
			  r={config.radius}
			  fill="none"
			  stroke="var(--color-black)"
			  strokeWidth="2"
			  opacity="0.3"
			/>

			{/* Cells on this ring */}
			{Array.from({ length: config.cells }).map((_, cellIdx) => {
			  const cellKey = `${idx}-${cellIdx}`;
			  const cellData = cells[cellKey];
			  const pos = getCellPosition(idx, cellIdx, 0); // Position without extra rotation
			  const isHovered = hoveredCell === cellKey;
			  const isSelected = selectedStone?.ring === idx && selectedStone?.cell === cellIdx;

			  return (
				<g key={cellKey}>
				  {/* Cell circle - make it larger and more visible */}
				  <circle
					cx={pos.x}
					cy={pos.y}
					r="20"  // Increased from 15
					fill={
					  isSelected ? "var(--color-gold)" :
					  isHovered ? "rgba(255, 255, 200, 0.8)" :  // Light yellow hover
					  cellData.stone ? "rgba(200, 200, 200, 0.3)" :  // Gray if occupied
					  "rgba(255, 255, 255, 0.9)"  // White by default
					}
					stroke="var(--color-black)"
					strokeWidth="2"
					className="cursor-pointer transition-all"
					onMouseEnter={() => setHoveredCell(cellKey)}
					onMouseLeave={() => setHoveredCell(null)}
					onClick={() => handleCellClick(idx, cellIdx)}
				  />

				  {/* Wall indicator */}
				  {cellData.hasWall && (
					<rect
					  x={pos.x - 10}
					  y={pos.y - 10}
					  width="20"
					  height="20"
					  fill="var(--color-ivory-black)"
					  stroke="var(--color-black)"
					  strokeWidth="2"
					  className="pointer-events-none"
					/>
				  )}

				  {/* Bridge indicator */}
				  {cellData.hasBridge && (
					<path
					  d={`M ${pos.x - 12} ${pos.y} L ${pos.x + 12} ${pos.y} M ${pos.x - 8} ${pos.y - 5} L ${pos.x + 8} ${pos.y - 5} M ${pos.x - 8} ${pos.y + 5} L ${pos.x + 8} ${pos.y + 5}`}
					  stroke="var(--color-olive-green)"
					  strokeWidth="2"
					  strokeLinecap="round"
					  className="pointer-events-none"
					/>
				  )}

				  {/* Stone */}
				  {cellData.stone && (
					<circle
					  cx={pos.x}
					  cy={pos.y}
					  r="12"
					  fill={cellData.stone.player === 1 ? "var(--color-sunset-blue)" : "var(--color-sunset-red)"}
					  stroke="var(--color-black)"
					  strokeWidth="2"
					  className="cursor-pointer"
					  onClick={() => handleCellClick(idx, cellIdx)}
					/>
				  )}
				</g>
			  );
			})}
		  </g>
		))}

		{/* Center goal area */}
		<circle
		  cx={BOARD_CENTER}
		  cy={BOARD_CENTER}
		  r="35"
		  fill="var(--color-gold)"
		  stroke="var(--color-black)"
		  strokeWidth="3"
		/>
		<text
		  x={BOARD_CENTER}
		  y={BOARD_CENTER}
		  textAnchor="middle"
		  dominantBaseline="central"
		  className="font-bold"
		  fill="var(--color-black)"
		  fontSize="16"
		>
		  GOAL
		</text>
	  </svg>

	  {/* Instructions overlay */}
	  {selectedStone && (
		<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
		  Click a cell to move your stone
		</div>
	  )}

	  {selectedCoin && ['Sovereign', 'Rubicon', 'Arcadia', 'Gamma'].includes(selectedCoin) && (
		<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
		  Click a cell to use {selectedCoin}
		</div>
	  )}
	</div>
  );
};

export default VoragoBoard;