import indexer, { flattenBlocks } from "sanity-algolia";
import algoliasearch from 'algoliasearch';
import {createClient } from '@sanity/client';
import { NextRequest, NextResponse } from "next/server";

const algolia = algoliasearch(
  '578IHPAJAF',
  process.env.ALGOLIA_ADMIN_API_KEY || ""
)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2021-03-25',
  useCdn: false,
})

export async function POST(req: NextRequest) {
  try {
	const sanityAlgolia = indexer(
	  {
		post: {
		  index: algolia.initIndex("posts"),
		},
		entry: {
		  index: algolia.initIndex("entries"),
		},
		category: {
		  index: algolia.initIndex("categories"),
		},
	  },
	  (document) => {
		console.log(document);
		switch (document._type) {
		  case "post":
			return {
			  title: document.title,
			  path: document.slug["current"],
			  categories: document.categories,
			  body: flattenBlocks(document.body)
			};
		case "entry":
		return {
		  title: document.title,
		  path: document.slug["current"],
		  categories: document.categories,
		  body: flattenBlocks(document.body),
		};
		case "category":
		return {
		  title: document.title,
		  path: document.slug["current"],
		  description: flattenBlocks(document.description),
		};
		  default:
			return document;
		}
	  }
	);

	const body = await req.json();

	const webhook = await sanityAlgolia.webhookSync(client, body).then( () => NextResponse.json({ msg: "lessgoo" }) );

	return webhook;

  } catch (err) {
	let error_response = {
	  status: "error",
	  msg: err,
	};
	return new NextResponse(JSON.stringify(error_response));
  }
}