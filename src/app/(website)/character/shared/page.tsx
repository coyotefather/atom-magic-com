'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@mdi/react';
import {
	mdiAlertCircle,
	mdiArrowLeft,
	mdiAccountCircle,
	mdiAccountPlus,
	mdiSword,
	mdiShieldOutline,
	mdiBookOpenPageVariant,
	mdiCurrencyUsd,
	mdiPaw,
	mdiNumeric,
} from '@mdi/js';
import { CharacterState } from '@/lib/slices/characterSlice';
import { decompressCharacter, reinitializeDerivedFields } from '@/lib/characterSharing';
import {
	createNewCharacterId,
	saveCharacterById,
	setActiveCharacter,
} from '@/lib/characterPersistence';
import FunctionButton from '@/app/components/common/FunctionButton';

export default function SharedCharacterPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [character, setCharacter] = useState<CharacterState | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	// Parse and validate character data on mount
	useEffect(() => {
		const compressedData = searchParams.get('c');

		if (!compressedData) {
			setError('No character data found in URL');
			return;
		}

		const decompressed = decompressCharacter(compressedData);

		if (!decompressed) {
			setError('Invalid or corrupted character data');
			return;
		}

		const fullCharacter = reinitializeDerivedFields(decompressed);
		setCharacter(fullCharacter);
	}, [searchParams]);

	const handleAddToRoster = async () => {
		if (!character) return;

		setIsAdding(true);

		try {
			const id = createNewCharacterId();
			saveCharacterById(id, character);
			setActiveCharacter(id);
			router.push('/character');
		} catch (err) {
			setError('Failed to save character. Please try again.');
			setIsAdding(false);
		}
	};

	// Error state
	if (error) {
		return (
			<main className="notoserif min-h-screen bg-parchment dark:bg-black">
				<div className="container px-6 md:px-8 py-8">
					<Link
						href="/character"
						className="inline-flex items-center gap-2 text-stone dark:text-stone-light hover:text-gold transition-colors mb-8"
					>
						<Icon path={mdiArrowLeft} size={0.75} />
						<span>Back to Character Manager</span>
					</Link>

					<div className="max-w-lg mx-auto">
						<div className="bg-white dark:bg-black border-2 border-oxblood p-8 text-center">
							<div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-oxblood/10 border-2 border-oxblood">
								<Icon path={mdiAlertCircle} size={1.5} className="text-oxblood" />
							</div>

							<h1 className="marcellus text-2xl text-black dark:text-white mb-2">
								Invalid Share Link
							</h1>

							<p className="text-stone dark:text-stone-light mb-6">
								{error}
							</p>

							<FunctionButton
								variant="primary"
								onClick={() => router.push('/character')}
							>
								Go to Character Manager
							</FunctionButton>
						</div>
					</div>
				</div>
			</main>
		);
	}

	// Loading state
	if (!character) {
		return (
			<main className="notoserif min-h-screen bg-parchment dark:bg-black">
				<div className="container px-6 md:px-8 py-8">
					<div className="text-center py-16">
						<p className="text-stone dark:text-stone-light">Loading character...</p>
					</div>
				</div>
			</main>
		);
	}

	// Character display
	return (
		<main className="notoserif min-h-screen bg-parchment dark:bg-black">
			<div className="container px-6 md:px-8 py-8">
				{/* Back link */}
				<Link
					href="/character"
					className="inline-flex items-center gap-2 text-stone dark:text-stone-light hover:text-gold transition-colors mb-8"
				>
					<Icon path={mdiArrowLeft} size={0.75} />
					<span>Back to Character Manager</span>
				</Link>

				{/* Header card */}
				<div className="bg-white dark:bg-black border-2 border-stone p-6 md:p-8 mb-6">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
						<div>
							<p className="text-sm uppercase tracking-wider text-stone dark:text-stone-light mb-1">
								Shared Character
							</p>
							<h1 className="marcellus text-3xl md:text-4xl text-black dark:text-white mb-2">
								{character.name || 'Unnamed Character'}
							</h1>
							{(character.age > 0 || character.pronouns) && (
								<p className="text-stone dark:text-stone-light">
									{character.age > 0 && `${character.age} years old`}
									{character.age > 0 && character.pronouns && ' | '}
									{character.pronouns}
								</p>
							)}
						</div>

						<FunctionButton
							variant="primary"
							icon={mdiAccountPlus}
							onClick={handleAddToRoster}
							isDisabled={isAdding}
						>
							{isAdding ? 'Adding...' : 'Add to My Roster'}
						</FunctionButton>
					</div>
				</div>

				{/* Description */}
				{character.description && (
					<div className="bg-white dark:bg-black border-2 border-stone p-6 mb-6">
						<p className="text-stone-dark dark:text-stone-light italic">
							{character.description}
						</p>
					</div>
				)}

				{/* Character details grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					{/* Identity */}
					<div className="bg-white dark:bg-black border-2 border-stone p-6">
						<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
							<Icon path={mdiAccountCircle} size={0.875} className="text-oxblood" />
							Identity
						</h2>

						<div className="space-y-3">
							{character.culture && (
								<div>
									<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
										Culture
									</p>
									<p className="text-black dark:text-white font-medium">
										{character.culture}
									</p>
								</div>
							)}
							{character.path && (
								<div>
									<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
										Path
									</p>
									<p className="text-black dark:text-white font-medium">
										{character.path}
									</p>
								</div>
							)}
							{character.patronage && (
								<div>
									<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
										Patronage
									</p>
									<p className="text-black dark:text-white font-medium">
										{character.patronage}
									</p>
								</div>
							)}
							{!character.culture && !character.path && !character.patronage && (
								<p className="text-stone dark:text-stone-light italic">
									No identity information set
								</p>
							)}
						</div>
					</div>

					{/* Scores */}
					<div className="bg-white dark:bg-black border-2 border-stone p-6">
						<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
							<Icon path={mdiNumeric} size={0.875} className="text-gold" />
							Scores
						</h2>

						{character.scores.length > 0 ? (
							<div className="grid grid-cols-2 gap-3">
								{character.scores.map((score) => (
									<div key={score._id} className="bg-parchment dark:bg-stone-dark/20 p-3">
										<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
											{score.title}
										</p>
										<p className="marcellus text-xl text-black dark:text-white">
											{score.value ?? 0}
										</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-stone dark:text-stone-light italic">
								No scores assigned
							</p>
						)}
					</div>

					{/* Disciplines & Techniques */}
					<div className="bg-white dark:bg-black border-2 border-stone p-6">
						<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
							<Icon path={mdiBookOpenPageVariant} size={0.875} className="text-laurel" />
							Disciplines & Techniques
						</h2>

						<div className="space-y-4">
							<div>
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-2">
									Disciplines ({character.disciplines.length})
								</p>
								{character.disciplines.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{character.disciplines.map((id) => (
											<span
												key={id}
												className="px-2 py-1 bg-laurel/10 border border-laurel text-sm text-laurel"
											>
												{id}
											</span>
										))}
									</div>
								) : (
									<p className="text-stone dark:text-stone-light italic text-sm">
										None selected
									</p>
								)}
							</div>

							<div>
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-2">
									Techniques ({character.techniques.length})
								</p>
								{character.techniques.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{character.techniques.map((id) => (
											<span
												key={id}
												className="px-2 py-1 bg-bronze/10 border border-bronze text-sm text-bronze"
											>
												{id}
											</span>
										))}
									</div>
								) : (
									<p className="text-stone dark:text-stone-light italic text-sm">
										None selected
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Gear */}
					<div className="bg-white dark:bg-black border-2 border-stone p-6">
						<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
							<Icon path={mdiSword} size={0.875} className="text-bronze" />
							Gear
						</h2>

						{character.gear.length > 0 ? (
							<div className="space-y-2">
								{character.gear.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between p-2 bg-parchment dark:bg-stone-dark/20"
									>
										<div className="flex items-center gap-2">
											<Icon
												path={item.type === 'weapon' ? mdiSword : mdiShieldOutline}
												size={0.625}
												className="text-stone"
											/>
											<span className="text-black dark:text-white">
												{item.name}
											</span>
										</div>
										<span className="text-xs uppercase text-stone dark:text-stone-light">
											{item.type}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-stone dark:text-stone-light italic">
								No gear equipped
							</p>
						)}
					</div>

					{/* Wealth */}
					<div className="bg-white dark:bg-black border-2 border-stone p-6">
						<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
							<Icon path={mdiCurrencyUsd} size={0.875} className="text-gold" />
							Wealth
						</h2>

						<div className="grid grid-cols-4 gap-3">
							<div className="text-center p-2 bg-parchment dark:bg-stone-dark/20">
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
									Silver
								</p>
								<p className="marcellus text-lg text-black dark:text-white">
									{character.wealth.silver}
								</p>
							</div>
							<div className="text-center p-2 bg-parchment dark:bg-stone-dark/20">
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
									Gold
								</p>
								<p className="marcellus text-lg text-gold">
									{character.wealth.gold}
								</p>
							</div>
							<div className="text-center p-2 bg-parchment dark:bg-stone-dark/20">
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
									Lead
								</p>
								<p className="marcellus text-lg text-black dark:text-white">
									{character.wealth.lead}
								</p>
							</div>
							<div className="text-center p-2 bg-parchment dark:bg-stone-dark/20">
								<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
									Uranium
								</p>
								<p className="marcellus text-lg text-laurel">
									{character.wealth.uranium}
								</p>
							</div>
						</div>
					</div>

					{/* Animal Companion */}
					{character.animalCompanion.name && (
						<div className="bg-white dark:bg-black border-2 border-stone p-6">
							<h2 className="marcellus text-lg mb-4 flex items-center gap-2">
								<Icon path={mdiPaw} size={0.875} className="text-laurel" />
								Animal Companion
							</h2>

							<div className="space-y-2">
								<div>
									<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
										Name
									</p>
									<p className="text-black dark:text-white font-medium">
										{character.animalCompanion.name}
									</p>
								</div>
								{character.animalCompanion.details && (
									<div>
										<p className="text-xs uppercase tracking-wider text-stone dark:text-stone-light mb-1">
											Details
										</p>
										<p className="text-stone-dark dark:text-stone-light text-sm">
											{character.animalCompanion.details}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Bottom CTA */}
				<div className="bg-white dark:bg-black border-2 border-gold p-6 text-center">
					<p className="text-stone dark:text-stone-light mb-4">
						Add this character to your roster to edit and use them in your games.
					</p>
					<FunctionButton
						variant="primary"
						icon={mdiAccountPlus}
						onClick={handleAddToRoster}
						isDisabled={isAdding}
					>
						{isAdding ? 'Adding...' : 'Add to My Roster'}
					</FunctionButton>
				</div>
			</div>
		</main>
	);
}
