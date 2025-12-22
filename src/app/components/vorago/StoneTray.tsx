'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectUnplacedStone } from '@/lib/slices/voragoSlice';

const StoneTray = () => {
  const dispatch = useAppDispatch();
  const { stones, turn, selectedStone, hasMovedStone } = useAppSelector(state => state.vorago);

  const player1Stones = stones.player1.filter(s => s.ring === -1);
  const player2Stones = stones.player2.filter(s => s.ring === -1);

  const handleStoneClick = (player: 1 | 2, stoneArrayIndex: number) => {
	if (player !== turn || hasMovedStone) return;

	// Get the full stone array for this player
	const stoneArray = stones[`player${player}` as 'player1' | 'player2'];

	// Find the actual unplaced stone at this position in the filtered array
	const unplacedStones = stoneArray
	  .map((stone, originalIndex) => ({ stone, originalIndex }))
	  .filter(item => item.stone.ring === -1);

	// Get the stone at the display index
	if (stoneArrayIndex < unplacedStones.length) {
	  const { stone, originalIndex } = unplacedStones[stoneArrayIndex];

	  console.log('Selecting stone:', stone, 'from original index:', originalIndex);

	  dispatch(selectUnplacedStone({ player, index: originalIndex }));
	}
  };

  return (
	<div className="flex gap-8 justify-around items-center p-6 bg-white border-2 border-black rounded-lg">
	  {/* Player 1 Stones */}
	  <div className="flex-1">
		<h3 className="marcellus text-lg mb-3 text-center">Player 1 Stones</h3>
		<div className="flex gap-4 justify-center">
		  {player1Stones.map((stone, displayIdx) => {
			const isSelected = selectedStone?.player === 1 && selectedStone?.ring === -1;
			return (
			  <div
				key={`p1-stone-${displayIdx}`}
				onClick={() => handleStoneClick(1, displayIdx)} // Use displayIdx
				className={`
				  w-16 h-16 rounded-full border-4 transition-all
				  ${turn === 1 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				  ${isSelected ? 'ring-4 ring-gold scale-110' : ''}
				`}
				style={{
				  backgroundColor: 'var(--color-sunset-blue)',
				  borderColor: 'var(--color-black)'
				}}
				title="Click to place this stone"
			  />
			);
		  })}
		  {stones.player1.filter(s => s.ring >= 0).length > 0 && (
			<div className="text-sm text-gray-500 self-center">
			  {3 - player1Stones.length} placed
			</div>
		  )}
		</div>
	  </div>

	  {/* Divider */}
	  <div className="h-20 w-px bg-gray-300" />

	  {/* Player 2 Stones */}
	  <div className="flex-1">
		<h3 className="marcellus text-lg mb-3 text-center">Player 2 Stones</h3>
		<div className="flex gap-4 justify-center">
		  {player2Stones.map((stone, idx) => {
			const isSelected = selectedStone?.player === 2 && selectedStone?.ring === -1;
			return (
			  <div
				key={`p2-stone-${idx}`}
				onClick={() => handleStoneClick(2, idx)}
				className={`
				  w-16 h-16 rounded-full border-4 transition-all
				  ${turn === 2 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				  ${isSelected ? 'ring-4 ring-gold scale-110' : ''}
				`}
				style={{
				  backgroundColor: 'var(--color-sunset-red)',
				  borderColor: 'var(--color-black)'
				}}
				title="Click to place this stone"
			  />
			);
		  })}
		  {stones.player2.filter(s => s.ring >= 0).length > 0 && (
			<div className="text-sm text-gray-500 self-center">
			  {3 - player2Stones.length} placed
			</div>
		  )}
		</div>
	  </div>
	</div>
  );
};

export default StoneTray;