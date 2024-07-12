import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import Header from '@/app/components/common/Header';

const Page = () => {
	return (
		<main className="inconsolata container flex min-h-screen flex-col items-center justify-between p-24 pt-12">
		  <Breadcrumbs
			  page="Character Manager"
			  parents={[
				  { href: "/tools", name: "Tools" }
				]}
		 />
		  <Header title="Character Manager">
			  Coming soon!
		  </Header>

		</main>
	);
};

export default Page;