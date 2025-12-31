'use client';

import { useAppDispatch } from '@/lib/hooks';
import { newGame, setPlayerNames, setAIMode } from '@/lib/slices/voragoSlice';
import { useState } from 'react';

interface GameSetupProps {
  onStart: () => void;
}

const GameSetup = ({ onStart }: GameSetupProps) => {
  const dispatch = useAppDispatch();
  const [player1Name, setPlayer1NameLocal] = useState('Player 1');
  const [player2Name, setPlayer2NameLocal] = useState('AI Opponent');
  const [vsAI, setVsAI] = useState(true);
  const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleStartGame = () => {
	dispatch(setPlayerNames({
	  player1: player1Name,
	  player2: player2Name
	}));
	dispatch(setAIMode({
	  enabled: vsAI,
	  difficulty: aiDifficulty
	}));
	dispatch(newGame());
	onStart();
  };

  return (
	<div className="max-w-2xl mx-auto bg-white p-8 shadow-lg border-2 border-black">
	  <h2 className="marcellus text-3xl mb-6 text-center">Setup New Game</h2>

	  <div className="space-y-6">
		{/* Player 1 Name */}
		<div>
		  <label className="block mb-2 font-semibold">Player 1 Name:</label>
		  <input
			type="text"
			value={player1Name}
			onChange={(e) => setPlayer1NameLocal(e.target.value)}
			className="w-full px-4 py-2 border-2 border-black"
			placeholder="Enter your name"
		  />
		</div>

		{/* Opponent Type */}
		<div>
		  <label className="block mb-2 font-semibold">Opponent:</label>
		  <div className="flex gap-4">
			<button
			  onClick={() => setVsAI(true)}
			  className={`flex-1 py-3 px-4 border-2 transition-all ${
				vsAI
				  ? 'bg-gold text-black border-black'
				  : 'bg-white text-black border-gray-300 hover:border-black'
			  }`}
			>
			  🤖 vs AI
			</button>
			<button
			  onClick={() => setVsAI(false)}
			  className={`flex-1 py-3 px-4 border-2 transition-all ${
				!vsAI
				  ? 'bg-gold text-black border-black'
				  : 'bg-white text-black border-gray-300 hover:border-black'
			  }`}
			>
			  👥 vs Human
			</button>
		  </div>
		</div>

		{/* AI Difficulty (only show if vs AI) */}
		{vsAI && (
		  <div>
			<label className="block mb-2 font-semibold">AI Difficulty:</label>
			<div className="grid grid-cols-2 gap-3">
			  {(['easy', 'medium', 'hard'] as const).map(level => (
				<button
				  key={level}
				  onClick={() => setAIDifficulty(level)}
				  className={`py-2 px-4 border-2 transition-all capitalize ${
					aiDifficulty === level
					  ? 'bg-gold text-black border-black'
					  : 'bg-white text-black border-gray-300 hover:border-black'
				  }`}
				>
				  {level}
				</button>
			  ))}
			</div>
			<p className="text-sm text-gray-600 mt-2">
			  {aiDifficulty === 'easy' && '🟢 AI makes basic moves'}
			  {aiDifficulty === 'medium' && '🟡 AI uses simple strategy'}
			  {aiDifficulty === 'hard' && '🟠 AI plays competitively'}
			</p>
		  </div>
		)}

		{/* Player 2 Name (only show if vs Human) */}
		{!vsAI && (
		  <div>
			<label className="block mb-2 font-semibold">Player 2 Name:</label>
			<input
			  type="text"
			  value={player2Name}
			  onChange={(e) => setPlayer2NameLocal(e.target.value)}
			  className="w-full px-4 py-2 border-2 border-black"
			  placeholder="Enter opponent's name"
			/>
		  </div>
		)}

		{/* Start Button */}
		<button
		  onClick={handleStartGame}
		  className="w-full py-4 px-6 bg-gold text-black border-2 border-black marcellus text-xl hover:bg-brightgold transition-all transform hover:scale-105"
		>
		  Start Game
		</button>
	  </div>

	  {/* Game Rules */}
	  <div className="mt-8 p-4 bg-parchment border-2 border-stone">
		<h3 className="font-bold mb-2">Quick Rules:</h3>
		<ul className="text-sm space-y-1 list-disc list-inside">
		  <li>Move all 3 stones to the center goal to win</li>
		  <li>Each turn: Move 1 stone + Use 1 coin</li>
		  <li>Coins are disabled for 1 round after use</li>
		  <li>Walls block movement, bridges help connect cells</li>
		  <li>Rings can rotate and be locked</li>
		</ul>
	  </div>
	</div>
  );
};

export default GameSetup;