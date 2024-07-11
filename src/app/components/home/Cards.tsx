import Card from '@/app/components/common/Card';

const Cards = () => {
	return (
		<div className="mb-32 w-full grid grid-cols-2">
			<Card
				image={ {
					src: "/Wheel_of_Cardinals.svg",
					alt: "Wheel of Cardinals",
					width: 400,
					height: 400,
					priority: true } }
			  button={ { href: "/character", text: "Manage a Character", variant: "gradient" } }
			  title="Character Manager"
			  description="Build and manage a new character in minutes." />
			<Card
			  image={ {
					src: "/vorago.png",
					alt: "Vorago",
					width: 400,
					height: 400,
					priority: true } }
			  button={ { href: "/vorage", text: "Play Vorago", variant: "gradient" } }
			  title="Vorago"
			  description="Play a game of Vorago with a friend." />
		</div>
	);
};

export default Cards;