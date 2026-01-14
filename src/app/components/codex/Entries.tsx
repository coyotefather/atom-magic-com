import { ENTRIES_QUERY_RESULT } from '../../../../sanity.types';
import Hit from '@/app/components/global/search/Hit';

const Entries = ({ entries }: { entries: ENTRIES_QUERY_RESULT }) => {
	return (
		<section className="container px-6 md:px-8">
			<h3 className="marcellus text-2xl font-bold mb-6">Entries</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{entries.map((e, index) => (
					<Hit
						key={`entry_${index}`}
						hit={{
							type: 'entry',
							rev: '',
							title: e?.title ?? 'Title',
							path: `${e?.slug?.current}`,
							description: e?.description ?? '',
						}}
					/>
				))}
			</div>
		</section>
	);
};

export default Entries;
