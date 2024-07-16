import Image from 'next/image';
import LinkButton from '@/app/components/common/LinkButton';

const Card = ({
		image, button, title, description
	}: {
		image: {
			src: string,
			alt: string,
			width: number,
			height: number,
			priority: boolean
		},
		button: {
			href: string,
			variant: string,
			text: string
		},
		title: string,
		description: string
	}) => {
	return (
		<div>
		  <div className="flex h-40 mb-4">
			<Image
			  className="object-cover"
			  src={image.src}
			  alt={image.alt}
			  width={image.width}
			  height={image.height}
			  priority={image.priority} />
		  </div>
		  <div>
			<h2 className="text-xl pb-2">{title}</h2>
			<p className="pb-2">{description}</p>
			<LinkButton
			  href={button.href}
			  variant={button.variant}>{button.text}</LinkButton>
		  </div>
		</div>
	);
};

export default Card;