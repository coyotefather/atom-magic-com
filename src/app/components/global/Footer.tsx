import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Footer = ({font}) => {
	return (
		<div>
			<Nav
				items={NAVIGATION_LINKS}
				extended={true}
				className={font + " flex z-10 justify-end"} />
		</div>
	);
};

export default Footer;