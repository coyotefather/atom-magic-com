import Image from 'next/image';
import Nav from '@/app/components/common/Nav';
import { NAVIGATION_LINKS } from '@/lib/global-data';

const Footer = () => {
	return (
		<footer className="notoserif bg-black pt-8">
			<div className="container flex flex-row items-top justify-between pt-2">
				<div>
					<Image
					src="/AtomMagicLogoLight.svg"
					alt="Atom Magic Logo"
					className="inline-block mt-2 mb-4"
					width={215}
					height={24}
					priority
					/>
					<div className="text-white text-sm mb-8">
						<div className="mb-4 lapideum tracking-[0.75em] leading-5 text-xs">
							<div className="mb-2">
								THEURGIA ATOMI
							</div>
							<div>
								SŌLITŪDINEM FACIUNT<br />
								PĀCEM APPELLANT
							</div>
						</div>
						<div>
							<div>
								Copyright © Adam J. Butler 2024.
							</div>
							<div>
								Content is available under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow" target="_new" title="ATTRIBUTION-NONCOMMERCIAL-SHAREALIKE 4.0 INTERNATIONAL">Creative Commons Attribution-NonCommercial</a> unless otherwise noted.
							</div>
						</div>
					</div>
				</div>
				<div>
					<Nav
						items={NAVIGATION_LINKS}
						extended={true}
						navClasses="grid grid-cols-2 gap-2" />
				</div>
			</div>
		</footer>
	);
};

export default Footer;