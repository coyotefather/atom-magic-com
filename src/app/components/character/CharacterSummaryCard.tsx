/**
 * CharacterSummaryCard.tsx
 *
 * A compact, clickable card that summarizes a single saved character. Used anywhere
 * the roster is displayed — both in the `CharacterRoster` management panel and in the
 * `CharacterGenerator` preview panel.
 *
 * Displays:
 *   - Character name (truncated if long)
 *   - Completion status icon: green checkmark if complete, clock if still in progress
 *   - Identity line: path · culture
 *   - Combat stats row: Physical Shield, Psychic Shield, Armor Capacity, discipline/technique count
 *   - Patronage name (if set), truncated and right-aligned
 *   - "Active" badge when `isActive` is true (highlights the border in gold)
 *
 * The card accepts a `CharacterSummary` object (from `characterPersistence.ts`), which
 * is a lightweight snapshot of the full character — just the fields needed for this
 * display without loading the entire CharacterState.
 *
 * Props:
 *   - character: CharacterSummary — the roster entry to display
 *   - isActive?: whether this character is currently loaded (changes border color)
 *   - onClick?: click handler for selecting the character
 *
 * Used by:
 *   - CharacterRoster.tsx (one card per saved character in the roster list)
 *   - CharacterGenerator.tsx (preview of a freshly generated character)
 */
'use client';

import Icon from '@mdi/react';
import {
	mdiShieldHalf,
	mdiShieldOutline,
	mdiCheckCircle,
	mdiProgressClock,
} from '@mdi/js';
import { CharacterSummary } from '@/lib/characterPersistence';

interface CharacterSummaryCardProps {
	character: CharacterSummary;
	isActive?: boolean;
	onClick?: () => void;
}

const CharacterSummaryCard = ({ character, isActive = false, onClick }: CharacterSummaryCardProps) => {
	return (
		<div
			onClick={onClick}
			className={`
				border-2 p-4 transition-all cursor-pointer
				${isActive
					? 'border-gold bg-gold/5'
					: 'border-stone/30 hover:border-stone hover:bg-parchment/50'
				}
			`}
		>
			{/* Header Row */}
			<div className="flex items-start justify-between gap-4 mb-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="marcellus text-xl truncate">
							{character.name || 'Unnamed Character'}
						</h3>
						{character.isComplete ? (
							<Icon
								path={mdiCheckCircle}
								size={0.75}
								className="text-laurel shrink-0"
								title="Character complete"
							/>
						) : (
							<Icon
								path={mdiProgressClock}
								size={0.75}
								className="text-stone shrink-0"
								title="In progress"
							/>
						)}
					</div>
					{/* Identity line */}
					<div className="text-sm text-stone mt-1">
						{[character.path, character.culture].filter(Boolean).join(' · ') || 'No path or culture selected'}
					</div>
				</div>

				{/* Active badge */}
				{isActive && (
					<span className="px-2 py-0.5 text-xs bg-gold/20 text-gold-dark marcellus uppercase shrink-0">
						Active
					</span>
				)}
			</div>

			{/* Stats Row */}
			<div className="flex items-center gap-4 text-sm">
				{/* Physical Shield */}
				<div className="flex items-center gap-1" title="Physical Shield">
					<Icon path={mdiShieldHalf} size={0.625} className="text-stone" />
					<span className="font-semibold">{character.physicalShield || '—'}</span>
				</div>

				{/* Psychic Shield */}
				<div className="flex items-center gap-1" title="Psychic Shield">
					<Icon path={mdiShieldOutline} size={0.625} className="text-stone" />
					<span className="font-semibold">{character.psychicShield || '—'}</span>
				</div>

				{/* Armor Capacity */}
				<div className="flex items-center gap-1 text-stone" title="Armor Capacity">
					<span className="text-xs uppercase">AC</span>
					<span className="font-semibold">{character.armorCapacity || '—'}</span>
				</div>

				{/* Disciplines */}
				{character.disciplineCount > 0 && (
					<div className="text-stone" title={`${character.disciplineCount} discipline(s), ${character.techniqueCount} technique(s)`}>
						{character.disciplineCount}D / {character.techniqueCount}T
					</div>
				)}

				{/* Patronage if set */}
				{character.patronage && (
					<div className="text-stone truncate ml-auto" title="Patronage">
						{character.patronage}
					</div>
				)}
			</div>
		</div>
	);
};

export default CharacterSummaryCard;
