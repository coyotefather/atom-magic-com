'use client';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { CREATURES_QUERY_RESULT } from '../../../../sanity.types';
import Icon from '@mdi/react';
import { mdiShield, mdiShieldOutline, mdiSword, mdiOpenInNew } from '@mdi/js';

type Creature = CREATURES_QUERY_RESULT[number];

interface CreatureCardProps {
	creature: Creature;
	isSelected?: boolean;
}

const CreatureCard = ({ creature, isSelected = false }: CreatureCardProps) => {
	const challengeLevelColors: Record<string, string> = {
		trivial: 'bg-stone/20 text-stone',
		easy: 'bg-laurel/20 text-laurel',
		moderate: 'bg-gold/20 text-gold',
		hard: 'bg-bronze/20 text-bronze',
		deadly: 'bg-oxblood/20 text-oxblood',
	};

	const challengeLevel = creature.challengeLevel || 'moderate';

	return (
		<article
			className={`bg-parchment border-2 transition-all ${
				isSelected ? 'border-bronze shadow-lg' : 'border-stone'
			}`}
		>
			{/* Header with image */}
			<div className="relative h-48 bg-black/10">
				{creature.mainImage?.asset && (
					<Image
						src={urlFor(creature.mainImage).width(600).height(400).url()}
						alt={creature.mainImage.alt || creature.name || 'Creature image'}
						fill
						className="object-cover"
					/>
				)}
				{/* Challenge level badge */}
				<div className="absolute top-3 right-3">
					<span
						className={`px-2 py-1 text-xs marcellus uppercase tracking-wider ${
							challengeLevelColors[challengeLevel]
						}`}
					>
						{challengeLevel}
					</span>
				</div>
				{/* Creature type badge */}
				{creature.creatureType && (
					<div className="absolute bottom-3 left-3">
						<span className="px-2 py-1 text-xs bg-black/70 text-white marcellus">
							{creature.creatureType}
						</span>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Name */}
				<h3 className="marcellus text-xl text-black mb-2">{creature.name}</h3>

				{/* Description */}
				{creature.description && (
					<p className="text-sm text-stone mb-4 line-clamp-2">
						{creature.description}
					</p>
				)}

				{/* Stats grid */}
				<div className="grid grid-cols-4 gap-2 mb-4">
					<div className="text-center p-2 bg-white border border-stone/30">
						<div className="text-xs text-stone uppercase tracking-wider mb-1">
							PHY
						</div>
						<div className="marcellus text-lg text-black">
							{creature.physical || 10}
						</div>
					</div>
					<div className="text-center p-2 bg-white border border-stone/30">
						<div className="text-xs text-stone uppercase tracking-wider mb-1">
							INT
						</div>
						<div className="marcellus text-lg text-black">
							{creature.interpersonal || 10}
						</div>
					</div>
					<div className="text-center p-2 bg-white border border-stone/30">
						<div className="text-xs text-stone uppercase tracking-wider mb-1">
							ITE
						</div>
						<div className="marcellus text-lg text-black">
							{creature.intellect || 10}
						</div>
					</div>
					<div className="text-center p-2 bg-white border border-stone/30">
						<div className="text-xs text-stone uppercase tracking-wider mb-1">
							PSY
						</div>
						<div className="marcellus text-lg text-black">
							{creature.psyche || 10}
						</div>
					</div>
				</div>

				{/* Combat stats */}
				<div className="flex items-center gap-4 text-sm text-stone mb-4">
					{creature.damage && (
						<div className="flex items-center gap-1">
							<Icon path={mdiSword} size={0.625} className="text-oxblood" />
							<span>{creature.damage}</span>
						</div>
					)}
					{(creature.physicalShield || 0) > 0 && (
						<div className="flex items-center gap-1">
							<Icon path={mdiShield} size={0.625} className="text-stone" />
							<span>{creature.physicalShield}</span>
						</div>
					)}
					{(creature.psychicShield || 0) > 0 && (
						<div className="flex items-center gap-1">
							<Icon
								path={mdiShieldOutline}
								size={0.625}
								className="text-laurel"
							/>
							<span>{creature.psychicShield}</span>
						</div>
					)}
					{(creature.armorCapacity || 0) > 0 && (
						<div className="flex items-center gap-1">
							<span className="text-xs uppercase">AC</span>
							<span>{creature.armorCapacity}</span>
						</div>
					)}
				</div>

				{/* Special abilities */}
				{creature.specialAbilities && creature.specialAbilities.length > 0 && (
					<div className="mb-4">
						<h4 className="text-xs text-stone uppercase tracking-wider mb-2">
							Special Abilities
						</h4>
						<div className="space-y-2">
							{creature.specialAbilities.map((ability) => (
								<div
									key={ability._key}
									className="text-sm bg-white p-2 border-l-2 border-bronze"
								>
									<span className="font-semibold">{ability.name}</span>
									{ability.description && (
										<span className="text-stone"> — {ability.description}</span>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Environments */}
				{creature.environments && creature.environments.length > 0 && (
					<div className="flex flex-wrap gap-1 mb-4">
						{creature.environments.map((env, idx) => (
							<span
								key={idx}
								className="px-2 py-0.5 text-xs bg-stone/10 text-stone"
							>
								{env}
							</span>
						))}
					</div>
				)}

				{/* Tags */}
				<div className="flex items-center gap-2 mb-4">
					{creature.isSwarm && (
						<span className="px-2 py-0.5 text-xs bg-laurel/20 text-laurel">
							Swarm
						</span>
					)}
					{creature.isUnique && (
						<span className="px-2 py-0.5 text-xs bg-gold/20 text-gold">
							Unique
						</span>
					)}
				</div>

				{/* Link to full entry */}
				{creature.slug && (
					<Link
						href={`/codex/entries/${creature.slug.current}`}
						className="inline-flex items-center gap-1 text-sm text-bronze hover:text-gold transition-colors"
					>
						View full Codex entry
						<Icon path={mdiOpenInNew} size={0.5} />
					</Link>
				)}
			</div>
		</article>
	);
};

export default CreatureCard;
