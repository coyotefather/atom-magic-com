// ./app/(blog)/posts/[slug]/page.tsx

//import { QueryParams } from "next-sanity";
import { notFound } from "next/navigation";

import { CATEGORIES_QUERY, CATEGORY_QUERY } from "@/sanity/lib/queries";

import { client } from "@/sanity/lib/client";
import {
  CATEGORY_QUERY_RESULT,
  CATEGORIES_QUERY_RESULT,
} from "../../../../../../sanity.types";
import { Category } from "@/app/components/codex/Category";

export async function generateStaticParams() {
  const categories = await client.fetch<CATEGORIES_QUERY_RESULT>(
	CATEGORIES_QUERY,
	{},
	{ perspective: "published" }
  );

  return categories.map((category) => ({
	slug: category?.slug?.current,
  }));
}

const options = { next: { revalidate: 30 } };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const category = await client.fetch<CATEGORY_QUERY_RESULT>(CATEGORY_QUERY, await params, options);
  if (!category) {
	return notFound();
  }
  return (
    <main>
      <Category category={category} />
    </main>
  );
}