import { algoliasearch } from "algoliasearch";
import { createClient } from "@sanity/client";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const algoliaAppId = process.env.ALGOLIA_APP_ID!;
const algoliaApiKey = process.env.ALGOLIA_API_KEY!;
const indexName = process.env.ALGOLIA_INDEX_NAME!;

const sanityProjectId = process.env.SANITY_PROJECT_ID!;
const sanityDataset = process.env.SANITY_DATASET!;
const webhookSecret = process.env.PAYLOAD_SECRET!;

const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);

const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: "2024-08-20",
  useCdn: false,
});

// Shape of documents fetched from Sanity for indexing
interface SanityDocument {
  _id: string;
  title: string;
  slug: { current: string };
  entryBody?: string;
  description?: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}

// Function to perform initial indexing
async function performInitialIndexing() {
  // Fetch all entry-like documents from Sanity (entries, creatures, disciplines, techniques, paths)
  const sanityData: SanityDocument[] = await sanityClient.fetch(`*[_type in ["entry", "creature", "discipline", "technique", "path"] && defined(slug.current)]{
	_id,
	"title": coalesce(title, name),
	slug,
	entryBody,
	description,
	_type,
	_createdAt,
	_updatedAt
  }`);

  const records = sanityData.map((doc) => ({
	objectID: doc._id,
	title: doc.title,
	path: doc.slug.current,
	// Truncating the body if it's too long.
	// Another approach: defining multiple records:
	// https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/how-to/indexing-long-documents/
	entryBody: doc.entryBody?.slice(0, 9500),
	description: doc.description,
	documentType: doc._type,
	_createdAt: doc._createdAt,
	_updatedAt: doc._updatedAt,
  }));

  // Save all records to Algolia
  await algoliaClient.saveObjects({
	indexName,
	objects: records,
  });

  return {
	message: `Successfully completed initial indexing! Indexed ${records.length} documents.`,
  };
}

export async function POST(request: Request) {
  try {
	const { searchParams } = new URL(request.url);
	const initialIndex = searchParams.get("initialIndex") === "true";

	// Perform initial indexing
	if (initialIndex) {
	  const response = await performInitialIndexing();
	  return Response.json(response);
	}

	// Validate webhook signature
	const signature = request.headers.get(SIGNATURE_HEADER_NAME);
	if (!signature) {
	  return Response.json(
		{ success: false, message: "Missing signature header" },
		{ status: 401 }
	  );
	}

	// Get request body for signature validation
	const body = await request.text();
	const isValid = await isValidSignature(body, signature, webhookSecret);

	if (!isValid) {
	  return Response.json(
		{ success: false, message: "Invalid signature" },
		{ status: 401 }
	  );
	}

	// Incremental updates based on webhook payload
	let payload;
	try {
	  payload = JSON.parse(body);
	} catch {
	  return Response.json({ error: "No payload provided" }, { status: 400 });
	}

	const { _id, operation, value } = payload;

	if (!operation || !_id || !value) {
	  return Response.json(
		{ error: "Invalid payload, missing required fields" },
		{ status: 400 }
	  );
	}

	if (operation === "delete") {
	  // Handle delete operation
	  await algoliaClient.deleteObject({
		indexName,
		objectID: _id,
	  });
	  return Response.json({
		message: `Successfully deleted object with ID: ${_id}`,
	  });
	} else {
		// create a copy and slice off to only 9000 - this prevents sending something over the size limit allowed by Algolia
		// Note: Sanity webhook projection already extracts slug.current as "path" and coalesce(title, name) as "title"
		const updatedValue = {
			_id: value._id,
			title: value.title,
			path: value.path,
			entryBody: value.entryBody?.slice(0, 9000),
			description: value.description,
			documentType: value._type,
			_createdAt: value._createdAt,
			_updatedAt: value._updatedAt
		}
	  // Add or update the document in Algolia
	  await algoliaClient.saveObject({
		indexName,
		body: {
		  ...updatedValue,
		  objectID: _id,
		},
	  });

	  return Response.json({
		message: `Successfully processed document with ID: ${_id}!`,
	  });
	}
  } catch (error) {
	const message = error instanceof Error ? error.message : 'Unknown error';
	// Return a 200 code so that Sanity does not try the request again
	return Response.json(
	  { error: "Error indexing objects", details: message },
	  { status: 200 }
	);
  }
}