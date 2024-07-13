import Link from 'next/link';

const Breadcrumb = ({
		name, href
	}: {
		name: string,
		href: string
	}) => {
	return (
		<>
			<Link href={href}>{name}</Link>
			<span> / </span>
		</>
	);
};

const Breadcrumbs = ({
		page, parents = []
	}: {
		page: string,
		parents: { name: string, href: string }[]
	}) => {
	let breadcrumbs = (
		<>
			{parents.map((parent) => (
				<Breadcrumb key={parent.name} href={parent.href} name={parent.name} />
			))}
 		{page}
		</>
	);

	return (
		<div className="w-full text-sm pb-4">
			<a href="https://atom-magic.com" title="Atom Magic">Home</a> / {breadcrumbs}
		</div>
	);
};

export default Breadcrumbs;