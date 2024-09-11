import { Search } from '@/app/components/global/search/Search'; // change this with the path to your <Search> component

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
