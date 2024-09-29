'use client';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { initAdditionalScores, setAdditionalScores } from "@/lib/slices/characterSlice";
import ExternalLink from '@/app/components/common/ExternalLink';
import {
	ADDITIONAL_SCORES_QUERYResult,
} from "../../../../../../sanity.types";

const AdditionalScores = ({
		additionalScores
	}:{
		additionalScores: ADDITIONAL_SCORES_QUERYResult
	}) => {
	const dispatch = useAppDispatch();
	const scores = useAppSelector(state => state.character.score);

	useEffect( () => {
		dispatch(initAdditionalScores(additionalScores));
	},[]);

	const addScores = useAppSelector(state => state.character.additionalScores);

	useEffect( () => {
		dispatch(setAdditionalScores());
	},[scores]);

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