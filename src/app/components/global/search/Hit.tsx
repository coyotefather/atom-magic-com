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
		<div className="mb-8 flex flex-col">
			<div className="text-xl">
				<Link className="transition duration-150 ease-in flex flex-row items-center" href={`/codex/entries/${hit.path}`}>
					<Icon className="mr-2 my-auto align-center" path={ hit.type === "category" ? mdiFolderText : mdiFileDocument} size={1} />
					{hit.title}
				</Link>
			</div>
			<div className="text-sm ml-8">
				{hit.body.length > 200 ? hit.body.slice(0, 250) + '...' : hit.body}
			</div>
		</div>
	);
};

export default Hit;