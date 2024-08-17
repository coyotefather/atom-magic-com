import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Sections from '@/app/components/character/Sections';

const Page = () => {
	return (
		<main className="inconsolata">
			<Header name="Character Manager">
				<Breadcrumbs
					page="Character Manager"
					parents={[]}
				/>
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Sections />
		</main>
	);
};

export default Page;