import { notFound } from 'next/navigation';
import { ENTRIES_QUERY, UNIFIED_ENTRY_QUERY } from '@/sanity/lib/queries';
import { client } from '@/sanity/lib/client';
import {
	UNIFIED_ENTRY_QUERY_RESULT,
	ENTRIES_QUERY_RESULT,
} from '../../../../../../sanity.types';
import { UnifiedEntry } from '@/app/components/codex/UnifiedEntry';

export async function generateStaticParams() {
	const entries = await client.fetch<ENTRIES_QUERY_RESULT>(
		ENTRIES_QUERY,
		{},
		{ perspective: 'published' }
	);

	return entries.map((entry) => ({
		slug: entry?.slug?.current,
	}));
}

const options = { next: { revalidate: 30 } };

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const entry = await client.fetch<UNIFIED_ENTRY_QUERY_RESULT>(
		UNIFIED_ENTRY_QUERY,
		await params,
		options
	);

	if (!entry) {
		return notFound();
	}

	return (
		<main>
			<UnifiedEntry entry={entry} />
		</main>
	);
}
