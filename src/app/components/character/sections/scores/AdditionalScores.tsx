'use client';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import { setShield, setReputation, setResurrectionDuration } from "@/app/lib/slices/characterSlice";
import { SCORES } from '@/app/lib/global-data';
import ExternalLink from '@/app/components/common/ExternalLink';

const AdditionalScores = () => {
	const dispatch = useAppDispatch();
	const shield = useAppSelector(state => state.character.scores.additionalScores.shield);
	const reputation = useAppSelector(state => state.character.scores.additionalScores.reputation);
	const resurrectionDuration = useAppSelector(state => state.character.scores.additionalScores.resurrectionDuration);
	const speed = useAppSelector(state => state.character.scores.physical.subscores.speed);
	const endurance = useAppSelector(state => state.character.scores.physical.subscores.endurance);
	const charm = useAppSelector(state => state.character.scores.interpersonal.subscores.charm);
	const speech = useAppSelector(state => state.character.scores.interpersonal.subscores.speech);
	const criticalThinking = useAppSelector(state => state.character.scores.intellect.subscores.criticalThinking);
	const judgement = useAppSelector(state => state.character.scores.intellect.subscores.judgement);
	const mentalStability = useAppSelector(state => state.character.scores.psyche.subscores.mentalStability);
	const emotionalStability = useAppSelector(state => state.character.scores.psyche.subscores.emotionalStability);

	useEffect( () => {
		dispatch(setShield());
	},[endurance, mentalStability]);

	useEffect( () => {
		dispatch(setReputation());
	},[speech, charm, criticalThinking, judgement]);

	useEffect( () => {
		dispatch(setResurrectionDuration());
	},[speed, endurance, mentalStability, emotionalStability]);

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white container">
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
						<div className="flex justify-between">
							<div className="text-md align-top pl-0 border-b">
								<ExternalLink href="https://atom-magic.com/codex/Shield"
								name="Shield" />
							</div>
							<div className="text-md align-top pl-0">
								{SCORES.additionalScores.shield.description}
							</div>
							<div className="text-md text-base pl-0 border-b">
								{shield}
							</div>
						</div>
						<div className="flex justify-between">
							<div className="text-md align-top pl-0 border-b">
								<ExternalLink href="https://atom-magic.com/codex/Reputation"
								name="Reputation" />
							</div>
							<div className="text-md align-top pl-0">
								{SCORES.additionalScores.reputation.description}
							</div>
							<div className="text-md text-base pl-0 border-b">
								{reputation}
							</div>
						</div>
						<div className="flex justify-between">
							<div className="text-md align-top pl-0">
								<ExternalLink href="https://atom-magic.com/codex/Resurrection_Duration"
								name="Resurrection Duration" />
							</div>
							<div className="text-md align-top pl-0">
								{SCORES.additionalScores.resurrectionDuration.description}
							</div>
							<div className="text-md text-base pl-0">
								{resurrectionDuration} hours
							</div>
						</div>
					</div>

			</div>
		</div>
	);
};

export default AdditionalScores;