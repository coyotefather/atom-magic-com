import Image from 'next/image';
import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const NavBar = () => {
	return (
		<header className="sticky z-50 top-0 pt-2 pb-2 bg-black flex">
			<div className="justify-start">
				<Image
			  	src="/AtomMagicLogoLight.svg"
			  	alt="Atom Magic Logo"
				className="inline-block"
			  	width={431}
			  	height={48}
			  	priority
				/>
				<Nav
					items={NAVIGATION_LINKS}
					extended={false}
					className="marcellus inline-block pl-2 pr-2" />
			</div>
		</header>
	);
};

export default NavBar;