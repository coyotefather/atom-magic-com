import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/app/lib/global-data';

const Footer = () => {
	return (
		<footer className="bg-black">
			<Nav
				items={NAVIGATION_LINKS}
				extended={true}
				className="marcellus flex z-10 justify-end" />
		</footer>
	);
};

export default Footer;