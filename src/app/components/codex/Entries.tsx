// ./src/components/Entries.tsx

import { ENTRIES_QUERYResult } from "../../../../sanity.types";
import Hit from '@/app/components/global/search/Hit';

const Entries = ({ entries }: { entries: ENTRIES_QUERYResult }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Entries</h3>
		<div className="grid grid-cols-3 gap-4">
			{entries.map((e, index) => (
				<Hit key={`entry_${index}`} hit={
					{
						type: "entry",
						rev: "",
						title: e?.title ? e?.title : "Title",
						path: `/codex/entries/${e?.slug?.current}`,
						body: e?.description ? e?.description : "Description"
					}
				} />
			))}
		</div>
	</section>
  );
}

export default Entries;