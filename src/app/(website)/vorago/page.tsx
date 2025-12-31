'use client';

import Header from '@/app/components/common/Header';
import VoragoBoard from '@/app/components/vorago/VoragoBoard';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import GameStatus from '@/app/components/vorago/GameStatus';
import GameSetup from '@/app/components/vorago/GameSetup';
import StoneTray from '@/app/components/vorago/StoneTray';
import { useAppSelector } from '@/lib/hooks';
import { useState, useRef, useEffect } from 'react';

const Page = () => {
  const { gameWin, winner, player1Name, player2Name, isAIThinking } = useAppSelector(state => state.vorago);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);

  // Close tips popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tipsRef.current && !tipsRef.current.contains(event.target as Node)) {
        setShowTips(false);
      }
    };
    if (showTips) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTips]);

  return (
	<main className="notoserif min-h-screen">
	  <Header name="Vorago">
		A game of strategy and choice. Move your stones to the center. First to three wins.
	  </Header>

	  <div className="container mx-auto py-8 px-4">
		{!gameStarted ? (
		  /* Setup Screen */
		  <GameSetup onStart={() => setGameStarted(true)} />
		) : gameWin ? (
		  /* Win Screen */
		  <div className="text-center">
			<div className="bg-black text-white p-12 inline-block border-2 border-stone">
			  <h2 className="marcellus text-5xl mb-6">
				🎉 {winner === 1 ? player1Name : player2Name} Wins! 🎉
			  </h2>
			  <p className="text-xl mb-8">
				Congratulations on reaching the center with all three stones!
			  </p>
			  <button
				onClick={() => setGameStarted(false)}
				className="bg-gold text-black py-3 px-8 marcellus text-xl border-2 border-gold hover:bg-brightgold transition-all"
			  >
				Play Again
			  </button>
			</div>
		  </div>
		) : (
		  /* Game Board */
		  <div className="space-y-4">
			{/* Top row: Game Status and controls - fixed height */}
			<div className="flex items-center gap-3 h-10">
			  <div className="flex-grow">
				<GameStatus />
			  </div>

			  {/* Tips popup trigger */}
			  <div className="relative" ref={tipsRef}>
				<button
				  onClick={() => setShowTips(!showTips)}
				  className="py-1 px-3 bg-gray-200 text-black rounded border border-gray-400 hover:bg-gray-300 transition-all text-xs"
				>
				  Tips
				</button>
				{showTips && (
				  <div className="absolute right-0 top-8 z-50 bg-white border-2 border-black p-3 text-sm shadow-lg w-64">
					<h4 className="font-bold mb-1 marcellus text-sm">Quick Tips:</h4>
					<ul className="space-y-0.5 text-xs">
					  <li>• Click your stone to select, then click a cell to move</li>
					  <li>• All coins have a cooldown of one round</li>
					  <li>• Complete both actions to end turn</li>
					</ul>
				  </div>
				)}
			  </div>

			  <button
				onClick={() => setGameStarted(false)}
				className="py-1 px-3 bg-gray-200 text-black rounded border border-gray-400 hover:bg-gray-300 transition-all text-xs"
			  >
				← Back
			  </button>
			</div>

			{/* Main area: Board and Coins side by side */}
			<div className="relative">
			  <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-start transition-opacity ${isAIThinking ? 'opacity-50 pointer-events-none' : ''}`}>
				{/* Left: Stone Tray + Board */}
				<div className="space-y-4">
				  <StoneTray />
				  <div className="bg-white p-4 border-2 border-black">
					<VoragoBoard />
				  </div>
				</div>

				{/* Right: Coins */}
				<div className="bg-white p-4 border-2 border-black">
				  <h3 className="marcellus text-lg mb-3 text-center">Cardinal Coins</h3>
				  <CoinSelector />
				</div>
			  </div>

			  {/* AI Thinking Overlay */}
			  {isAIThinking && (
				<div className="absolute inset-0 flex items-center justify-center">
				  <div className="bg-black text-white px-8 py-6 shadow-2xl text-center border-2 border-stone">
					<div className="flex items-center justify-center gap-3 mb-2">
					  <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
					  <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
					  <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
					</div>
					<p className="marcellus text-xl">{player2Name} is thinking...</p>
				  </div>
				</div>
			  )}
			</div>
		  </div>
		)}
	  </div>
	</main>
  );
};

export default Page;