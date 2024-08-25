import algoliasearch from 'algoliasearch';
import { createClient } from '@sanity/client';
import indexer, { flattenBlocks } from 'sanity-algolia';

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

export default function handler(req, res) {
  const sanityAlgolia = indexer(
	{
		entry: {
			index: algolia.initIndex('entries'),
		},
		post: {
			index: algolia.initIndex('posts'),
		},
		category: {
			index: algolia.initIndex('categories'),
		},
	},
	document => {
	  switch (document._type) {
		case 'entry':
		  return {
			title: document.title,
			path: document.slug.current,
			publishedAt: document.publishedAt,
			excerpt: flattenBlocks(document.body),
		  };
		case 'post':
		  return {
			title: document.title,
			path: document.slug.current,
			publishedAt: document.publishedAt,
			excerpt: flattenBlocks(document.body),
		  };
		case 'category':
		  return {
			title: document.title,
			path: document.slug.current,
			excerpt: flattenBlocks(document.description),
		  };
		default:
		  throw new Error(`Unknown type: ${document.type}`);
	  }
	}
  );

  return sanityAlgolia
	.webhookSync(sanity, req.body)
	.then(() => res.status(200).send('ok'));
}