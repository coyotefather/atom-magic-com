'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { selectUnplacedStone } from '@/lib/slices/voragoSlice';
import { KeyboardEvent } from 'react';

const StoneTray = () => {
  const dispatch = useAppDispatch();
  const { stones, turn, selectedStone, hasMovedStone } = useAppSelector(state => state.vorago);

  const player1Stones = stones.player1.filter(s => s.ring === -1);
  const player2Stones = stones.player2.filter(s => s.ring === -1);

  const handleStoneSelect = (player: 1 | 2, stoneArrayIndex: number) => {
	if (player !== turn || hasMovedStone) return;

	// Get the full stone array for this player
	const stoneArray = stones[`player${player}` as 'player1' | 'player2'];

	// Find the actual unplaced stone at this position in the filtered array
	const unplacedStones = stoneArray
	  .map((stone, originalIndex) => ({ stone, originalIndex }))
	  .filter(item => item.stone.ring === -1);

	// Get the stone at the display index
	if (stoneArrayIndex < unplacedStones.length) {
	  const { originalIndex } = unplacedStones[stoneArrayIndex];
	  dispatch(selectUnplacedStone({ player, index: originalIndex }));
	}
  };

  const handleKeyDown = (e: KeyboardEvent, player: 1 | 2, stoneArrayIndex: number) => {
	if (e.key === 'Enter' || e.key === ' ') {
	  e.preventDefault();
	  handleStoneSelect(player, stoneArrayIndex);
	}
  };

 return (
   <div
	 className="flex gap-4 items-center justify-between p-3 bg-white border-2 border-black"
	 role="region"
	 aria-label="Stone tray - select stones to place on the board"
   >
	 {/* Player 1 */}
	 <div className="flex items-center gap-2" role="group" aria-label="Player 1 stones">
	   <span className="text-xs font-bold marcellus" id="p1-label">P1:</span>
	   <div className="flex gap-1" role="listbox" aria-labelledby="p1-label">
		 {player1Stones.map((stone, displayIdx) => {
		   const isSelectable = turn === 1 && !hasMovedStone;
		   const isSelected = selectedStone?.player === 1 && selectedStone?.ring === -1;
		   return (
			 <div
			   key={`p1-stone-${displayIdx}`}
			   role="option"
			   aria-selected={isSelected}
			   aria-label={`Player 1 stone ${displayIdx + 1}${isSelected ? ', selected' : ''}${!isSelectable ? ', not your turn' : ''}`}
			   tabIndex={isSelectable ? 0 : -1}
			   onClick={() => handleStoneSelect(1, displayIdx)}
			   onKeyDown={(e) => handleKeyDown(e, 1, displayIdx)}
			   className={`
				 w-10 h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
				 ${isSelectable ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				 ${isSelected ? 'ring-2 ring-gold scale-110' : ''}
			   `}
			   style={{
				 backgroundColor: 'var(--color-bronze)',
				 borderColor: 'var(--color-black)'
			   }}
			 />
		   );
		 })}
	   </div>
	   {stones.player1.filter(s => s.ring >= 0).length > 0 && (
		 <span className="text-[10px] text-gray-500" aria-live="polite">
		   ({3 - player1Stones.length} placed)
		 </span>
	   )}
	 </div>

	 {/* Divider */}
	 <div className="h-12 w-px bg-gray-300" aria-hidden="true" />

	 {/* Player 2 */}
	 <div className="flex items-center gap-2" role="group" aria-label="Player 2 stones">
	   <span className="text-xs font-bold marcellus" id="p2-label">P2:</span>
	   <div className="flex gap-1" role="listbox" aria-labelledby="p2-label">
		 {player2Stones.map((stone, displayIdx) => {
		   const isSelectable = turn === 2 && !hasMovedStone;
		   const isSelected = selectedStone?.player === 2 && selectedStone?.ring === -1;
		   return (
			 <div
			   key={`p2-stone-${displayIdx}`}
			   role="option"
			   aria-selected={isSelected}
			   aria-label={`Player 2 stone ${displayIdx + 1}${isSelected ? ', selected' : ''}${!isSelectable ? ', not your turn' : ''}`}
			   tabIndex={isSelectable ? 0 : -1}
			   onClick={() => handleStoneSelect(2, displayIdx)}
			   onKeyDown={(e) => handleKeyDown(e, 2, displayIdx)}
			   className={`
				 w-10 h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
				 ${isSelectable ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'}
				 ${isSelected ? 'ring-2 ring-gold scale-110' : ''}
			   `}
			   style={{
				 backgroundColor: 'var(--color-oxblood)',
				 borderColor: 'var(--color-black)'
			   }}
			 />
		   );
		 })}
	   </div>
	   {stones.player2.filter(s => s.ring >= 0).length > 0 && (
		 <span className="text-[10px] text-gray-500" aria-live="polite">
		   ({3 - player2Stones.length} placed)
		 </span>
	   )}
	 </div>
   </div>
 );
};

export default StoneTray;