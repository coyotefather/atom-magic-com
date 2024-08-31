// ./src/components/Entries.tsx

import { ENTRIES_QUERYResult } from "../../../../sanity.types";
import CustomCard from '@/app/components/common/CustomCard';

const Entries = ({ entries }: { entries: ENTRIES_QUERYResult }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Entries</h3>
		<div className="grid grid-cols-4 gap-4">
			{entries.map((e) => (
				<CustomCard
					key={e._id}
					type="entry"
					title={e?.title ? e?.title : "Title"}
					description={e?.description ? e?.description : "Description"}
					url={`/codex/entries/${e?.slug?.current}`}
					imagePath=""
					showImage={true} />
			))}
		</div>
	</section>
  );
}

export default Entries;