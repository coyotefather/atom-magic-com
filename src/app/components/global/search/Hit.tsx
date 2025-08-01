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
			description: string
		}
	}) => {

	return (
		<div className="mb-8 flex flex-col notoserif">
			<div className="text-xl">
				<Link className="transition duration-150 ease-in flex flex-row items-center" href={`/codex/entries/${hit.path}`}>
					<Icon className="mr-2 my-auto align-center" path={ hit.type === "category" ? mdiFolderText : mdiFileDocument} size={1} />
					{hit.title}
				</Link>
			</div>
			<div className="text-sm ml-8">
				{hit.description && hit.description.length > 200 ? hit.description.slice(0, 250) + '...' : hit.description}
			</div>
		</div>
	);
};

export default Hit;