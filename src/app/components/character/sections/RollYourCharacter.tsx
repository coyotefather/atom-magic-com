import Button from '@/app/components/common/Button';

const RollYourCharacter = () => {
	return (
		<div className="grid grid-flow-col auto-cols-auto">
			<div>
				It's time to roll and set the base numbers for each stat.<br />You can adjust the spread of points across each sub state for any stat category.
			</div>
			<div>
				<Button
				  href=""
				  variant="gradient">Roll Character</Button>
			</div>
		</div>
	);
};

export default RollYourCharacter;