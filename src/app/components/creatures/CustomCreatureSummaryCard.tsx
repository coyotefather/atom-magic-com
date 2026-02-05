'use client';

import { mdiHeart, mdiSword, mdiStarFourPoints } from '@mdi/js';
import IconLabel from '@/app/components/common/IconLabel';
import { CustomCreatureSummary } from '@/lib/customCreaturePersistence';

interface CustomCreatureSummaryCardProps {
	creature: CustomCreatureSummary;
	isActive: boolean;
	onClick: () => void;
}

const challengeLevelColors: Record<string, string> = {
	harmless: 'bg-stone/10 text-stone-dark',
	trivial: 'bg-stone/20 text-stone',
	easy: 'bg-laurel/20 text-laurel',
	moderate: 'bg-gold/20 text-gold',
	hard: 'bg-bronze/20 text-bronze',
	deadly: 'bg-oxblood/20 text-oxblood',
};

const CustomCreatureSummaryCard = ({
	creature,
	isActive,
	onClick,
}: CustomCreatureSummaryCardProps) => {
	return (
		<div
			className={`relative border-2 transition-colors cursor-pointer ${
				isActive
					? 'border-bronze bg-white'
					: 'border-stone/50 bg-white hover:border-bronze'
			}`}
			onClick={onClick}
		>
			<div className="p-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h3 className="marcellus text-base text-black truncate">
							{creature.name || 'Unnamed Creature'}
						</h3>
						<div className="flex items-center gap-2 mt-1">
							<span
								className={`px-1.5 py-0.5 text-xs marcellus uppercase tracking-wider ${
									challengeLevelColors[creature.challengeLevel] || challengeLevelColors.moderate
								}`}
							>
								{creature.challengeLevel}
							</span>
							{creature.creatureType && (
								<span className="text-xs text-stone">
									{creature.creatureType}
								</span>
							)}
						</div>
						<div className="flex items-center gap-3 mt-2 text-xs text-stone">
							<IconLabel icon={mdiHeart} iconColor="text-oxblood" size="xs">
								{creature.health}
							</IconLabel>
							{creature.attackCount > 0 && (
								<IconLabel icon={mdiSword} iconColor="text-bronze" size="xs">
									{creature.attackCount}
								</IconLabel>
							)}
							{creature.abilityCount > 0 && (
								<IconLabel icon={mdiStarFourPoints} iconColor="text-gold" size="xs">
									{creature.abilityCount}
								</IconLabel>
							)}
						</div>
					</div>
				</div>
			</div>
			{isActive && (
				<div className="absolute left-0 top-0 bottom-0 w-1 bg-bronze" />
			)}
		</div>
	);
};

export default CustomCreatureSummaryCard;
