'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

const Footer = () => {
	const pathname = usePathname();
	const currentYear = new Date().getFullYear();

	const isActive = (href: string) => {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	};

	const mainLinks = [
		{ href: '/codex', name: 'Codex' },
		{ href: '/character', name: 'Character Manager' },
		{ href: '/vorago', name: 'Vorago' },
	];

	const toolLinks = [
		{ href: '/tools', name: 'All Tools' },
		{ href: '/generator', name: 'Character Generator' },
		{ href: '/dice', name: 'Dice Roller' },
		{ href: '/creatures', name: 'Creature Roller' },
		{ href: '/encounters', name: 'Encounter Builder' },
		{ href: '/adventure-log', name: 'Adventure Log' },
		{ href: '/loot', name: 'Loot Roller' },
		{ href: '/quick-reference', name: 'Quick Reference' },
	];

	const resourceLinks = [
		{ href: '/codex/entries/getting-started', name: 'Getting Started' },
		{ href: '/codex/timeline', name: 'Timeline' },
		{ href: '/contact', name: 'Contact' },
	];

	const legalLinks = [
		{ href: '/privacy-policy', name: 'Privacy Policy' },
		{ href: '/cookies', name: 'Cookie Policy' },
		{ href: '/disclaimers', name: 'Disclaimers' },
	];

	return (
		<footer
			className="notoserif bg-black text-white"
			role="contentinfo"
			aria-label="Site footer"
		>
			{/* Gold accent line */}
			<div className="h-1 bg-gold" />

			<div className="container px-6 md:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
					{/* Brand column */}
					<div className="lg:col-span-1">
						<Link href="/" className="inline-block mb-4">
							<Image
								src="/AtomMagicLogoLight.svg"
								alt="Atom Magic - Return to homepage"
								width={180}
								height={20}
								priority
							/>
						</Link>
						<p className="lapideum tracking-[0.4em] leading-6 text-xxs text-stone-light mb-4">
							THEURGIA ATOMI
							<br />
							<span className="text-xxxs">
								SŌLITŪDINEM FACIUNT
								<br />
								PĀCEM APPELLANT
							</span>
						</p>
						<a
							href="https://store.atom-magic.com"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-black marcellus uppercase tracking-wider text-xs hover:bg-brightgold transition-colors no-underline"
						>
							Visit Store
							<Icon path={mdiOpenInNew} size={0.625} aria-hidden="true" />
							<span className="sr-only">(opens in new tab)</span>
						</a>
					</div>

					{/* Main links */}
					<nav aria-label="Main pages">
						<h3 className="marcellus text-sm uppercase tracking-wider text-gold mb-4">
							Explore
						</h3>
						<ul className="space-y-2">
							{mainLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={`text-sm transition-colors no-underline ${
											isActive(link.href)
												? 'text-gold'
												: 'text-stone-light hover:text-gold'
										}`}
										aria-current={isActive(link.href) ? 'page' : undefined}
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Tool links */}
					<nav aria-label="Tools">
						<h3 className="marcellus text-sm uppercase tracking-wider text-gold mb-4">
							Tools
						</h3>
						<ul className="space-y-2">
							{toolLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={`text-sm transition-colors no-underline ${
											isActive(link.href)
												? 'text-gold'
												: 'text-stone-light hover:text-gold'
										}`}
										aria-current={isActive(link.href) ? 'page' : undefined}
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Resource links */}
					<nav aria-label="Resources">
						<h3 className="marcellus text-sm uppercase tracking-wider text-gold mb-4">
							Resources
						</h3>
						<ul className="space-y-2">
							{resourceLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={`text-sm transition-colors no-underline ${
											isActive(link.href)
												? 'text-gold'
												: 'text-stone-light hover:text-gold'
										}`}
										aria-current={isActive(link.href) ? 'page' : undefined}
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Legal links */}
					<nav aria-label="Legal">
						<h3 className="marcellus text-sm uppercase tracking-wider text-gold mb-4">
							Legal
						</h3>
						<ul className="space-y-2">
							{legalLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={`text-sm transition-colors no-underline ${
											isActive(link.href)
												? 'text-gold'
												: 'text-stone-light hover:text-gold'
										}`}
										aria-current={isActive(link.href) ? 'page' : undefined}
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>

				{/* Bottom bar */}
				<div className="mt-12 pt-6 border-t border-stone/30">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-stone-light">
						<p>
							&copy; {currentYear} Adam J. Butler. All rights reserved.
						</p>
						<p>
							Content available under{' '}
							<a
								href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gold hover:text-brightgold transition-colors"
							>
								CC BY-NC-SA 4.0
								<span className="sr-only">
									{' '}
									(Creative Commons Attribution-NonCommercial-ShareAlike 4.0,
									opens in new tab)
								</span>
							</a>{' '}
							unless otherwise noted.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
