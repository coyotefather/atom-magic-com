// ./app/(blog)/posts/[slug]/page.tsx

//import { QueryParams } from "next-sanity";
import { notFound } from "next/navigation";
import { ENTRIES_QUERY, ENTRY_QUERY } from "@/sanity/lib/queries";

import { client } from "@/sanity/lib/client";
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

const options = { next: { revalidate: 30 } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await client.fetch< ENTRY_QUERYResult>(ENTRY_QUERY, await params, options);
  if (!entry) {
	return notFound();
  }
  return (
    <main>
      <Entry entry={entry} />
    </main>
  );
}