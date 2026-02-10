import { calculateGearShieldBonuses, getArmorCapacity } from '@/lib/utils/shield';
import type { CharacterGearItem } from '@/lib/gear-data';

function makeWeapon(overrides?: Partial<CharacterGearItem>): CharacterGearItem {
	return {
		id: 'w1',
		name: 'Gladius',
		type: 'weapon',
		category: 'light',
		tier: 1,
		isExotic: false,
		...overrides,
	};
}

function makeArmor(overrides?: Partial<CharacterGearItem>): CharacterGearItem {
	return {
		id: 'a1',
		name: 'Lorica',
		type: 'armor',
		category: 'medium',
		tier: 1,
		isExotic: false,
		capacity: 5,
		physicalShieldBonus: 2,
		psychicShieldBonus: 1,
		...overrides,
	};
}

describe('calculateGearShieldBonuses', () => {
	it('returns zeros for empty gear', () => {
		expect(calculateGearShieldBonuses([])).toEqual({
			physicalShieldBonus: 0,
			psychicShieldBonus: 0,
		});
	});

	it('returns zeros when gear contains only weapons', () => {
		expect(calculateGearShieldBonuses([makeWeapon()])).toEqual({
			physicalShieldBonus: 0,
			psychicShieldBonus: 0,
		});
	});

	it('returns armor bonuses when armor has no enhancement', () => {
		expect(calculateGearShieldBonuses([makeArmor()])).toEqual({
			physicalShieldBonus: 2,
			psychicShieldBonus: 1,
		});
	});

	it('sums armor and enhancement bonuses', () => {
		const armor = makeArmor({
			physicalShieldBonus: 3,
			psychicShieldBonus: 2,
			enhancement: {
				name: 'Fortification',
				description: 'Boosts shields',
				physicalShieldBonus: 1,
				psychicShieldBonus: 2,
			},
		});
		expect(calculateGearShieldBonuses([makeWeapon(), armor])).toEqual({
			physicalShieldBonus: 4,
			psychicShieldBonus: 4,
		});
	});

	it('treats undefined bonus fields as 0', () => {
		const armor = makeArmor({
			physicalShieldBonus: undefined,
			psychicShieldBonus: undefined,
		});
		expect(calculateGearShieldBonuses([armor])).toEqual({
			physicalShieldBonus: 0,
			psychicShieldBonus: 0,
		});
	});
});

describe('getArmorCapacity', () => {
	it('returns 0 for empty gear', () => {
		expect(getArmorCapacity([])).toBe(0);
	});

	it('returns 0 when there is no armor', () => {
		expect(getArmorCapacity([makeWeapon()])).toBe(0);
	});

	it('returns the armor capacity', () => {
		expect(getArmorCapacity([makeWeapon(), makeArmor({ capacity: 8 })])).toBe(8);
	});
});
