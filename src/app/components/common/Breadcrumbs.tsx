
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
	return (
		<li className="flex items-center p-0 m-0">
			<a
				href={url ? url : "" }
				className={clsx(
					"flex items-center text-gold whitespace-nowrap line-clamp-1  outline-none hover:contrast-100 hover:saturate-150 hover:brightness-100",
					{'cursor-pointer hover:text-brightgold': url},
					{'cursor-default no-underline text-white hover:text-white': !url}
				)}>
				{title}
			</a>
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