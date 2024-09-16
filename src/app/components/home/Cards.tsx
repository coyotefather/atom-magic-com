import CustomCard from '@/app/components/common/CustomCard';

const Cards = () => {
	return (
		<div className="mb-32 mt-16 w-full grid grid-cols-3 gap-8">
			<CustomCard
				type="category"
				title="Codex"
				description="Lore and Rules for Atom Magic."
				url="/codex"
				imagePath="/Wheel_of_Cardinals.svg"
				showImage={true} />
			<CustomCard
				type="category"
				title="Character Manager"
				description="Build and manage a new character in minutes."
				url="/character"
				imagePath="/Wheel_of_Cardinals.svg"
				showImage={true} />
			<CustomCard
				type="category"
				title="Vorago"
				description="Play a game of Vorago with a friend."
				url="/vorago"
				imagePath="/vorago.png"
				showImage={true} />
		</div>
	);
};

export default Cards;