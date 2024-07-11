import Link from 'next/link';

const Breadcrumb = ({name, href}) => {
	return (
		<>
			<Link href={href}>{name}</Link>
			<span> / </span>
		</>
	);
};

const Breadcrumbs = ({page, parents = []}) => {
	let breadcrumbs = (
		<>
			{parents.map((parent) => (
				<Breadcrumb key={parent.name} href={parent.href} name={parent.name} />
			))}
 		{page}
		</>
	);

	return (
		<div className="w-full">
			<a href="https://atom-magic.com" alt="Atom Magic">Home</a> / {breadcrumbs}
		</div>
	);
};

export default Breadcrumbs;