import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/lib/global-data';

const NavBar = () => {
	return (
		<header className="z-10 p-2 py-6 bg-gradient border-b-2 border-stone flex flex-row items-center justify-between">
			<Link href="/">
				<Image
					src="/AtomMagicLogoDark.svg"
					alt="Atom Magic Logo"
					className="inline-block my-2 ml-4"
					width={215}
					height={24}
					priority
					/>
			</Link>
			<Nav
				items={NAVIGATION_LINKS}
				extended={false}
				navClasses="inline-block pl-2 pr-2" />
		</header>
	);
};

export default NavBar;