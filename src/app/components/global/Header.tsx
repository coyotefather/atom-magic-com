import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Header = ({...props}) => {
	return (
		<Nav
		  items={NAVIGATION_LINKS}
		  extended={false}
		  {...props} />
	);
};

export default Header;