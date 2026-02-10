import PageHero from '@/app/components/common/PageHero';
import MapClientContainer from '@/app/components/map/MapContainer';
import { mdiMap } from '@mdi/js';

export const metadata = {
	title: 'Map of Solum | Atom Magic',
	description: 'Explore the known world of Solum — pan, zoom, and discover regions linked to the Codex.',
};

const MapPage = () => {
	return (
		<main className="notoserif bg-parchment">
			<PageHero
				title="Map of Solum"
				description="Explore the known world of Solum"
				icon={mdiMap}
				accentColor="laurel"
				theme="light"
			/>

			<section className="py-8">
				<div className="container px-6 md:px-8">
					<MapClientContainer />
				</div>
			</section>
		</main>
	);
};

export default MapPage;
