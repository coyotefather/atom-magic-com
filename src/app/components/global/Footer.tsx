import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Footer = () => {
	return (
		<footer className="bg-black min-h-56">
			<Nav
				items={NAVIGATION_LINKS}
				extended={true}
				navClasses="flex justify-end" />
		</footer>
	);
};

export default Footer;