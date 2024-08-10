import Score from '@/app/components/character/sections/scores/Score';
import { SCORES, PATHS, GEAR } from '@/app/lib/global-data';

// hardcode path for now until store is built
const curPath = PATHS.find((path) => path.value === "theurgist");

// hardcode gear until store is built
const gear = {
	weapon: GEAR.weapons['theurgist'].find((weapon) => weapon.key === "basicStaffOfEndurance"),
	armor: GEAR.armor['theurgist'].find((weapon) => weapon.key === "basicCloakOfEndurance"),
};

let pathModifiersMap = new Map<string, number>([]);
let gearModifiersMap = new Map<string, number>([]);

if(curPath){
	curPath.modifiers.forEach((score) =>  {
		score.modifier.forEach((m) => {
			pathModifiersMap.set(m.id, m.value);
		});
	});
}

if(gear.weapon && gear.armor) {
	gear.weapon.modifiers.forEach((m) =>  {
		gearModifiersMap.set(m.key, m.value);
	});
	gear.armor.modifiers.forEach((m) =>  {
		let check = gearModifiersMap.get(m.key);
		if(check) {
			gearModifiersMap.set(m.key, (check + m.value));
		}
	});
}

const Scores = () => {
	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white container">
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pr-4">
					<Score score={SCORES.physical} pathModifiers={pathModifiersMap} />
					<Score score={SCORES.interpersonal} pathModifiers={pathModifiersMap} />
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="grid 2xl:grid-cols-2 xl:grid-cols-1 gap-8 pl-4">
					<Score score={SCORES.intellect} pathModifiers={pathModifiersMap} />
					<Score score={SCORES.psyche} pathModifiers={pathModifiersMap} />
				</div>
			</div>
		</div>
	);
};

export default Scores;