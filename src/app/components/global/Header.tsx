import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Header = ({font}) => {
	return (
		<div className="sticky top-0">
			<Nav
				items={NAVIGATION_LINKS}
				extended={false}
				className={font + " flex z-10 justify-start"} />
		</div>
	);
};

export default Header;