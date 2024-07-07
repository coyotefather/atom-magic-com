import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Footer = ({...props}) => {
	return (
		<Nav
		  items={NAVIGATION_LINKS}
		  extended={true}
		  {...props} />
	);
};

export default Footer;