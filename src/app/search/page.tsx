import { Search } from '@/app/components/global/search/Search'; // change this with the path to your <Search> component

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
	  <main className="inconsolata">
		  <div className="container">
	  		<Search />
		  </div>
	  </main>
	  );
}
