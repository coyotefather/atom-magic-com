/**
 * Shield calculation utilities for character gear
 */

import { CharacterGearItem } from '../gear-data';

export interface ShieldBonuses {
  physicalShieldBonus: number;
  psychicShieldBonus: number;
}

/**
 * Calculate total shield bonuses from gear (armor + enhancement)
 */
export function calculateGearShieldBonuses(gear: CharacterGearItem[]): ShieldBonuses {
  const armor = gear.find(g => g.type === 'armor');
  const enhancement = armor?.enhancement;

  return {
    physicalShieldBonus: (armor?.physicalShieldBonus || 0) + (enhancement?.physicalShieldBonus || 0),
    psychicShieldBonus: (armor?.psychicShieldBonus || 0) + (enhancement?.psychicShieldBonus || 0),
  };
}

/**
 * Get armor capacity from gear
 */
export function getArmorCapacity(gear: CharacterGearItem[]): number {
  const armor = gear.find(g => g.type === 'armor');
  return armor?.capacity || 0;
}
