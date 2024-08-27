import Link from "next/link";
import Icon from '@mdi/react';
import { mdiFolderText, mdiFileDocument } from '@mdi/js';

const Hit = ({
		hit
	}: {
		hit: {
			type: string,
			rev: string,
			title: string,
			path: string,
			body: string
		}
	}) => {

	return (
		<div className="mb-8 flex flex-row">
				<Icon className="mr-2 my-auto align-center" path={ hit.type === "category" ? mdiFolderText : mdiFileDocument} size={2} />
			<div>
				<div className="text-xl">
					<Link href={`/codex/entries/${hit.path}`}>
						{hit.title}
					</Link>
				</div>
				<p className="text-sm">
					{hit.body.slice(0, 200) + '...'}
				</p>
			</div>
		</div>
	);
};

export default Hit;