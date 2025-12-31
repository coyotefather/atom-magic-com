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

 // In StoneTray.tsx, make it horizontal and minimal:
 return (
   <div className="flex gap-4 items-center justify-between p-3 bg-white border-2 border-black rounded-lg">
	 {/* Player 1 */}
	 <div className="flex items-center gap-2">
	   <span className="text-xs font-bold marcellus">P1:</span>
	   <div className="flex gap-1">
		 {player1Stones.map((stone, displayIdx) => (
		   <div
			 key={`p1-stone-${displayIdx}`}
			 onClick={() => handleStoneClick(1, displayIdx)}
			 className={`
			   w-10 h-10 rounded-full border-2 transition-all
			   ${turn === 1 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
			   ${selectedStone?.player === 1 && selectedStone?.ring === -1 ? 'ring-2 ring-gold scale-110' : ''}
			 `}
			 style={{
			   backgroundColor: 'var(--color-bronze)',
			   borderColor: 'var(--color-black)'
			 }}
		   />
		 ))}
	   </div>
	   {stones.player1.filter(s => s.ring >= 0).length > 0 && (
		 <span className="text-[10px] text-gray-500">
		   ({3 - player1Stones.length} placed)
		 </span>
	   )}
	 </div>

	 {/* Divider */}
	 <div className="h-12 w-px bg-gray-300" />

	 {/* Player 2 */}
	 <div className="flex items-center gap-2">
	   <span className="text-xs font-bold marcellus">P2:</span>
	   <div className="flex gap-1">
		 {player2Stones.map((stone, displayIdx) => (
		   <div
			 key={`p2-stone-${displayIdx}`}
			 onClick={() => handleStoneClick(2, displayIdx)}
			 className={`
			   w-10 h-10 rounded-full border-2 transition-all
			   ${turn === 2 && !hasMovedStone ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
			   ${selectedStone?.player === 2 && selectedStone?.ring === -1 ? 'ring-2 ring-gold scale-110' : ''}
			 `}
			 style={{
			   backgroundColor: 'var(--color-oxblood)',
			   borderColor: 'var(--color-black)'
			 }}
		   />
		 ))}
	   </div>
	   {stones.player2.filter(s => s.ring >= 0).length > 0 && (
		 <span className="text-[10px] text-gray-500">
		   ({3 - player2Stones.length} placed)
		 </span>
	   )}
	 </div>
   </div>
 );
};

export default StoneTray;