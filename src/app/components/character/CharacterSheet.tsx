'use client';

import { useAppSelector } from '@/lib/hooks';
import {
	CULTURES_QUERY_RESULT,
	PATHS_QUERY_RESULT,
	PATRONAGES_QUERY_RESULT,
	DISCIPLINES_QUERY_RESULT,
} from '../../../../sanity.types';
import { calculateGearShieldBonuses } from '@/lib/utils/shield';

interface CharacterSheetProps {
	cultures: CULTURES_QUERY_RESULT;
	paths: PATHS_QUERY_RESULT;
	patronages: PATRONAGES_QUERY_RESULT;
	disciplines: DISCIPLINES_QUERY_RESULT;
}

const CharacterSheet = ({
	cultures,
	paths,
	patronages,
	disciplines,
}: CharacterSheetProps) => {
	const character = useAppSelector(state => state.character);

	// Resolve IDs to names
	const cultureName = cultures.find(c => c._id === character.culture)?.title || '—';
	const pathData = paths.find(p => p._id === character.path);
	const pathName = pathData?.title || '—';
	const patronageData = patronages.find(p => p._id === character.patronage);
	const patronageName = patronageData ? `${patronageData.title}, ${patronageData.epithet}` : '—';

	// Get discipline and technique names
	const disciplineNames = character.disciplines
		.map(id => disciplines.find(d => d._id === id)?.title)
		.filter(Boolean);

	const techniqueData = character.techniques
		.map(id => {
			for (const disc of disciplines) {
				const tech = disc.techniques?.find(t => t._id === id);
				if (tech) return { title: tech.title, latin: tech.latin };
			}
			return null;
		})
		.filter(Boolean) as { title: string | null; latin: string | null }[];

	// Calculate score averages and find shield values
	const getScoreAverage = (scoreId: string) => {
		const score = character.scores.find(s => s._id === scoreId);
		if (!score || !score.subscores.length) return 0;
		const total = score.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0);
		return Math.round(total / score.subscores.length);
	};

	// Find Physical and Psyche scores for shield calculation
	const physicalScore = character.scores.find(s => s.title === 'Physical');
	const psycheScore = character.scores.find(s => s.title === 'Psyche');
	const physicalAvg = physicalScore ? Math.round(
		physicalScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / physicalScore.subscores.length
	) : 0;
	const psycheAvg = psycheScore ? Math.round(
		psycheScore.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / psycheScore.subscores.length
	) : 0;

	// Get gear
	const armor = character.gear.find(g => g.type === 'armor');
	const weapons = character.gear.filter(g => g.type === 'weapon');
	const enhancementBonus = armor?.enhancement;

	// Get shield bonuses from gear
	const { physicalShieldBonus, psychicShieldBonus } = calculateGearShieldBonuses(character.gear);

	return (
		<div className="character-sheet hidden print:block bg-white text-black p-8 max-w-[8.5in] mx-auto">
			{/* Header */}
			<div className="border-b-4 border-black pb-4 mb-6">
				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-4xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-marcellus)' }}>
							{character.name || 'Unnamed Character'}
						</h1>
						<p className="text-lg text-gray-600 mt-1">
							{[
								character.age ? `${character.age} years` : null,
								character.pronouns,
							].filter(Boolean).join(' · ') || 'No details'}
						</p>
					</div>
					<div className="text-right text-sm">
						<div className="font-bold">ATOM MAGIC</div>
						<div className="text-gray-500">Character Sheet</div>
					</div>
				</div>
				{character.description && (
					<p className="mt-3 text-sm italic text-gray-700">{character.description}</p>
				)}
			</div>

			{/* Core Identity */}
			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="border-2 border-black p-3">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Culture</div>
					<div className="font-bold text-lg" style={{ fontFamily: 'var(--font-marcellus)' }}>{cultureName}</div>
				</div>
				<div className="border-2 border-black p-3">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Path</div>
					<div className="font-bold text-lg" style={{ fontFamily: 'var(--font-marcellus)' }}>{pathName}</div>
				</div>
				<div className="border-2 border-black p-3">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Patronage</div>
					<div className="font-bold text-lg" style={{ fontFamily: 'var(--font-marcellus)' }}>{patronageName}</div>
				</div>
			</div>

			{/* Shields & Defense */}
			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="bg-gray-100 border-2 border-black p-3 text-center">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Physical Shield</div>
					<div className="text-3xl font-bold">{physicalAvg + physicalShieldBonus}</div>
					<div className="text-xs text-gray-500">{physicalAvg} + {physicalShieldBonus}</div>
				</div>
				<div className="bg-gray-100 border-2 border-black p-3 text-center">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Psychic Shield</div>
					<div className="text-3xl font-bold">{psycheAvg + psychicShieldBonus}</div>
					<div className="text-xs text-gray-500">{psycheAvg} + {psychicShieldBonus}</div>
				</div>
				<div className="bg-gray-100 border-2 border-black p-3 text-center">
					<div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Armor Capacity</div>
					<div className="text-3xl font-bold">{armor?.capacity || 0}</div>
				</div>
			</div>

			{/* Scores */}
			<div className="mb-6">
				<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
					Scores
				</h2>
				<div className="grid grid-cols-4 gap-4">
					{character.scores.map(score => {
						const avg = score.subscores.length > 0
							? Math.round(score.subscores.reduce((sum, sub) => sum + (sub.value || 0), 0) / score.subscores.length)
							: 0;
						return (
							<div key={score._id} className="border border-gray-300">
								<div className="bg-black text-white px-2 py-1 text-sm font-bold flex justify-between">
									<span>{score.title}</span>
									<span>{avg}</span>
								</div>
								<div className="p-2 text-xs space-y-1">
									{score.subscores.map(sub => (
										<div key={sub._id} className="flex justify-between">
											<span>{sub.title}</span>
											<span className="font-bold">{sub.value}</span>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Disciplines & Techniques */}
			<div className="grid grid-cols-2 gap-6 mb-6">
				<div>
					<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
						Disciplines
					</h2>
					{disciplineNames.length > 0 ? (
						<ul className="text-sm space-y-1">
							{disciplineNames.map((name, i) => (
								<li key={i} className="flex items-center gap-2">
									<span className="w-2 h-2 bg-black" />
									{name}
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-400 italic">None selected</p>
					)}
				</div>
				<div>
					<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
						Techniques
					</h2>
					{techniqueData.length > 0 ? (
						<ul className="text-sm space-y-2">
							{techniqueData.map((tech, i) => (
								<li key={i} className="flex items-start gap-2">
									<span className="w-2 h-2 bg-black mt-1.5 shrink-0" />
									<div>
										<div>{tech.title}</div>
										{tech.latin && (
											<div className="text-xs text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-lapideum), monospace' }}>{tech.latin}</div>
										)}
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-400 italic">None selected</p>
					)}
				</div>
			</div>

			{/* Gear */}
			<div className="mb-6">
				<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
					Gear
				</h2>
				{character.gear.length > 0 ? (
					<div className="grid grid-cols-3 gap-4 text-sm">
						{/* Weapons */}
						<div>
							<div className="font-bold text-xs uppercase text-gray-500 mb-2">Weapons</div>
							{weapons.length > 0 ? (
								<ul className="space-y-1">
									{weapons.map((w, i) => (
										<li key={i}>
											<span className="font-medium">{w.name}</span>
											<span className="text-gray-500 text-xs ml-1">({w.damage})</span>
										</li>
									))}
								</ul>
							) : (
								<span className="text-gray-400 italic">None</span>
							)}
						</div>
						{/* Armor */}
						<div>
							<div className="font-bold text-xs uppercase text-gray-500 mb-2">Armor</div>
							{armor ? (
								<div>
									<span className="font-medium">{armor.name}</span>
									<div className="text-xs text-gray-500">
										Cap: {armor.capacity} | Phys: +{armor.physicalShieldBonus || 0} | Psy: +{armor.psychicShieldBonus || 0}
									</div>
								</div>
							) : (
								<span className="text-gray-400 italic">None</span>
							)}
						</div>
						{/* Enhancement */}
						<div>
							<div className="font-bold text-xs uppercase text-gray-500 mb-2">Enhancement</div>
							{enhancementBonus ? (
								<div>
									<span className="font-medium">{enhancementBonus.name}</span>
									<div className="text-xs text-gray-500">
										Phys: +{enhancementBonus.physicalShieldBonus || 0} | Psy: +{enhancementBonus.psychicShieldBonus || 0}
									</div>
								</div>
							) : (
								<span className="text-gray-400 italic">None</span>
							)}
						</div>
					</div>
				) : (
					<p className="text-sm text-gray-400 italic">No gear selected</p>
				)}
			</div>

			{/* Wealth & Companion */}
			<div className="grid grid-cols-2 gap-6">
				{/* Wealth */}
				<div>
					<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
						Wealth
					</h2>
					<div className="grid grid-cols-4 gap-2 text-center text-sm">
						<div className="border border-gray-300 p-2">
							<div className="text-xs text-gray-500">Silver</div>
							<div className="font-bold text-lg">{character.wealth.silver}</div>
						</div>
						<div className="border border-gray-300 p-2">
							<div className="text-xs text-gray-500">Gold</div>
							<div className="font-bold text-lg">{character.wealth.gold}</div>
						</div>
						<div className="border border-gray-300 p-2">
							<div className="text-xs text-gray-500">Lead</div>
							<div className="font-bold text-lg">{character.wealth.lead}</div>
						</div>
						<div className="border border-gray-300 p-2">
							<div className="text-xs text-gray-500">Uranium</div>
							<div className="font-bold text-lg">{character.wealth.uranium}</div>
						</div>
					</div>
				</div>

				{/* Animal Companion */}
				<div>
					<h2 className="text-lg font-bold border-b-2 border-black mb-3 pb-1" style={{ fontFamily: 'var(--font-marcellus)' }}>
						Animal Companion
					</h2>
					{character.animalCompanion.name ? (
						<div className="text-sm">
							<div className="font-bold">{character.animalCompanion.name}</div>
							{character.animalCompanion.details && (
								<p className="text-gray-600 mt-1">{character.animalCompanion.details}</p>
							)}
						</div>
					) : (
						<p className="text-sm text-gray-400 italic">None</p>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400 flex justify-between">
				<span>atom-magic.com</span>
				<span>Printed {new Date().toLocaleDateString()}</span>
			</div>
		</div>
	);
};

export default CharacterSheet;
