import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const NavBar = () => {
	return (
		<header className="sticky z-50 top-0 p-2 bg-black flex flex-row items-center justify-between">
			<Link href="/">
				<Image
					src="/AtomMagicLogoLight.svg"
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