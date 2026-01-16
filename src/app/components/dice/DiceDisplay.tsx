'use client';

import { useEffect, useState } from 'react';
import { RollResult } from './DiceRoller';
import Icon from '@mdi/react';
import { mdiDice6 } from '@mdi/js';

interface DiceDisplayProps {
	result: RollResult | null;
	isRolling: boolean;
}

const DiceDisplay = ({ result, isRolling }: DiceDisplayProps) => {
	const [displayValue, setDisplayValue] = useState<number | null>(null);
	const [animationValues, setAnimationValues] = useState<number[]>([]);

	// Animate random numbers while rolling
	useEffect(() => {
		if (isRolling) {
			const interval = setInterval(() => {
				// Generate random display values for animation
				const randomValue = Math.floor(Math.random() * 20) + 1;
				setDisplayValue(randomValue);
				setAnimationValues(
					Array.from({ length: 3 }, () => Math.floor(Math.random() * 20) + 1)
				);
			}, 75);

			return () => clearInterval(interval);
		} else if (result) {
			setDisplayValue(result.total);
			setAnimationValues(result.rolls);
		}
	}, [isRolling, result]);

	const formatNotation = () => {
		if (!result) return '';
		let notation = `${result.numDice}${result.dieType}`;
		if (result.modifier > 0) notation += `+${result.modifier}`;
		if (result.modifier < 0) notation += `${result.modifier}`;
		return notation;
	};

	// Empty state
	if (!result && !isRolling) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="w-24 h-24 flex items-center justify-center border-2 border-stone/30 mb-4">
					<Icon path={mdiDice6} size={3} className="text-stone/30" />
				</div>
				<p className="text-stone text-sm">Select dice and roll to begin</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-8">
			{/* Main result display */}
			<div
				className={`relative mb-6 transition-transform duration-100 ${
					isRolling ? 'animate-pulse scale-105' : ''
				}`}
			>
				<div
					className={`w-32 h-32 flex items-center justify-center border-4 ${
						isRolling ? 'border-stone bg-parchment' : 'border-gold bg-white'
					}`}
				>
					<span
						className={`marcellus text-5xl font-bold ${
							isRolling ? 'text-stone' : 'text-black'
						}`}
					>
						{displayValue}
					</span>
				</div>

				{/* Corner decorations */}
				<div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold" />
				<div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold" />
				<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold" />
				<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold" />
			</div>

			{/* Roll notation */}
			{!isRolling && result && (
				<div className="text-center">
					<p className="marcellus text-lg text-stone-dark mb-2">
						{formatNotation()}
					</p>

					{/* Individual rolls breakdown */}
					{result.rolls.length > 1 && (
						<div className="flex flex-wrap items-center justify-center gap-2 mb-2">
							{result.rolls.map((roll, idx) => (
								<span
									key={idx}
									className="inline-flex items-center justify-center w-8 h-8 bg-parchment border border-stone/30 text-sm marcellus"
								>
									{roll}
								</span>
							))}
							{result.modifier !== 0 && (
								<span className="text-stone marcellus">
									{result.modifier > 0 ? '+' : ''}
									{result.modifier}
								</span>
							)}
						</div>
					)}

					{/* Single die with modifier */}
					{result.rolls.length === 1 && result.modifier !== 0 && (
						<p className="text-sm text-stone">
							{result.rolls[0]} {result.modifier > 0 ? '+' : ''}
							{result.modifier} = {result.total}
						</p>
					)}
				</div>
			)}

			{/* Rolling indicator */}
			{isRolling && (
				<p className="marcellus text-stone animate-pulse">Rolling...</p>
			)}
		</div>
	);
};

export default DiceDisplay;
