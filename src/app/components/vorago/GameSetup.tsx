'use client';

import { useAppDispatch } from '@/lib/hooks';
import { newGame, setPlayerNames, setAIMode } from '@/lib/slices/voragoSlice';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiRobot, mdiAccountGroup, mdiWifiOff } from '@mdi/js';
import { useOffline } from '@/lib/OfflineContext';

interface GameSetupProps {
	onStart: () => void;
}

const GameSetup = ({ onStart }: GameSetupProps) => {
	const dispatch = useAppDispatch();
	const [player1Name, setPlayer1NameLocal] = useState('Player 1');
	const [player2Name, setPlayer2NameLocal] = useState('AI Opponent');
	const [vsAI, setVsAI] = useState(true);
	const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>(
		'medium'
	);
	const { isOffline } = useOffline();

	const handleStartGame = () => {
		dispatch(
			setPlayerNames({
				player1: player1Name,
				player2: player2Name,
			})
		);
		dispatch(
			setAIMode({
				enabled: vsAI,
				difficulty: aiDifficulty,
			})
		);
		dispatch(newGame());
		onStart();
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white border-2 border-stone">
				{/* Green accent line */}
				<div className="h-1 bg-laurel" />

				<div className="p-6 md:p-8">
					<h2 className="marcellus text-3xl mb-6 text-center text-black">
						Setup New Game
					</h2>

					<div className="space-y-6">
						{/* Player 1 Name */}
						<div>
							<label className="block mb-2 text-sm uppercase tracking-wider text-stone">
								Your Name
							</label>
							<input
								type="text"
								value={player1Name}
								onChange={(e) => setPlayer1NameLocal(e.target.value)}
								className="w-full px-4 py-3 border-2 border-stone focus:border-laurel focus:outline-none transition-colors"
								placeholder="Enter your name"
							/>
						</div>

						{/* Opponent Type */}
						<div>
							<label className="block mb-2 text-sm uppercase tracking-wider text-stone">
								Opponent
							</label>
							<div className="grid grid-cols-2 gap-4">
								<button
									onClick={() => setVsAI(true)}
									className={`py-4 px-4 border-2 transition-all flex items-center justify-center gap-2 ${
										vsAI
											? 'bg-laurel text-white border-laurel'
											: 'bg-white text-black border-stone hover:border-laurel'
									}`}
								>
									<Icon path={mdiRobot} size={1} />
									<span className="marcellus">vs AI</span>
								</button>
								<button
									onClick={() => setVsAI(false)}
									className={`py-4 px-4 border-2 transition-all flex items-center justify-center gap-2 ${
										!vsAI
											? 'bg-laurel text-white border-laurel'
											: 'bg-white text-black border-stone hover:border-laurel'
									}`}
								>
									<Icon path={mdiAccountGroup} size={1} />
									<span className="marcellus">vs Human</span>
								</button>
							</div>
						</div>

						{/* AI Difficulty (only show if vs AI) */}
						{vsAI && (
							<div>
								<label className="block mb-2 text-sm uppercase tracking-wider text-stone">
									AI Difficulty
								</label>
								{isOffline ? (
									<div className="flex items-center gap-2 py-3 px-4 border-2 border-stone bg-parchment">
										<Icon path={mdiWifiOff} size={0.8} className="text-stone" />
										<span className="text-stone text-sm">
											AI opponent requires internet connection
										</span>
									</div>
								) : (
									<>
										<div className="grid grid-cols-3 gap-3">
											{(['easy', 'medium', 'hard'] as const).map((level) => (
												<button
													key={level}
													onClick={() => setAIDifficulty(level)}
													className={`py-3 px-4 border-2 transition-all capitalize marcellus ${
														aiDifficulty === level
															? 'bg-laurel text-white border-laurel'
															: 'bg-white text-black border-stone hover:border-laurel'
													}`}
												>
													{level}
												</button>
											))}
										</div>
										<p className="text-sm text-stone mt-2">
											{aiDifficulty === 'easy' && 'AI makes basic moves'}
											{aiDifficulty === 'medium' && 'AI uses simple strategy'}
											{aiDifficulty === 'hard' && 'AI plays competitively'}
										</p>
									</>
								)}
							</div>
						)}

						{/* Player 2 Name (only show if vs Human) */}
						{!vsAI && (
							<div>
								<label className="block mb-2 text-sm uppercase tracking-wider text-stone">
									Opponent Name
								</label>
								<input
									type="text"
									value={player2Name}
									onChange={(e) => setPlayer2NameLocal(e.target.value)}
									className="w-full px-4 py-3 border-2 border-stone focus:border-laurel focus:outline-none transition-colors"
									placeholder="Enter opponent's name"
								/>
							</div>
						)}

						{/* Start Button */}
						<button
							onClick={handleStartGame}
							disabled={vsAI && isOffline}
							className={`w-full py-4 px-6 border-2 marcellus text-xl transition-colors ${
								vsAI && isOffline
									? 'bg-stone/50 text-white border-stone cursor-not-allowed'
									: 'bg-laurel text-white border-laurel hover:bg-laurel-dark'
							}`}
						>
							{vsAI && isOffline ? 'AI Requires Internet' : 'Start Game'}
						</button>
					</div>
				</div>
			</div>

			{/* Game Rules */}
			<div className="mt-6 p-6 bg-parchment border-2 border-stone">
				<h3 className="marcellus text-lg mb-3 text-black">Quick Rules</h3>
				<ul className="text-sm space-y-2 text-stone-dark">
					<li className="flex items-start gap-2">
						<span className="text-laurel mt-0.5">&#x2022;</span>
						<span>Move all 3 stones to the center goal to win</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-laurel mt-0.5">&#x2022;</span>
						<span>Each turn: Move 1 stone + Use 1 coin</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-laurel mt-0.5">&#x2022;</span>
						<span>Coins are disabled for 1 round after use</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-laurel mt-0.5">&#x2022;</span>
						<span>Walls block movement, bridges help connect cells</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-laurel mt-0.5">&#x2022;</span>
						<span>Rings can rotate and be locked</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default GameSetup;
