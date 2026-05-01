/**
 * page.tsx — Algolia Search (/search)
 *
 * Full-page Algolia search for the Codex. Uses `force-dynamic` to avoid caching
 * (search results depend on the query param and must always be fresh).
 */
import { Search } from '@/app/components/global/search/Search';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
	  <main className="notoserif">
		  <div className="container">
			  <div className="mt-16 mb-16">
	  			<Search />
			  </div>
		  </div>
	  </main>
	  );
}
