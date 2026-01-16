'use client';

import { RollResult } from './DiceRoller';

interface DiceHistoryProps {
	history: RollResult[];
}

const DiceHistory = ({ history }: DiceHistoryProps) => {
	const formatNotation = (result: RollResult) => {
		let notation = `${result.numDice}${result.dieType}`;
		if (result.modifier > 0) notation += `+${result.modifier}`;
		if (result.modifier < 0) notation += `${result.modifier}`;
		return notation;
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	if (history.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-stone text-sm">No rolls yet</p>
				<p className="text-stone/60 text-xs mt-1">Your roll history will appear here</p>
			</div>
		);
	}

	return (
		<div className="space-y-2 max-h-[400px] overflow-y-auto">
			{history.map((result, idx) => (
				<div
					key={result.id}
					className={`p-3 border-l-2 transition-colors ${
						idx === 0
							? 'bg-gold/10 border-gold'
							: 'bg-parchment border-stone/30'
					}`}
				>
					<div className="flex items-center justify-between mb-1">
						<span className="marcellus text-sm font-semibold">
							{formatNotation(result)}
						</span>
						<span className="marcellus text-xl font-bold text-black">
							{result.total}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex flex-wrap gap-1">
							{result.rolls.map((roll, rollIdx) => (
								<span
									key={rollIdx}
									className="text-xs text-stone bg-white px-1.5 py-0.5 border border-stone/20"
								>
									{roll}
								</span>
							))}
							{result.modifier !== 0 && (
								<span className="text-xs text-stone">
									{result.modifier > 0 ? '+' : ''}
									{result.modifier}
								</span>
							)}
						</div>
						<span className="text-xs text-stone/60">
							{formatTime(result.timestamp)}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default DiceHistory;
