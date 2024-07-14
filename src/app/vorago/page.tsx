import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Section from '@/app/components/common/Header';

const Page = () => {
	return (
		<main className="inconsolata min-h-screen pt-12">
			<Header name="Vorago">
				<Breadcrumbs
					page="Vorago"
					parents={[
						{ href: "/tools", name: "Tools" }
					]}
				/>
				Coming soon!
			</Header>
			<Section name="Play Vorago">
				Game board here.
			</Section>
		</main>
	);
};

export default Page;