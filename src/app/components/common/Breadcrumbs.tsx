/**
 * Breadcrumbs.tsx
 *
 * Navigation breadcrumb trail showing the user's current location within a
 * page hierarchy. Renders a horizontal list of ancestor pages (each as a
 * clickable gold link) followed by the current page title (plain, non-linked
 * text). A "/" separator appears after every ancestor link.
 *
 * The entire nav sits on a black pill background so it can be placed on any
 * background color without clashing.
 *
 * Exports two components:
 *   - BreadcrumbItem  — a single crumb (link or plain text) with optional separator.
 *   - Breadcrumbs (default) — the full trail, composed from a `parents` array
 *     plus a `currentPage` string.
 *
 * Props (Breadcrumbs):
 *   - currentPage: string    — label for the active (non-linked) page
 *   - parents: { title, url }[] — ordered list of ancestor pages; rendered in
 *     the order supplied, each followed by a separator
 *
 * Used by:
 *   - Codex entry pages (src/app/(website)/codex/...)
 */

import clsx from 'clsx';

export const BreadcrumbItem = ({
		title,
		url,
		showSeparator = false
	}:{
		title: string,
		url: string | null,
		showSeparator: boolean
	}) => {

	let separator = (<></>);
	if(showSeparator) {
		separator = (
			<span
				data-slot="separator"
				aria-hidden="true"
				className="{text-foreground/50 px-2">/</span>
		);
	}
	let item = (<></>);
	if(url) {
		item = (
			<a
				href={url}
				className=
					"flex items-center text-gold whitespace-nowrap line-clamp-1  outline-hidden hover:contrast-100 hover:saturate-150 hover:brightness-100 cursor-pointer hover:text-brightgold">
				{title}
			</a>
		);
	} else {
		item = (
			<span className="flex items-center whitespace-nowrap line-clamp-1  outline-hidden">{title}</span>
		);
	}
	return (
		<li className="flex items-center p-0 m-0">
			{item}
			{separator}
		</li>
	);
}

const Breadcrumbs = ({
		currentPage,
		parents
	}:{
		currentPage: string,
		parents: {
			title: string,
			url: string
		}[]
	}) => {
	return (
		<nav aria-label="Breadcrumbs" className="inline-block pb-2 pt-1 px-4 text-md bg-black rounded-full text-white text-sm not-prose">
			<ol className="flex flex-wrap list-none p-0 m-0">
				{parents.map( (p, index) => (
					<BreadcrumbItem
						key={`${p.title}-${index}`}
						title={p.title}
						url={p.url}
						showSeparator={true} />
				))}
				<BreadcrumbItem
					title={currentPage}
					url={null}
					showSeparator={false} />
			</ol>
		</nav>
	);
}

export default Breadcrumbs;