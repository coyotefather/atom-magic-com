'use client';

import { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import {
	mdiDiceMultiple,
	mdiSword,
	mdiShield,
	mdiCurrencyUsd,
	mdiPackageVariant,
	mdiDelete,
} from '@mdi/js';
import {
	STANDARD_WEAPONS,
	EXOTIC_WEAPONS,
	STANDARD_ARMOR,
	EXOTIC_ARMOR,
	Weapon,
	Armor,
} from '@/lib/gear-data';
import {
	MISC_ITEMS,
	COIN_TABLES,
	WEALTH_LEVELS,
	MiscItem,
} from '@/lib/loot-data';

type LootCategory = 'weapon' | 'armor' | 'coins' | 'item';

interface LootResult {
	id: string;
	category: LootCategory;
	item: Weapon | Armor | MiscItem | CoinResult;
	timestamp: Date;
}

interface CoinResult {
	silver: number;
	gold: number;
	lead: number;
	uranium: number;
}

const LootRoller = () => {
	const [selectedCategory, setSelectedCategory] = useState<LootCategory | 'all'>('all');
	const [includeTier1, setIncludeTier1] = useState(true);
	const [includeTier2, setIncludeTier2] = useState(true);
	const [includeTier3, setIncludeTier3] = useState(true);
	const [includeExotic, setIncludeExotic] = useState(false);
	const [wealthLevel, setWealthLevel] = useState('comfortable');
	const [results, setResults] = useState<LootResult[]>([]);
	const [isRolling, setIsRolling] = useState(false);

	const rollWeapon = useCallback((): Weapon => {
		let weapons = [...STANDARD_WEAPONS];
		if (includeExotic) {
			weapons = [...weapons, ...EXOTIC_WEAPONS];
		}

		const tiers: number[] = [];
		if (includeTier1) tiers.push(1);
		if (includeTier2) tiers.push(2);
		if (includeTier3) tiers.push(3);

		if (tiers.length === 0) tiers.push(1, 2, 3);

		weapons = weapons.filter((w) => tiers.includes(w.tier));
		return weapons[Math.floor(Math.random() * weapons.length)];
	}, [includeExotic, includeTier1, includeTier2, includeTier3]);

	const rollArmor = useCallback((): Armor => {
		let armor = [...STANDARD_ARMOR];
		if (includeExotic) {
			armor = [...armor, ...EXOTIC_ARMOR];
		}

		const tiers: number[] = [];
		if (includeTier1) tiers.push(1);
		if (includeTier2) tiers.push(2);
		if (includeTier3) tiers.push(3);

		if (tiers.length === 0) tiers.push(1, 2, 3);

		armor = armor.filter((a) => tiers.includes(a.tier));
		return armor[Math.floor(Math.random() * armor.length)];
	}, [includeExotic, includeTier1, includeTier2, includeTier3]);

	const rollCoins = useCallback((): CoinResult => {
		const table = COIN_TABLES[wealthLevel];
		const result: CoinResult = { silver: 0, gold: 0, lead: 0, uranium: 0 };

		for (const roll of table) {
			const amount = Math.floor(Math.random() * (roll.max - roll.min + 1)) + roll.min;
			result[roll.type] = amount;
		}

		return result;
	}, [wealthLevel]);

	const rollItem = useCallback((): MiscItem => {
		// Weight by rarity - common more likely
		const weightedItems: MiscItem[] = [];
		for (const item of MISC_ITEMS) {
			const weight = item.category === 'common' ? 5 : item.category === 'uncommon' ? 3 : 1;
			for (let i = 0; i < weight; i++) {
				weightedItems.push(item);
			}
		}
		return weightedItems[Math.floor(Math.random() * weightedItems.length)];
	}, []);

	const roll = useCallback(() => {
		setIsRolling(true);

		setTimeout(() => {
			let category = selectedCategory;
			if (category === 'all') {
				const categories: LootCategory[] = ['weapon', 'armor', 'coins', 'item'];
				category = categories[Math.floor(Math.random() * categories.length)];
			}

			let item: Weapon | Armor | MiscItem | CoinResult;
			switch (category) {
				case 'weapon':
					item = rollWeapon();
					break;
				case 'armor':
					item = rollArmor();
					break;
				case 'coins':
					item = rollCoins();
					break;
				case 'item':
					item = rollItem();
					break;
			}

			const result: LootResult = {
				id: crypto.randomUUID(),
				category,
				item,
				timestamp: new Date(),
			};

			setResults((prev) => [result, ...prev].slice(0, 20));
			setIsRolling(false);
		}, 400);
	}, [selectedCategory, rollWeapon, rollArmor, rollCoins, rollItem]);

	const clearResults = () => {
		setResults([]);
	};

	const renderResult = (result: LootResult) => {
		switch (result.category) {
			case 'weapon': {
				const weapon = result.item as Weapon;
				return (
					<div className="flex items-start gap-3">
						<Icon path={mdiSword} size={0.875} className="text-bronze mt-0.5" />
						<div>
							<div className="font-semibold">{weapon.name}</div>
							<div className="text-xs text-stone">
								{weapon.category} {weapon.type} • Tier {weapon.tier} • {weapon.damage} damage
								{weapon.isExotic && <span className="text-gold ml-2">Exotic</span>}
							</div>
							{weapon.description && (
								<div className="text-xs text-stone/70 mt-1">{weapon.description}</div>
							)}
						</div>
					</div>
				);
			}
			case 'armor': {
				const armor = result.item as Armor;
				return (
					<div className="flex items-start gap-3">
						<Icon path={mdiShield} size={0.875} className="text-stone mt-0.5" />
						<div>
							<div className="font-semibold">{armor.name}</div>
							<div className="text-xs text-stone">
								{armor.category} • Tier {armor.tier} • Capacity {armor.capacity}
								{armor.isExotic && <span className="text-gold ml-2">Exotic</span>}
							</div>
							{armor.penalties && armor.penalties !== 'None' && (
								<div className="text-xs text-stone/70 mt-1">Penalties: {armor.penalties}</div>
							)}
						</div>
					</div>
				);
			}
			case 'coins': {
				const coins = result.item as CoinResult;
				const parts: string[] = [];
				if (coins.silver > 0) parts.push(`${coins.silver} silver`);
				if (coins.gold > 0) parts.push(`${coins.gold} gold`);
				if (coins.lead > 0) parts.push(`${coins.lead} lead bar${coins.lead > 1 ? 's' : ''}`);
				if (coins.uranium > 0) parts.push(`${coins.uranium} uranium bar${coins.uranium > 1 ? 's' : ''}`);
				return (
					<div className="flex items-start gap-3">
						<Icon path={mdiCurrencyUsd} size={0.875} className="text-gold mt-0.5" />
						<div>
							<div className="font-semibold">Currency</div>
							<div className="text-xs text-stone">{parts.join(', ')}</div>
						</div>
					</div>
				);
			}
			case 'item': {
				const item = result.item as MiscItem;
				return (
					<div className="flex items-start gap-3">
						<Icon path={mdiPackageVariant} size={0.875} className="text-laurel mt-0.5" />
						<div>
							<div className="font-semibold">{item.name}</div>
							<div className="text-xs text-stone">
								{item.category} • Value: {item.value}
							</div>
							{item.description && (
								<div className="text-xs text-stone/70 mt-1">{item.description}</div>
							)}
						</div>
					</div>
				);
			}
		}
	};

	const categoryButtons: { id: LootCategory | 'all'; label: string; icon: string }[] = [
		{ id: 'all', label: 'Any', icon: mdiDiceMultiple },
		{ id: 'weapon', label: 'Weapon', icon: mdiSword },
		{ id: 'armor', label: 'Armor', icon: mdiShield },
		{ id: 'coins', label: 'Coins', icon: mdiCurrencyUsd },
		{ id: 'item', label: 'Item', icon: mdiPackageVariant },
	];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Controls */}
			<div className="lg:col-span-2 space-y-6">
				{/* Category selection */}
				<div className="bg-white border-2 border-stone p-6">
					<h2 className="marcellus text-lg mb-4">Loot Category</h2>
					<div className="grid grid-cols-5 gap-2">
						{categoryButtons.map((cat) => (
							<button
								key={cat.id}
								onClick={() => setSelectedCategory(cat.id)}
								className={`flex flex-col items-center gap-2 p-3 transition-colors ${
									selectedCategory === cat.id
										? 'bg-gold text-black'
										: 'bg-parchment border-2 border-stone hover:border-gold'
								}`}
							>
								<Icon path={cat.icon} size={1} />
								<span className="text-xs marcellus uppercase tracking-wider">{cat.label}</span>
							</button>
						))}
					</div>
				</div>

				{/* Options */}
				<div className="bg-white border-2 border-stone p-6">
					<h2 className="marcellus text-lg mb-4">Options</h2>

					{/* Tier selection - for weapons/armor */}
					{(selectedCategory === 'weapon' || selectedCategory === 'armor' || selectedCategory === 'all') && (
						<div className="mb-4">
							<label className="block text-xs uppercase tracking-wider text-stone mb-2">
								Include Tiers
							</label>
							<div className="flex gap-4">
								{[1, 2, 3].map((tier) => {
									const checked = tier === 1 ? includeTier1 : tier === 2 ? includeTier2 : includeTier3;
									const setChecked = tier === 1 ? setIncludeTier1 : tier === 2 ? setIncludeTier2 : setIncludeTier3;
									return (
										<label key={tier} className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={checked}
												onChange={(e) => setChecked(e.target.checked)}
												className="w-4 h-4 accent-gold"
											/>
											<span className="text-sm">Tier {tier}</span>
										</label>
									);
								})}
							</div>
						</div>
					)}

					{/* Exotic toggle */}
					{(selectedCategory === 'weapon' || selectedCategory === 'armor' || selectedCategory === 'all') && (
						<div className="mb-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={includeExotic}
									onChange={(e) => setIncludeExotic(e.target.checked)}
									className="w-4 h-4 accent-gold"
								/>
								<span className="text-sm">Include exotic items</span>
							</label>
						</div>
					)}

					{/* Wealth level - for coins */}
					{(selectedCategory === 'coins' || selectedCategory === 'all') && (
						<div className="mb-4">
							<label className="block text-xs uppercase tracking-wider text-stone mb-2">
								Wealth Level (for coins)
							</label>
							<select
								value={wealthLevel}
								onChange={(e) => setWealthLevel(e.target.value)}
								className="w-full p-2 border-2 border-stone bg-white text-sm"
							>
								{WEALTH_LEVELS.map((level) => (
									<option key={level.id} value={level.id}>
										{level.label} — {level.description}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* Roll button */}
				<button
					onClick={roll}
					disabled={isRolling}
					className={`w-full py-4 marcellus uppercase tracking-widest text-lg font-bold transition-colors flex items-center justify-center gap-3 ${
						isRolling
							? 'bg-stone text-white cursor-not-allowed'
							: 'bg-gold text-black hover:bg-brightgold'
					}`}
				>
					<Icon path={mdiDiceMultiple} size={1.25} />
					{isRolling ? 'Rolling...' : 'Roll for Loot'}
				</button>
			</div>

			{/* Results */}
			<div className="lg:col-span-1">
				<div className="bg-white border-2 border-stone p-6 sticky top-4">
					<div className="flex items-center justify-between mb-4">
						<h2 className="marcellus text-lg">Results</h2>
						{results.length > 0 && (
							<button
								onClick={clearResults}
								className="text-xs text-stone hover:text-oxblood transition-colors flex items-center gap-1"
							>
								<Icon path={mdiDelete} size={0.5} />
								Clear
							</button>
						)}
					</div>

					{results.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-stone text-sm">No loot rolled yet</p>
							<p className="text-stone/60 text-xs mt-1">Roll to generate treasure</p>
						</div>
					) : (
						<div className="space-y-3 max-h-[500px] overflow-y-auto">
							{results.map((result, idx) => (
								<div
									key={result.id}
									className={`p-3 border-l-2 ${
										idx === 0 ? 'bg-gold/10 border-gold' : 'bg-parchment border-stone/30'
									}`}
								>
									{renderResult(result)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LootRoller;
