'use client';
import { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initAdditionalScores, setAdditionalScores } from "@/lib/slices/characterSlice";
import ExternalLink from '@/app/components/common/ExternalLink';
import {
	ADDITIONAL_SCORES_QUERY_RESULT,
} from "../../../../../../sanity.types";

const AdditionalScores = ({
		additionalScores
	}:{
		additionalScores: ADDITIONAL_SCORES_QUERY_RESULT
	}) => {
	const dispatch = useAppDispatch();
	const scores = useAppSelector(state => state.character.scores);
	const gear = useAppSelector(state => state.character.gear);

	useEffect( () => {
		dispatch(initAdditionalScores(additionalScores));
	},[additionalScores, dispatch]);

	const addScores = useAppSelector(state => state.character.additionalScores);

	useEffect( () => {
		dispatch(setAdditionalScores());
	},[scores, dispatch]);

	// Calculate shield values dynamically
	const shieldValues = useMemo(() => {
		// Find Physical and Psyche scores
		const physicalScore = scores.find(s => s.title?.toLowerCase() === 'physical');
		const psycheScore = scores.find(s => s.title?.toLowerCase() === 'psyche');

		// Base shield values from scores
		let physicalShield = physicalScore?.value ?? 0;
		let psychicShield = psycheScore?.value ?? 0;

		// Add bonuses from gear (armor and enhancements)
		gear.forEach(item => {
			// Direct armor bonuses
			if (item.physicalShieldBonus) {
				physicalShield += item.physicalShieldBonus;
			}
			if (item.psychicShieldBonus) {
				psychicShield += item.psychicShieldBonus;
			}

			// Enhancement bonuses
			if (item.enhancement) {
				if (item.enhancement.physicalShieldBonus) {
					physicalShield += item.enhancement.physicalShieldBonus;
				}
				if (item.enhancement.psychicShieldBonus) {
					psychicShield += item.enhancement.psychicShieldBonus;
				}
			}
		});

		return {
			physical: physicalShield,
			psychic: psychicShield,
		};
	}, [scores, gear]);

	// Shield data for display
	const shieldScores = [
		{
			id: 'physical-shield',
			title: 'Physical Shield',
			description: 'Absorbs physical damage before armor. Regenerates 10% per round when disengaged.',
			value: shieldValues.physical,
			entry: { slug: { current: 'combat-shield-and-armor' } },
		},
		{
			id: 'psychic-shield',
			title: 'Psychic Shield',
			description: 'Protects against psychic attacks. Separate from Physical Shield.',
			value: shieldValues.psychic,
			entry: { slug: { current: 'combat-psychic' } },
		},
	];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x-2 bg-white container">
			<div className="pt-16 pb-16 pr-4">
				<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Additional Scores</h2>
				<p className="pb-2">
					In addition to the four categories of scores that you choose, there are several scores used for gameplay that are based upon the top four categories. Changing the scores above will affect what you see here.
				</p>
				<p className="pb-4">
					For more information on scoring, see <ExternalLink href="https://atom-magic.com/codex/Scores"
					name="Character scores" />.
				</p>
			</div>
			<div className="pt-16 pb-16 pl-4">
					<div className="marcellus text-3xl border-b-2 border-solid mb-4">&nbsp;</div>
					<div>
						{/* Shield Scores */}
						{shieldScores.map((s) => (
							<div key={s.id} className="w-full flex gap-4 mb-4 justify-between">
								<div className="w-36 text-md align-top pl-0 align-start">
									{s.entry && s.entry.slug ? <ExternalLink href={`https://atom-magic.com/codex/entries/${s.entry.slug.current}`}
									name={s.title} />:s.title}
								</div>
								<div className="w-1/2 text-md align-top pl-0 align-top">
									{s.description}
								</div>
								<div className="w-16 text-md text-base pl-0 flex justify-end font-semibold">
									{s.value}
								</div>
							</div>
						))}

						{/* Divider */}
						<div className="border-b border-stone/30 my-4"></div>

						{/* Other Additional Scores */}
						{addScores.map( (s) => (
							<div key={s._id} className="w-full flex gap-4 mb-4 justify-between">
								<div className="w-36 text-md align-top pl-0 align-start">
									{s.entry && s.entry.slug ? <ExternalLink href={`https://atom-magic.com/codex/entries/${s.entry.slug.current}`}
									name={s.title ? s.title : ""} />:s.title}
								</div>
								<div className="w-1/2 text-md align-top pl-0 align-top">
									{s.description}
								</div>
								<div className="w-16 text-md text-base pl-0 flex justify-end">
									{s.value}
								</div>
							</div>
						))}
					</div>

			</div>
		</div>
	);
};

export default AdditionalScores;
