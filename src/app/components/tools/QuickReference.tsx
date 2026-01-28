'use client';

import { useState } from 'react';
import Icon from '@mdi/react';
import {
	mdiChevronDown,
	mdiSword,
	mdiShield,
	mdiDice6,
	mdiHeart,
	mdiLightningBolt,
	mdiStarFourPoints,
	mdiAccountGroup,
} from '@mdi/js';

interface ReferenceSection {
	id: string;
	title: string;
	icon: string;
	content: React.ReactNode;
}

const sections: ReferenceSection[] = [
	{
		id: 'core-mechanic',
		title: 'Core Mechanic',
		icon: mdiDice6,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">d100 Roll-Under System</h4>
					<p className="text-sm text-stone mb-2">
						Roll <strong>d100</strong> (or 2d10) and attempt to roll <strong>equal to or under</strong> your modified score.
					</p>
					<ul className="text-sm text-stone space-y-1">
						<li>• Modified score = base score ± difficulty ± situational modifiers</li>
						<li>• Rolling at or under = <span className="text-laurel font-semibold">Success</span></li>
						<li>• Rolling over = <span className="text-oxblood font-semibold">Failure</span></li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Difficulty Modifiers</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1">Easy</td>
								<td className="py-1 text-right text-laurel font-semibold">+20</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Moderate</td>
								<td className="py-1 text-right">±0</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Hard</td>
								<td className="py-1 text-right text-oxblood font-semibold">-20</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Very Hard</td>
								<td className="py-1 text-right text-oxblood font-semibold">-40</td>
							</tr>
							<tr>
								<td className="py-1">Nearly Impossible</td>
								<td className="py-1 text-right text-oxblood font-semibold">-60</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		),
	},
	{
		id: 'combat-flow',
		title: 'Combat Flow',
		icon: mdiSword,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Combat Sequence</h4>
					<ol className="list-decimal list-inside text-sm text-stone space-y-1">
						<li><strong>Roll Initiative</strong> — d100 vs Reflex</li>
						<li><strong>Declare Actions</strong> — State intentions</li>
						<li><strong>Resolve Actions</strong> — Opposed rolls for attacks</li>
						<li><strong>Apply Damage</strong> — Shield → Armor → Injuries</li>
						<li><strong>Track Effects</strong> — Penalties, conditions, regeneration</li>
					</ol>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Initiative</h4>
					<ul className="text-sm text-stone space-y-1">
						<li>• Roll d100 vs your <strong>Reflex</strong> score</li>
						<li>• <strong>Highest successful roll</strong> acts first</li>
						<li>• Failed rolls act last (lowest failed roll = slowest)</li>
						<li>• Ties: Compare Reflex scores or reroll</li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Actions Per Turn</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1">Move + 1 Action</td>
								<td className="py-1 text-right">No penalty</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Each additional action</td>
								<td className="py-1 text-right text-oxblood font-semibold">-25 each</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Defense Modifiers</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1">Standard defense</td>
								<td className="py-1 text-right">Normal score</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Caught unaware / Ambushed</td>
								<td className="py-1 text-right text-oxblood font-semibold">-20</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Active / Full defense (no attack)</td>
								<td className="py-1 text-right text-laurel font-semibold">+20</td>
							</tr>
							<tr>
								<td className="py-1">Multiple attacks same round</td>
								<td className="py-1 text-right text-oxblood font-semibold">-10 per extra</td>
							</tr>
						</tbody>
					</table>
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
						<span className="px-2 py-1 bg-laurel/10 border border-laurel/30">Shield</span>
						<span>→</span>
						<span className="px-2 py-1 bg-stone/10 border border-stone/30">Armor</span>
						<span>→</span>
						<span className="px-2 py-1 bg-oxblood/10 border border-oxblood/30 text-oxblood">Injury</span>
					</div>
					<p className="text-sm text-stone italic">
						Psychic attacks bypass Shield and Armor entirely.
					</p>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Physical Shield</h4>
					<ul className="text-sm text-stone space-y-1">
						<li>• Base = <strong>Physical score</strong> + gear/discipline bonuses</li>
						<li>• Absorbs damage automatically (no action required)</li>
						<li>• Always active unless depleted</li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Shield Regeneration</h4>
					<div className="p-3 bg-parchment border-l-2 border-gold">
						<p className="text-sm font-semibold">10% of total Shield per round</p>
						<p className="text-xs text-stone mt-1">Only when fully disengaged from combat (no attacking or defending)</p>
					</div>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Armor</h4>
					<ul className="text-sm text-stone space-y-1">
						<li>• Second layer after Shield depletes</li>
						<li>• Does <strong>not</strong> regenerate during combat</li>
						<li>• Requires repair between encounters</li>
					</ul>
				</div>
			</div>
		),
	},
	{
		id: 'injuries-death',
		title: 'Injuries & Death',
		icon: mdiHeart,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Injury Severity (Spillover Damage)</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1"><span className="font-semibold text-black">Minor</span></td>
								<td className="py-1">1-10 damage</td>
								<td className="py-1 text-right text-oxblood">-5 to relevant actions</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1"><span className="font-semibold text-black">Serious</span></td>
								<td className="py-1">11-20 damage</td>
								<td className="py-1 text-right text-oxblood">-10 to -15</td>
							</tr>
							<tr>
								<td className="py-1"><span className="font-semibold text-black">Critical</span></td>
								<td className="py-1">21+ damage</td>
								<td className="py-1 text-right text-oxblood">-20+</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Stacking Injuries (Same Location)</h4>
					<ul className="text-sm text-stone space-y-1">
						<li>• 2 Minor → 1 Serious</li>
						<li>• 2 Serious → 1 Critical</li>
						<li>• Different locations: Track separately, penalties stack</li>
					</ul>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Unconsciousness & Death</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1"><span className="font-semibold">Unconscious</span></td>
								<td className="py-1 text-right">-30 total injury penalties</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1"><span className="font-semibold">Death</span></td>
								<td className="py-1 text-right">-50 total injury penalties</td>
							</tr>
							<tr>
								<td className="py-1"><span className="font-semibold">Critical head injury</span></td>
								<td className="py-1 text-right">Automatic unconsciousness</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Healing</h4>
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-stone/30">
								<th className="text-left py-1 text-xs uppercase tracking-wider text-stone">Injury</th>
								<th className="text-right py-1 text-xs uppercase tracking-wider text-stone">Natural</th>
								<th className="text-right py-1 text-xs uppercase tracking-wider text-stone">Magical</th>
							</tr>
						</thead>
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1">Minor</td>
								<td className="py-1 text-right">1-3 days</td>
								<td className="py-1 text-right">Immediate</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1">Serious</td>
								<td className="py-1 text-right">1-2 weeks</td>
								<td className="py-1 text-right">1-3 days</td>
							</tr>
							<tr>
								<td className="py-1">Critical</td>
								<td className="py-1 text-right">1+ month</td>
								<td className="py-1 text-right">1-2 weeks</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		),
	},
	{
		id: 'criticals',
		title: 'Critical Results',
		icon: mdiStarFourPoints,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Critical Threshold</h4>
					<p className="text-sm text-stone mb-2">
						Rolls of <strong>01-05</strong> or <strong>96-00</strong> are potential criticals.
					</p>
					<p className="text-sm text-stone italic">
						Only triggers if the roll would result in actual success or failure.
					</p>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Critical Effect (DL rolls d10)</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-1 font-semibold">1-3</td>
								<td className="py-1"><strong>Comical</strong> — Absurd or embarrassing twist</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1 font-semibold">4-6</td>
								<td className="py-1"><strong>Negative</strong> — Success has a cost, failure creates complication</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-1 font-semibold">7-9</td>
								<td className="py-1"><strong>Positive</strong> — Success yields bonus, failure has silver lining</td>
							</tr>
							<tr>
								<td className="py-1 font-semibold">10</td>
								<td className="py-1"><strong>DL Choice</strong> — Ignore critical or reroll d10</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		),
	},
	{
		id: 'opposed-rolls',
		title: 'Opposed Rolls',
		icon: mdiAccountGroup,
		content: (
			<div className="space-y-4">
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">When Characters Compete</h4>
					<p className="text-sm text-stone mb-2">
						Both characters roll their appropriate scores against each other.
					</p>
				</div>
				<div>
					<h4 className="marcellus text-sm font-semibold mb-2">Resolution</h4>
					<table className="w-full text-sm">
						<tbody className="text-stone">
							<tr className="border-b border-stone/10">
								<td className="py-2"><strong>One succeeds, one fails</strong></td>
								<td className="py-2">Success wins</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-2"><strong>Both succeed</strong></td>
								<td className="py-2">Higher roll wins</td>
							</tr>
							<tr className="border-b border-stone/10">
								<td className="py-2"><strong>Both fail</strong></td>
								<td className="py-2">Reroll or DL introduces complication</td>
							</tr>
							<tr>
								<td className="py-2"><strong>Tie</strong></td>
								<td className="py-2">Reroll</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="p-3 bg-parchment border-l-2 border-bronze">
					<p className="text-sm"><strong>Example:</strong> Sneaking past a guard</p>
					<p className="text-xs text-stone mt-1">
						Player (Agility 65) rolls 48 (success), Guard (Perception 55) rolls 72 (fail) → Player wins
					</p>
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
						<p className="text-xs text-stone mb-2">→ Targets Physical Shield</p>
						<ul className="text-sm text-stone space-y-1">
							<li>• Slashing</li>
							<li>• Piercing</li>
							<li>• Bludgeoning</li>
							<li>• Thermal (fire/cold)</li>
							<li>• Kinetic</li>
						</ul>
					</div>
					<div>
						<h4 className="marcellus text-sm font-semibold mb-2">Psychic Damage</h4>
						<p className="text-xs text-stone mb-2">→ Bypasses Shield & Armor</p>
						<ul className="text-sm text-stone space-y-1">
							<li>• Mental assault</li>
							<li>• Emotional trauma</li>
							<li>• Psychic attacks</li>
						</ul>
					</div>
				</div>
			</div>
		),
	},
];

const QuickReference = () => {
	const [openSections, setOpenSections] = useState<string[]>(['core-mechanic']);

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
