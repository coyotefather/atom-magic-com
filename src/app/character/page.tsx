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
			<Section name="The Basics.">
				<div>
					  <p>Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
					</p>
					<p>
						  For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
					</p>
				</div>
			</Section>
			<Section variant="dark" name="Roll your character.">
				<div>
  					<p>It's time to roll and set the base numbers for each stat. You can adjust the spread of points across each sub state for any stat category.
					</p>
					<p>
  						<button>sdfsdf</button>
					</p>
				</div>
			</Section>
		</main>
	);
};

export default Page;