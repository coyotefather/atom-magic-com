import Icon from '@mdi/react';
import { mdiOpenInNew } from '@mdi/js';

const ExternalLink = ({
		href,
		name
	}: {
		href: string,
		name: string
	}) => {
	return (
		<a href={href} target="_new" className="hover:text-sunset-red font-extrabold">
			{name}
			<Icon className="ml-1 inline-block align-baseline" size={0.5} path={mdiOpenInNew} />
		</a>
	);
};

export default ExternalLink;