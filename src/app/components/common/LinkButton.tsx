import Link from 'next/link';
import clsx from 'clsx';

const LinkButton = ({
	href = '',
	variant = 'primary',
	children,
}: {
	href: string;
	variant?: 'primary' | 'secondary';
	children: React.ReactNode;
}) => {
	return (
		<Link
			href={href}
			className={clsx(
				'inline-block px-8 py-3 marcellus uppercase tracking-widest text-sm font-bold transition-colors no-underline',
				{
					'bg-gold text-black hover:bg-brightgold': variant === 'primary',
					'border-2 border-gold text-gold bg-transparent hover:bg-gold/10':
						variant === 'secondary',
				}
			)}
		>
			{children}
		</Link>
	);
};

export default LinkButton;