// ./app/(blog)/posts/[slug]/page.tsx

import { QueryParams } from "next-sanity";
import { notFound } from "next/navigation";

import { ENTRIES_QUERY, ENTRY_QUERY } from "@/sanity/lib/queries";

import { client, sanityFetch } from "@/sanity/lib/client";
import {
  ENTRY_QUERYResult,
  ENTRIES_QUERYResult,
} from "../../../../../../sanity.types";
import { Entry } from "@/app/components/codex/Entry";

export async function generateStaticParams() {
  const entries = await client.fetch<ENTRIES_QUERYResult>(
	ENTRIES_QUERY,
	{},
	{ perspective: "published" }
  );

  return entries.map((entry) => ({
	slug: entry?.slug?.current,
  }));
}

export default async function Page({ params }: { params: QueryParams }) {
  const entry = await sanityFetch<ENTRY_QUERYResult>({
	query: ENTRY_QUERY,
	params,
  });
  if (!entry) {
	return notFound();
  }
  return (
    <main>
      <Entry entry={entry} />
    </main>
  );
}