'use client';

import { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiDice6, mdiHistory, mdiLightningBolt } from '@mdi/js';
import DiceDisplay from './DiceDisplay';
import DiceHistory from './DiceHistory';
import { useOptionalRollContext, DieType, RollResult } from '@/lib/RollContext';
import PageHero from '@/app/components/common/PageHero';

// Re-export types for backwards compatibility
export type { DieType, RollResult } from '@/lib/RollContext';

const DICE_TYPES: { type: DieType; max: number; label: string }[] = [
	{ type: 'd4', max: 4, label: 'D4' },
	{ type: 'd6', max: 6, label: 'D6' },
	{ type: 'd8', max: 8, label: 'D8' },
	{ type: 'd10', max: 10, label: 'D10' },
	{ type: 'd12', max: 12, label: 'D12' },
	{ type: 'd20', max: 20, label: 'D20' },
	{ type: 'd100', max: 100, label: 'D100' },
];

const PRESETS = [
	{ label: 'Attack (d20)', dieType: 'd20' as DieType, numDice: 1, modifier: 0 },
	{ label: 'Damage (d6)', dieType: 'd6' as DieType, numDice: 1, modifier: 0 },
	{ label: 'Damage (d8)', dieType: 'd8' as DieType, numDice: 1, modifier: 0 },
	{ label: 'Damage (d10)', dieType: 'd10' as DieType, numDice: 1, modifier: 0 },
	{ label: '2d6', dieType: 'd6' as DieType, numDice: 2, modifier: 0 },
	{ label: 'Percentile', dieType: 'd100' as DieType, numDice: 1, modifier: 0 },
];

