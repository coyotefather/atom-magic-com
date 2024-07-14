import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';
import Section from '@/app/components/common/Section';

const Page = () => {
	return (
		<main className="inconsolata min-h-screen pt-12">
			<Header name="Character Manager">
				<Breadcrumbs
					page="Character Manager"
					parents={[
						  { href: "/tools", name: "Tools" }
					]}
				/>
  				Create your player character and start your journey across the world of Solum.
			</Header>
			<Section variant="dark" name="The Basics">
				<div>
  					<p>Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
					</p>
					<p>
  						For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
					</p>
				</div>
			</Section>
		</main>
	);
};

export default Page;