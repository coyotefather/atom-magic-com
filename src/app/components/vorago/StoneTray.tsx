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
   <div className="flex gap-6 justify-center items-center p-4 bg-white border-2 border-black rounded-lg">
	 {/* Player 1 Stones */}
	 <div className="flex-1 max-w-xs">
	   <h3 className="marcellus text-base mb-2 text-center">Player 1</h3>
	   <div className="flex gap-2 justify-center">
		 {player1Stones.map((stone, displayIdx) => {
		   const isSelected = selectedStone?.player === 1 && selectedStone?.ring === -1;
		   return (
			 <div
			   key={`p1-stone-${displayIdx}`}
			   onClick={() => handleStoneClick(1, displayIdx)}
			   className={`
				 w-12 h-12 rounded-full border-3 transition-all
				 ${turn === 1 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				 ${isSelected ? 'ring-3 ring-gold scale-110' : ''}
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
		   <div className="text-xs text-gray-500 self-center ml-2">
			 {3 - player1Stones.length} placed
		   </div>
		 )}
	   </div>
	 </div>

	 {/* Divider */}
	 <div className="h-16 w-px bg-gray-300" />

	 {/* Player 2 Stones */}
	 <div className="flex-1 max-w-xs">
	   <h3 className="marcellus text-base mb-2 text-center">Player 2</h3>
	   <div className="flex gap-2 justify-center">
		 {player2Stones.map((stone, displayIdx) => {
		   const isSelected = selectedStone?.player === 2 && selectedStone?.ring === -1;
		   return (
			 <div
			   key={`p2-stone-${displayIdx}`}
			   onClick={() => handleStoneClick(2, displayIdx)}
			   className={`
				 w-12 h-12 rounded-full border-3 transition-all
				 ${turn === 2 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				 ${isSelected ? 'ring-3 ring-gold scale-110' : ''}
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
		   <div className="text-xs text-gray-500 self-center ml-2">
			 {3 - player2Stones.length} placed
		   </div>
		 )}
	   </div>
	 </div>
   </div>
 );
};

export default StoneTray;