import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Footer = ({font}) => {
	return (
		<footer>
			<Nav
				items={NAVIGATION_LINKS}
				extended={true}
				className={font + " flex z-10 justify-end"} />
		</footer>
	);
};

export default Footer;