'use client';

import Header from '@/app/components/common/Header';
import VoragoBoard from '@/app/components/vorago/VoragoBoard';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import GameStatus from '@/app/components/vorago/GameStatus';
import GameSetup from '@/app/components/vorago/GameSetup';
import StoneTray from '@/app/components/vorago/StoneTray';
import { useAppSelector } from '@/lib/hooks';
import { useState } from 'react';

const Page = () => {
  const { gameWin, winner, player1Name, player2Name } = useAppSelector(state => state.vorago);
  const [gameStarted, setGameStarted] = useState(false);

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
			<div className="bg-black text-white p-12 rounded-lg inline-block">
			  <h2 className="marcellus text-5xl mb-6">
				🎉 {winner === 1 ? player1Name : player2Name} Wins! 🎉
			  </h2>
			  <p className="text-xl mb-8">
				Congratulations on reaching the center with all three stones!
			  </p>
			  <button
				onClick={() => setGameStarted(false)}
				className="bg-gold text-black py-3 px-8 rounded-lg marcellus text-xl border-2 border-gold hover:bg-brightgold transition-all"
			  >
				Play Again
			  </button>
			</div>
		  </div>
		) : (
		  /* Game Board */
		  <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
			{/* Left sidebar: Game Status - UNCHANGED */}
			<div className="xl:col-span-1 space-y-4">
			  <GameStatus />

			  {/* Quick reference card */}
			  <div className="bg-white border-2 border-black p-4 rounded-lg text-sm">
				<h4 className="font-bold mb-2 marcellus">Quick Tips:</h4>
				<ul className="space-y-1 text-xs">
				  <li>• Click your stone to select it</li>
				  <li>• Click a cell to move there</li>
				  <li>• Hover coins for descriptions</li>
				  <li>• Complete both actions to end turn</li>
				</ul>
			  </div>

			  <button
				onClick={() => setGameStarted(false)}
				className="w-full py-2 px-4 bg-gray-200 text-black rounded border-2 border-gray-400 hover:bg-gray-300 transition-all"
			  >
				← Back to Setup
			  </button>
			</div>

			{/* Main area: Board and Coins */}
			<div className="xl:col-span-4">
			  <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
				{/* Left: Board Area */}
				<div className="space-y-4">
				  {/* Stone Tray - Above board only */}
				  <StoneTray />

				  {/* Board */}
				  <div className="bg-white p-4 rounded-lg border-2 border-black">
					<VoragoBoard />
				  </div>
				</div>

				{/* Right: Coins - Narrow column */}
				<div className="bg-white p-4 rounded-lg border-2 border-black">
				  <h3 className="marcellus text-lg mb-3 text-center">Cardinal Coins</h3>
				  <CoinSelector />
				</div>
			  </div>
			</div>
		  </div>
		)}
	  </div>
	</main>
  );
};

export default Page;