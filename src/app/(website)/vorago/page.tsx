'use client';

import VoragoHero from '@/app/components/vorago/VoragoHero';
import VoragoBoard from '@/app/components/vorago/VoragoBoard';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import GameStatus from '@/app/components/vorago/GameStatus';
import GameSetup from '@/app/components/vorago/GameSetup';
import StoneTray from '@/app/components/vorago/StoneTray';
import { useAppSelector } from '@/lib/hooks';
import { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiArrowLeft, mdiLightbulbOnOutline, mdiTrophy } from '@mdi/js';

const Page = () => {
	const { gameWin, winner, player1Name, player2Name, isAIThinking } =
		useAppSelector((state) => state.vorago);
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
		<main className="notoserif min-h-screen bg-parchment">
			<VoragoHero compact={gameStarted && !gameWin} />

			<div className="container mx-auto py-8 md:py-12 px-6 md:px-8">
				{!gameStarted ? (
					/* Setup Screen */
					<GameSetup onStart={() => setGameStarted(true)} />
				) : gameWin ? (
					/* Win Screen */
					<div className="max-w-2xl mx-auto text-center">
						<div className="bg-black text-white border-2 border-laurel">
							{/* Green accent line */}
							<div className="h-1 bg-laurel" />

							<div className="p-8 md:p-12">
								<div className="flex justify-center mb-6">
									<div className="w-16 h-16 flex items-center justify-center border-2 border-laurel">
										<Icon path={mdiTrophy} size={1.75} className="text-laurel" />
									</div>
								</div>

								<h2 className="marcellus text-4xl md:text-5xl mb-4 text-white">
									Victory!
								</h2>
								<p className="text-xl text-stone-light mb-8">
									<span className="text-laurel font-bold">
										{winner === 1 ? player1Name : player2Name}
									</span>{' '}
									has reached the center with all three stones.
								</p>
								<button
									onClick={() => setGameStarted(false)}
									className="bg-laurel text-white py-3 px-8 marcellus text-xl border-2 border-laurel hover:bg-laurel-dark transition-colors"
								>
									Play Again
								</button>
							</div>
						</div>
					</div>
				) : (
					/* Game Board */
					<div className="space-y-4">
						{/* Top row: Game Status and controls */}
						<div className="flex items-center gap-3">
							<div className="flex-grow">
								<GameStatus />
							</div>

							{/* Tips popup trigger */}
							<div className="relative" ref={tipsRef}>
								<button
									onClick={() => setShowTips(!showTips)}
									className="py-2 px-3 bg-white text-stone border-2 border-stone hover:border-laurel hover:text-laurel transition-colors flex items-center gap-1.5"
								>
									<Icon path={mdiLightbulbOnOutline} size={0.75} />
									<span className="text-sm marcellus">Tips</span>
								</button>
								{showTips && (
									<div className="absolute right-0 top-12 z-50 bg-white border-2 border-stone p-4 shadow-lg w-72">
										<div className="h-1 bg-laurel -mt-4 -mx-4 mb-4" />
										<h4 className="marcellus text-sm mb-2 text-black">
											Quick Tips
										</h4>
										<ul className="space-y-1.5 text-xs text-stone-dark">
											<li className="flex items-start gap-2">
												<span className="text-laurel">&#x2022;</span>
												<span>Click your stone to select, then click a cell to move</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-laurel">&#x2022;</span>
												<span>All coins have a cooldown of one round</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-laurel">&#x2022;</span>
												<span>Complete both actions to end turn</span>
											</li>
										</ul>
									</div>
								)}
							</div>

							<button
								onClick={() => setGameStarted(false)}
								className="py-2 px-3 bg-white text-stone border-2 border-stone hover:border-laurel hover:text-laurel transition-colors flex items-center gap-1.5"
							>
								<Icon path={mdiArrowLeft} size={0.75} />
								<span className="text-sm marcellus">Back</span>
							</button>
						</div>

						{/* Main area: Board and Coins side by side */}
						<div className="relative">
							<div
								className={`grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start transition-opacity ${isAIThinking ? 'opacity-50 pointer-events-none' : ''}`}
							>
								{/* Left: Stone Tray + Board */}
								<div className="space-y-4">
									<StoneTray />
									<div className="bg-white p-4 border-2 border-stone">
										<VoragoBoard />
									</div>
								</div>

								{/* Right: Coins */}
								<div className="bg-white border-2 border-stone">
									<div className="h-1 bg-laurel" />
									<div className="p-4">
										<h3 className="marcellus text-lg mb-3 text-center text-black">
											Cardinal Coins
										</h3>
										<CoinSelector />
									</div>
								</div>
							</div>

							{/* AI Thinking Overlay */}
							{isAIThinking && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="bg-black text-white px-8 py-6 shadow-2xl text-center border-2 border-laurel">
										<div className="h-1 bg-laurel -mt-6 -mx-8 mb-6" />
										<div className="flex items-center justify-center gap-3 mb-3">
											<div
												className="w-3 h-3 bg-laurel animate-bounce"
												style={{ animationDelay: '0ms' }}
											></div>
											<div
												className="w-3 h-3 bg-laurel animate-bounce"
												style={{ animationDelay: '150ms' }}
											></div>
											<div
												className="w-3 h-3 bg-laurel animate-bounce"
												style={{ animationDelay: '300ms' }}
											></div>
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
