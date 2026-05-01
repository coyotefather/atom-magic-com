/**
 * shield.ts
 *
 * Utility functions for calculating shield and armor values from a character's
 * equipped gear.
 *
 * In the Atom Magic combat system, a character has three defensive stats:
 *
 *   Physical Shield — Absorbs physical damage before it reaches health.
 *     Base value = Physical score. Gear can add a bonus on top of that.
 *
 *   Psychic Shield — Absorbs psychic damage before it reaches health.
 *     Base value = Psyche score. Gear can add a bonus on top of that.
 *
 *   Armor Capacity — A flat damage absorption pool separate from shields.
 *     Armor soaks damage AFTER both shields are depleted. A character without
 *     armor has 0 capacity.
 *
 * These utilities read those bonuses out of the character's gear list so that
 * the AdditionalScores component can display the totals without repeating the
 * lookup logic.
 *
 * How gear works in the Character Manager:
 *   A character can have multiple gear items (weapons, enhancements, etc.) but
 *   only one `type === 'armor'` item. Armor items optionally have an `enhancement`
 *   attached (a gear modification that can add further bonuses). Both the armor
 *   and its enhancement can contribute to shield bonuses independently.
 *
 * Used by:
 *   - src/app/components/character/sections/scores/AdditionalScores.tsx
 *     (displays final physical shield, psychic shield, and armor capacity)
 */

import { CharacterGearItem } from '../gear-data';

/**
 * The combined shield bonuses from all equipped gear (armor + enhancement).
 *
 * These are ADDITIVE bonuses — the base shield value (Physical score or
 * Psyche score) is added separately by the AdditionalScores component.
 * These utilities only return the gear contribution.
 */
export interface ShieldBonuses {
  /** How much the character's Physical Shield is increased by their gear. */
  physicalShieldBonus: number;
  /** How much the character's Psychic Shield is increased by their gear. */
  psychicShieldBonus: number;
}

/**
 * Calculates the total Physical Shield and Psychic Shield bonuses from all
 * equipped gear.
 *
 * The calculation:
 *   1. Find the equipped armor (the single `type === 'armor'` item in gear, if any)
 *   2. Find any enhancement attached to that armor (armor can have one enhancement)
 *   3. Sum the physical and psychic bonuses from both sources independently
 *
 * Returns `{ 0, 0 }` if:
 *   - The character has no armor equipped
 *   - The armor has no shield bonuses
 *   - The armor has no enhancement, or the enhancement has no shield bonuses
 *
 * @param gear - The character's full gear list from Redux state (includes weapons,
 *   armor, and any enhancements attached to armor)
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
 * Returns the character's Armor Capacity from their equipped armor.
 *
 * Armor Capacity is the number of damage points the armor can absorb before
 * being broken. It is separate from shields — shields deplete first, then
 * armor capacity, then the damage reaches the character's health.
 *
 * Returns `0` if the character has no armor equipped or if the equipped
 * armor has no capacity value.
 *
 * @param gear - The character's full gear list from Redux state
 */
export function getArmorCapacity(gear: CharacterGearItem[]): number {
  const armor = gear.find(g => g.type === 'armor');
  return armor?.capacity || 0;
}