const DiceRoller = () => {
	const [selectedDie, setSelectedDie] = useState<DieType>('d20');
	const [numDice, setNumDice] = useState(1);
	const [modifier, setModifier] = useState(0);
	const [isRolling, setIsRolling] = useState(false);
	const [currentResult, setCurrentResult] = useState<RollResult | null>(null);
	const [history, setHistory] = useState<RollResult[]>([]);
	const rollContext = useOptionalRollContext();

	const rollDice = useCallback((dieType: DieType, count: number, mod: number) => {
		setIsRolling(true);

		// Simulate rolling animation delay
		setTimeout(() => {
			const die = DICE_TYPES.find(d => d.type === dieType)!;
			const rolls: number[] = [];

			for (let i = 0; i < count; i++) {
				rolls.push(Math.floor(Math.random() * die.max) + 1);
			}

			const total = rolls.reduce((sum, r) => sum + r, 0) + mod;

			const result: RollResult = {
				id: crypto.randomUUID(),
				dieType,
				numDice: count,
				modifier: mod,
				rolls,
				total,
				timestamp: new Date(),
			};

			setCurrentResult(result);
			setHistory(prev => [result, ...prev].slice(0, 20));
			setIsRolling(false);

			// Broadcast roll to Adventure Log if context available
			if (rollContext) {
				rollContext.broadcastRoll(result);
			}
		}, 600);
	}, [rollContext]);

	const handleRoll = () => {
		rollDice(selectedDie, numDice, modifier);
	};

	const handlePreset = (preset: typeof PRESETS[0]) => {
		setSelectedDie(preset.dieType);
		setNumDice(preset.numDice);
		setModifier(preset.modifier);
		rollDice(preset.dieType, preset.numDice, preset.modifier);
	};

	const clearHistory = () => {
		setHistory([]);
	};

	const formatRollNotation = (dieType: DieType, count: number, mod: number) => {
		let notation = `${count}${dieType}`;
		if (mod > 0) notation += `+${mod}`;
		if (mod < 0) notation += `${mod}`;
		return notation;
	};

	return (
		<div className="min-h-screen bg-parchment">
			<PageHero
				title="Dice Roller"
				description="Roll dice for your Atom Magic sessions"
				icon={mdiDice6}
				accentColor="gold"
				variant="inline"
			/>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main roller area */}
					<div className="lg:col-span-2 space-y-6">
						{/* Dice result display */}
						<div className="bg-white border-2 border-stone p-8">
							<DiceDisplay
								result={currentResult}
								isRolling={isRolling}
							/>
						</div>

						{/* Dice selector */}
						<div className="bg-white border-2 border-stone p-6">
							<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
								<Icon path={mdiDice6} size={0.875} className="text-gold" />
								Select Dice
							</h2>

							{/* Die type buttons */}
							<div className="grid grid-cols-7 gap-2 mb-6">
								{DICE_TYPES.map(die => (
									<button
										key={die.type}
										onClick={() => setSelectedDie(die.type)}
										className={`py-3 px-2 marcellus text-sm font-bold uppercase tracking-wider transition-colors ${
											selectedDie === die.type
												? 'bg-gold text-black'
												: 'bg-parchment border-2 border-stone text-stone-dark hover:border-gold hover:text-gold'
										}`}
									>
										{die.label}
									</button>
								))}
							</div>

							{/* Number and modifier */}
							<div className="flex flex-wrap gap-4 mb-6">
								<div className="flex-1 min-w-[140px]">
									<label className="block text-xs uppercase tracking-wider text-stone mb-2">
										Number of Dice
									</label>
									<div className="flex items-center gap-2">
										<button
											onClick={() => setNumDice(Math.max(1, numDice - 1))}
											className="w-10 h-10 bg-parchment border-2 border-stone text-stone-dark hover:border-gold hover:text-gold transition-colors marcellus text-lg font-bold"
										>
											-
										</button>
										<input
											type="number"
											min="1"
											max="20"
											value={numDice}
											onChange={e => setNumDice(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
											className="w-16 h-10 text-center border-2 border-stone bg-white marcellus text-lg font-bold"
										/>
										<button
											onClick={() => setNumDice(Math.min(20, numDice + 1))}
											className="w-10 h-10 bg-parchment border-2 border-stone text-stone-dark hover:border-gold hover:text-gold transition-colors marcellus text-lg font-bold"
										>
											+
										</button>
									</div>
								</div>

								<div className="flex-1 min-w-[140px]">
									<label className="block text-xs uppercase tracking-wider text-stone mb-2">
										Modifier
									</label>
									<div className="flex items-center gap-2">
										<button
											onClick={() => setModifier(modifier - 1)}
											className="w-10 h-10 bg-parchment border-2 border-stone text-stone-dark hover:border-gold hover:text-gold transition-colors marcellus text-lg font-bold"
										>
											-
										</button>
										<input
											type="number"
											value={modifier}
											onChange={e => setModifier(parseInt(e.target.value) || 0)}
											className="w-16 h-10 text-center border-2 border-stone bg-white marcellus text-lg font-bold"
										/>
										<button
											onClick={() => setModifier(modifier + 1)}
											className="w-10 h-10 bg-parchment border-2 border-stone text-stone-dark hover:border-gold hover:text-gold transition-colors marcellus text-lg font-bold"
										>
											+
										</button>
									</div>
								</div>
							</div>

							{/* Roll button */}
							<button
								onClick={handleRoll}
								disabled={isRolling}
								className={`w-full py-4 marcellus uppercase tracking-widest text-lg font-bold transition-colors ${
									isRolling
										? 'bg-stone text-white cursor-not-allowed'
										: 'bg-gold text-black hover:bg-brightgold'
								}`}
							>
								{isRolling ? 'Rolling...' : `Roll ${formatRollNotation(selectedDie, numDice, modifier)}`}
							</button>
						</div>

						{/* Quick presets */}
						<div className="bg-white border-2 border-stone p-6">
							<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
								<Icon path={mdiLightningBolt} size={0.875} className="text-gold" />
								Quick Rolls
							</h2>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
								{PRESETS.map(preset => (
									<button
										key={preset.label}
										onClick={() => handlePreset(preset)}
										disabled={isRolling}
										className="py-2 px-3 bg-parchment border-2 border-stone text-sm marcellus hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
									>
										{preset.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* History sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-white border-2 border-stone p-6 sticky top-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="marcellus text-lg flex items-center gap-2">
									<Icon path={mdiHistory} size={0.875} className="text-gold" />
									History
								</h2>
								{history.length > 0 && (
									<button
										onClick={clearHistory}
										className="text-xs text-stone hover:text-oxblood transition-colors"
									>
										Clear
									</button>
								)}
							</div>
							<DiceHistory history={history} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DiceRoller;
