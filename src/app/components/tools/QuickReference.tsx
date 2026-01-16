'use client';

import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiSword, mdiShield, mdiAlert, mdiDice6, mdiHeart, mdiLightningBolt } from '@mdi/js';

interface ReferenceSection {
	id: string;
	title: string;
	icon: string;
	content: React.ReactNode;
}

const sections: ReferenceSection[] = [
	{
		id: 'combat-flow',
		title: 'Combat Flow',
		icon: mdiSword,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Turn Structure</h4>
					<ol className="list-decimal list-inside text-sm text-stone space-y-1">
						<li>Roll Initiative (d20 + Reflex)</li>
						<li>Take your turn: Move + Action</li>
						<li>Reactions occur between turns</li>
					</ol>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Action Types</h4>
					<ul className="text-sm text-stone space-y-1">
						<li><span className="font-semibold text-black">Standard Action:</span> Attack, cast technique, use item</li>
						<li><span className="font-semibold text-black">Move Action:</span> Move up to your speed</li>
						<li><span className="font-semibold text-black">Quick Action:</span> Draw weapon, speak, drop item</li>
						<li><span className="font-semibold text-black">Reaction:</span> Respond to triggers (1/round)</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		id: 'shields-armor',
		title: 'Shields & Armor',
		icon: mdiShield,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Damage Flow</h4>
					<div className="flex items-center gap-2 text-sm text-stone mb-2">
						<span className="px-2 py-1 bg-stone/10">Shield</span>
						<span>→</span>
						<span className="px-2 py-1 bg-stone/10">Armor</span>
						<span>→</span>
						<span className="px-2 py-1 bg-oxblood/10 text-oxblood">Health</span>
					</div>
					<p className="text-sm text-stone">Shields absorb damage first. Remaining damage hits armor capacity. Once armor is depleted, damage causes injuries.</p>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Shield Types</h4>
					<ul className="text-sm text-stone space-y-1">
						<li><span className="font-semibold text-black">Physical Shield:</span> Physical score + armor/enhancement bonuses</li>
						<li><span className="font-semibold text-black">Psychic Shield:</span> Psyche score + armor/enhancement bonuses</li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Armor Capacity</h4>
					<p className="text-sm text-stone">Separate from shields. Represents physical protection that absorbs damage after shields are depleted.</p>
				</div>
			</div>
		),
	},
	{
		id: 'damage-types',
		title: 'Damage Types',
		icon: mdiLightningBolt,
		content: (
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<h4 className="marcellus text-sm font-semibold mb-2">Physical Damage</h4>
						<ul className="text-sm text-stone space-y-1">
							<li>Slashing</li>
							<li>Piercing</li>
							<li>Bludgeoning</li>
							<li>Thermal (fire/cold)</li>
							<li>Kinetic</li>
						</ul>
					</div>
					<div>
						<h4 className="marcellus text-sm font-semibold mb-2">Psychic Damage</h4>
						<ul className="text-sm text-stone space-y-1">
							<li>Mental</li>
							<li>Emotional</li>
							<li>Psychic assault</li>
						</ul>
					</div>
				</div>
				<p className="text-sm text-stone italic">Physical damage targets Physical Shield. Psychic damage targets Psychic Shield.</p>
			</div>
		),
	},
	{
		id: 'common-rolls',
		title: 'Common Rolls',
		icon: mdiDice6,
		content: (
			<div className="space-y-4">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-stone/30">
							<th className="text-left py-2 marcellus">Roll Type</th>
							<th className="text-left py-2 marcellus">Formula</th>
						</tr>
					</thead>
					<tbody className="text-stone">
						<tr className="border-b border-stone/10">
							<td className="py-2">Attack Roll</td>
							<td className="py-2">d20 + relevant score modifier</td>
						</tr>
						<tr className="border-b border-stone/10">
							<td className="py-2">Damage Roll</td>
							<td className="py-2">Weapon dice + modifier</td>
						</tr>
						<tr className="border-b border-stone/10">
							<td className="py-2">Skill Check</td>
							<td className="py-2">d20 + skill modifier</td>
						</tr>
						<tr className="border-b border-stone/10">
							<td className="py-2">Saving Throw</td>
							<td className="py-2">d20 + score modifier</td>
						</tr>
						<tr>
							<td className="py-2">Initiative</td>
							<td className="py-2">d20 + Reflex</td>
						</tr>
					</tbody>
				</table>
			</div>
		),
	},
	{
		id: 'conditions',
		title: 'Conditions',
		icon: mdiAlert,
		content: (
			<div className="space-y-2">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{[
						{ name: 'Stunned', effect: 'Cannot take actions, lose next turn' },
						{ name: 'Prone', effect: '-2 to attack, +2 to be hit by melee' },
						{ name: 'Blinded', effect: 'Cannot see, disadvantage on attacks' },
						{ name: 'Poisoned', effect: 'Disadvantage on attacks and checks' },
						{ name: 'Frightened', effect: 'Cannot move toward source of fear' },
						{ name: 'Paralyzed', effect: 'Cannot move or take actions' },
					].map((condition) => (
						<div key={condition.name} className="p-2 bg-parchment border-l-2 border-stone/30">
							<span className="font-semibold text-sm">{condition.name}</span>
							<p className="text-xs text-stone">{condition.effect}</p>
						</div>
					))}
				</div>
			</div>
		),
	},
	{
		id: 'health-injuries',
		title: 'Health & Injuries',
		icon: mdiHeart,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Injury Thresholds</h4>
					<ul className="text-sm text-stone space-y-1">
						<li><span className="font-semibold text-black">Minor Injury:</span> 1-5 damage past shields</li>
						<li><span className="font-semibold text-black">Moderate Injury:</span> 6-10 damage past shields</li>
						<li><span className="font-semibold text-black">Severe Injury:</span> 11+ damage past shields</li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Recovery</h4>
					<p className="text-sm text-stone">Shields regenerate after a short rest. Health requires medical attention or healing techniques.</p>
				</div>
			</div>
		),
	},
];

const QuickReference = () => {
	const [openSections, setOpenSections] = useState<string[]>(['combat-flow']);

	const toggleSection = (id: string) => {
		setOpenSections((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const expandAll = () => {
		setOpenSections(sections.map((s) => s.id));
	};

	const collapseAll = () => {
		setOpenSections([]);
	};

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex justify-end gap-2">
				<button
					onClick={expandAll}
					className="text-xs text-stone hover:text-gold transition-colors marcellus uppercase tracking-wider"
				>
					Expand All
				</button>
				<span className="text-stone/30">|</span>
				<button
					onClick={collapseAll}
					className="text-xs text-stone hover:text-gold transition-colors marcellus uppercase tracking-wider"
				>
					Collapse All
				</button>
			</div>

			{/* Sections */}
			<div className="space-y-2">
				{sections.map((section) => {
					const isOpen = openSections.includes(section.id);
					return (
						<div
							key={section.id}
							className="bg-white border-2 border-stone overflow-hidden"
						>
							<button
								onClick={() => toggleSection(section.id)}
								className="w-full flex items-center justify-between p-4 text-left hover:bg-parchment/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<Icon path={section.icon} size={0.875} className="text-gold" />
									<span className="marcellus text-lg">{section.title}</span>
								</div>
								<Icon
									path={mdiChevronDown}
									size={1}
									className={`text-stone transition-transform ${
										isOpen ? 'rotate-180' : ''
									}`}
								/>
							</button>
							{isOpen && (
								<div className="px-4 pb-4 border-t border-stone/20 pt-4">
									{section.content}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default QuickReference;
