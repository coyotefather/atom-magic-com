import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Section from '@/app/components/common/Section';

const Page = () => {
	return (
		<main className="inconsolata container min-h-screen pt-12">
			<Header name="Character Manager">
				<Breadcrumbs
					page="Character Manager"
					parents={[
						  { href: "/tools", name: "Tools" }
					]}
				/>
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Section className="bg-black">
  				Top section.
			</Section>
		</main>
	);
};

export default Page;