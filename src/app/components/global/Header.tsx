import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Header = ({font}) => {
	return (
		<header className="sticky z-50 top-0 bg-black">
			<Nav
				items={NAVIGATION_LINKS}
				extended={false}
				className={font + " flex justify-start"} />
		</header>
	);
};

export default Header;