import indexer from "sanity-algolia";
import algoliasearch from 'algoliasearch';
import { NextResponse } from "next/server";

const algolia = algoliasearch(
  '578IHPAJAF',
  process.env.ALGOLIA_ADMIN_API_KEY || ""
)

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  // If your dataset is private you need to add a read token.
  // You can mint one at https://manage.sanity.io,
  token: 'read-token',
  apiVersion: '2021-03-25',
  useCdn: false,
})

export async function POST(req) {
  try {
	const sanityAlgolia = indexer(
	  {
		entry: {
		  index: algolia.initIndex("entries"),
		},
		post: {
		  index: algolia.initIndex("posts"),
		},
		category: {
		  index: algolia.initIndex("categories"),
		},
	  },
	  (document) => {
		console.log(document);
		switch (document._type) {
		  case "entry":
			return {
			  name: document.name,
			  path: document.slug["current"],
			  body: document.body,
			};
		case "pointer-events-auto":
			return {
		  	name: document.name,
		  	path: document.slug["current"],
		  	body: document.body,
			};
		case "category":
			return {
		  	name: document.name,
		  	path: document.slug["current"],
		  	description: document.description,
			};
		  default:
			return document;
		}
	  }
	);

	const body = await req.json();

	const webhook = await sanityAlgolia.webhookSync(sanity, body);

	return webhook && NextResponse.json({ msg: "lessgoo" });
  } catch (err) {
	let error_response = {
	  status: "error",
	  msg: err,
	};
	return new NextResponse(JSON.stringify(error_response));
  }
}
