'use client';
import { SCORES } from '@/app/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks'
import ExternalLink from '@/app/components/common/ExternalLink';

const AdditionalScores = () => {
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
								<ExternalLink href="https://atom-magic.com/codex/Some_Score"
								name="Some score" />
							</div>
							<div className="text-md text-base pl-0 border-b">
								20
							</div>
						</div>
						<div className="flex justify-between">
							<div className="text-md align-top pl-0 border-b">
								<ExternalLink href="https://atom-magic.com/codex/Some_Score"
								name="Some score" />
							</div>
							<div className="text-md text-base pl-0 border-b">
								20
							</div>
						</div>
						<div className="flex justify-between">
							<div className="text-md align-top pl-0">
								<ExternalLink href="https://atom-magic.com/codex/Some_Score"
								name="Some score" />
							</div>
							<div className="text-md text-base pl-0">
								20
							</div>
						</div>
					</div>

			</div>
		</div>
	);
};

export default AdditionalScores;