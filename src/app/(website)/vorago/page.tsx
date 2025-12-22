'use client';

import Header from '@/app/components/common/Header';
import VoragoBoard from '@/app/components/vorago/VoragoBoard';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import GameStatus from '@/app/components/vorago/GameStatus';
import { useAppSelector } from '@/lib/hooks';

const Page = () => {
  const { gameWin, winner, player1Name, player2Name } = useAppSelector(state => state.vorago);

  return (
	<main className="notoserif">
	  <Header name="Vorago">
		A game of strategy and choice. Move your stones to the center. First to three wins.
	  </Header>

	  <div className="container mx-auto py-8">
		{gameWin ? (
		  <div className="text-center">
			<h2 className="marcellus text-4xl mb-4">
			  {winner === 1 ? player1Name : player2Name} Wins!
			</h2>
			<button
			  onClick={() => window.location.reload()}
			  className="bg-gold text-black py-2 px-6 rounded hover:bg-brightgold"
			>
			  Play Again
			</button>
		  </div>
		) : (
		  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Left: Game Status */}
			<div className="lg:col-span-1">
			  <GameStatus />
			</div>

			{/* Center: Board */}
			<div className="lg:col-span-2">
			  <VoragoBoard />

			  {/* Coins below board */}
			  <div className="mt-8">
				<h3 className="marcellus text-2xl mb-4">Cardinal Coins</h3>
				<CoinSelector />
			  </div>
			</div>
		  </div>
		)}
	  </div>
	</main>
  );
};

export default Page;