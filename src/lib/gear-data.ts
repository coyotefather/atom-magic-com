// Gear data extracted from markdown tables for character gear rolling

export type WeaponCategory = 'light' | 'medium' | 'heavy';
export type WeaponType = 'melee' | 'ranged';
export type ArmorCategory = 'light' | 'medium' | 'heavy';
export type Tier = 1 | 2 | 3;

export interface Weapon {
  name: string;
  category: WeaponCategory;
  type: WeaponType;
  tier: Tier;
  damage: string;
  isExotic: boolean;
  description?: string;
}

export interface Armor {
  name: string;
  category: ArmorCategory;
  tier: Tier;
  capacity: number;
  penalties: string;
  isExotic: boolean;
  description?: string;
  physicalShieldBonus?: number;
  psychicShieldBonus?: number;
}

export interface Enhancement {
  name: string;
  discipline: string;
  type: 'weapon' | 'armor';
  description: string;
  isPermanent: boolean;
  isTemporary: boolean;
  physicalShieldBonus?: number;
  psychicShieldBonus?: number;
}

// Standard Weapons Data
export const STANDARD_WEAPONS: Weapon[] = [
  // Light Melee - Tier 1
  { name: 'Dagger', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Hand Axe', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Shortsword', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Club', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: false },
  // Light Melee - Tier 2
  { name: 'Quality Dagger', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Quality Hand Axe', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Quality Shortsword', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Spiked Club', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: false },
  // Light Melee - Tier 3
  { name: 'Masterwork Dagger', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Masterwork Hand Axe', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Masterwork Shortsword', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Reinforced Mace (light)', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: false },

  // Medium Melee - Tier 1
  { name: 'Longsword', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Mace', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Spear', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Scimitar', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: false },
  // Medium Melee - Tier 2
  { name: 'Quality Longsword', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Mace', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Spear', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Scimitar', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: false },
  // Medium Melee - Tier 3
  { name: 'Masterwork Longsword', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Mace', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Spear', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Scimitar', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: false },

  // Heavy Melee - Tier 1
  { name: 'Greatsword', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: false },
  { name: 'Battleaxe', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: false },
  { name: 'Warhammer', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: false },
  { name: 'Halberd', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: false },
  // Heavy Melee - Tier 2
  { name: 'Quality Greatsword', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: false },
  { name: 'Quality Battleaxe', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: false },
  { name: 'Quality Warhammer', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: false },
  { name: 'Quality Halberd', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: false },
  // Heavy Melee - Tier 3
  { name: 'Masterwork Greatsword', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: false },
  { name: 'Masterwork Battleaxe', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: false },
  { name: 'Masterwork Warhammer', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: false },
  { name: 'Masterwork Halberd', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: false },

  // Light Ranged - Tier 1
  { name: 'Hand Crossbow', category: 'light', type: 'ranged', tier: 1, damage: 'd4', isExotic: false },
  { name: 'Throwing Knife', category: 'light', type: 'ranged', tier: 1, damage: 'd4', isExotic: false },
  { name: 'Dart', category: 'light', type: 'ranged', tier: 1, damage: 'd4', isExotic: false },
  { name: 'Sling', category: 'light', type: 'ranged', tier: 1, damage: 'd4', isExotic: false },
  // Light Ranged - Tier 2
  { name: 'Quality Hand Crossbow', category: 'light', type: 'ranged', tier: 2, damage: 'd6', isExotic: false },
  { name: 'Quality Throwing Knife', category: 'light', type: 'ranged', tier: 2, damage: 'd6', isExotic: false },
  { name: 'Quality Dart', category: 'light', type: 'ranged', tier: 2, damage: 'd6', isExotic: false },
  { name: 'Quality Sling', category: 'light', type: 'ranged', tier: 2, damage: 'd6', isExotic: false },
  // Light Ranged - Tier 3
  { name: 'Masterwork Hand Crossbow', category: 'light', type: 'ranged', tier: 3, damage: 'd8', isExotic: false },
  { name: 'Masterwork Throwing Knife', category: 'light', type: 'ranged', tier: 3, damage: 'd8', isExotic: false },
  { name: 'Masterwork Dart', category: 'light', type: 'ranged', tier: 3, damage: 'd8', isExotic: false },
  { name: 'Masterwork Sling', category: 'light', type: 'ranged', tier: 3, damage: 'd8', isExotic: false },

  // Medium Ranged - Tier 1
  { name: 'Shortbow', category: 'medium', type: 'ranged', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Light Crossbow', category: 'medium', type: 'ranged', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Javelin', category: 'medium', type: 'ranged', tier: 1, damage: 'd6', isExotic: false },
  { name: 'Throwing Axe', category: 'medium', type: 'ranged', tier: 1, damage: 'd6', isExotic: false },
  // Medium Ranged - Tier 2
  { name: 'Quality Shortbow', category: 'medium', type: 'ranged', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Quality Light Crossbow', category: 'medium', type: 'ranged', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Quality Javelin', category: 'medium', type: 'ranged', tier: 2, damage: 'd8', isExotic: false },
  { name: 'Quality Throwing Axe', category: 'medium', type: 'ranged', tier: 2, damage: 'd8', isExotic: false },
  // Medium Ranged - Tier 3
  { name: 'Masterwork Shortbow', category: 'medium', type: 'ranged', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Masterwork Light Crossbow', category: 'medium', type: 'ranged', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Masterwork Javelin', category: 'medium', type: 'ranged', tier: 3, damage: 'd10', isExotic: false },
  { name: 'Masterwork Throwing Axe', category: 'medium', type: 'ranged', tier: 3, damage: 'd10', isExotic: false },

  // Heavy Ranged - Tier 1
  { name: 'Longbow', category: 'heavy', type: 'ranged', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Heavy Crossbow', category: 'heavy', type: 'ranged', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Composite Bow', category: 'heavy', type: 'ranged', tier: 1, damage: 'd8', isExotic: false },
  { name: 'Warbow', category: 'heavy', type: 'ranged', tier: 1, damage: 'd8', isExotic: false },
  // Heavy Ranged - Tier 2
  { name: 'Quality Longbow', category: 'heavy', type: 'ranged', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Heavy Crossbow', category: 'heavy', type: 'ranged', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Composite Bow', category: 'heavy', type: 'ranged', tier: 2, damage: 'd10', isExotic: false },
  { name: 'Quality Warbow', category: 'heavy', type: 'ranged', tier: 2, damage: 'd10', isExotic: false },
  // Heavy Ranged - Tier 3
  { name: 'Masterwork Longbow', category: 'heavy', type: 'ranged', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Heavy Crossbow', category: 'heavy', type: 'ranged', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Composite Bow', category: 'heavy', type: 'ranged', tier: 3, damage: 'd12', isExotic: false },
  { name: 'Masterwork Warbow', category: 'heavy', type: 'ranged', tier: 3, damage: 'd12', isExotic: false },
];

// Exotic Weapons Data
export const EXOTIC_WEAPONS: Weapon[] = [
  // Light Exotic Melee - Tier 1
  { name: 'Whip Chain', category: 'light', type: 'melee', tier: 1, damage: 'd4', isExotic: true, description: 'Reach 2, Entangle (opposed Str, target -10)' },
  { name: 'Flail', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: true, description: 'Ignore Parry +10, Wrap Attack -5, Unwieldy -10 defense' },
  { name: 'Bladed Fan', category: 'light', type: 'melee', tier: 1, damage: 'd4', isExotic: true, description: 'Concealable +15, Defensive +10 defense' },
  { name: 'Push Daggers (pair)', category: 'light', type: 'melee', tier: 1, damage: 'd6', isExotic: true, description: 'Armor Piercing 2, Grapple +10, Cannot be disarmed' },
  // Light Exotic Melee - Tier 2
  { name: 'Quality Whip Chain', category: 'light', type: 'melee', tier: 2, damage: 'd6', isExotic: true, description: 'Reach 2, Entangle -15, Trip option' },
  { name: 'Quality Flail', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: true, description: 'Ignore Parry +15, Disarm +10, Unwieldy -10 defense' },
  { name: 'Quality Bladed Fan', category: 'light', type: 'melee', tier: 2, damage: 'd6', isExotic: true, description: 'Concealable +20, Defensive +15, Riposte -5' },
  { name: 'Quality Push Daggers', category: 'light', type: 'melee', tier: 2, damage: 'd8', isExotic: true, description: 'Armor Piercing 3, Grapple +15, Critical ignores armor' },
  // Light Exotic Melee - Tier 3
  { name: 'Masterwork Whip Chain', category: 'light', type: 'melee', tier: 3, damage: 'd8', isExotic: true, description: 'Reach 2, Entangle -20, Multi-target (2 enemies)' },
  { name: 'Masterwork Flail', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: true, description: 'Ignore Parry +20, Disarm +15, Stunning crits, Unwieldy -5' },
  { name: 'Masterwork Bladed Fan', category: 'light', type: 'melee', tier: 3, damage: 'd8', isExotic: true, description: 'Concealable +20, Defensive +20, Riposte, Deflect ranged' },
  { name: 'Masterwork Push Daggers', category: 'light', type: 'melee', tier: 3, damage: 'd10', isExotic: true, description: 'Armor Piercing 4, Grapple +20, Critical ignores armor +5 dmg' },

  // Medium Exotic Melee - Tier 1
  { name: 'Chain Whip', category: 'medium', type: 'melee', tier: 1, damage: 'd6', isExotic: true, description: 'Reach 2, Disarm +10, Entangle -10' },
  { name: 'Hook Sword (pair)', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: true, description: 'Link for reach, Disarm +10 linked, Guard Hook +5 parry' },
  { name: 'Spiked Chain', category: 'medium', type: 'melee', tier: 1, damage: 'd8', isExotic: true, description: 'Reach 2, Area Control -5 to pass, Two-handed' },
  { name: 'War Scythe', category: 'medium', type: 'melee', tier: 1, damage: 'd10', isExotic: true, description: 'Trip +15, Reaping Strike -10, Unwieldy -15 defense' },
  // Medium Exotic Melee - Tier 2
  { name: 'Quality Chain Whip', category: 'medium', type: 'melee', tier: 2, damage: 'd8', isExotic: true, description: 'Reach 2, Disarm +15, Entangle -15, Multi-target 2 at -5' },
  { name: 'Quality Hook Sword (pair)', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: true, description: 'Link for reach, Disarm +15, Guard +10, Acrobatic +5' },
  { name: 'Quality Spiked Chain', category: 'medium', type: 'melee', tier: 2, damage: 'd10', isExotic: true, description: 'Reach 2, Area Control -10, Trip at reach, Two-handed' },
  { name: 'Quality War Scythe', category: 'medium', type: 'melee', tier: 2, damage: 'd12', isExotic: true, description: 'Trip +20, Reaping -5, Cleave -10, Unwieldy -10 defense' },
  // Medium Exotic Melee - Tier 3
  { name: 'Masterwork Chain Whip', category: 'medium', type: 'melee', tier: 3, damage: 'd10', isExotic: true, description: 'Reach 2, Disarm +20, Entangle -20, Multi-target 3 at -5' },
  { name: 'Masterwork Hook Sword (pair)', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: true, description: 'Link reach +2, Disarm +20, Guard +15, Deflect projectiles' },
  { name: 'Masterwork Spiked Chain', category: 'medium', type: 'melee', tier: 3, damage: 'd12', isExotic: true, description: 'Reach 2, Area Control -15, Trip +10, Sweeping all at -10' },
  { name: 'Masterwork War Scythe', category: 'medium', type: 'melee', tier: 3, damage: 'd20', isExotic: true, description: 'Trip +20, Reaping no penalty, Cleave no penalty, Harvest +10 crit' },

  // Heavy Exotic Melee - Tier 1
  { name: 'Heavy Flail', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: true, description: 'Ignore Parry +10, Crushing +10 vs armor, Unwieldy -15 defense' },
  { name: 'Tetsubo', category: 'heavy', type: 'melee', tier: 1, damage: 'd12', isExotic: true, description: 'Devastating +2 dmg, Knockback 1, Slow -10 initiative' },
  { name: 'Bladed Chain', category: 'heavy', type: 'melee', tier: 1, damage: 'd8', isExotic: true, description: 'Reach 2, Multi-strike (roll 2x take higher), Entangle -10' },
  { name: 'Hooked Polearm', category: 'heavy', type: 'melee', tier: 1, damage: 'd10', isExotic: true, description: 'Reach +1, Hook +15 trip/disarm, Pull closer' },
  // Heavy Exotic Melee - Tier 2
  { name: 'Quality Heavy Flail', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: true, description: 'Ignore Parry +15, Crushing +15, Disarm +10, Unwieldy -10' },
  { name: 'Quality Tetsubo', category: 'heavy', type: 'melee', tier: 2, damage: 'd20', isExotic: true, description: 'Devastating +3, Knockback prone, Armor Breaker 3, Slow -5' },
  { name: 'Quality Bladed Chain', category: 'heavy', type: 'melee', tier: 2, damage: 'd10', isExotic: true, description: 'Reach 2, Multi-strike, Entangle -15, Whirlwind all adj -10' },
  { name: 'Quality Hooked Polearm', category: 'heavy', type: 'melee', tier: 2, damage: 'd12', isExotic: true, description: 'Reach +1, Hook +20, Pull and attack -5, Impaling crit pins' },
  // Heavy Exotic Melee - Tier 3
  { name: 'Masterwork Heavy Flail', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: true, description: 'Ignore Parry +20, Crushing +20, Disarm +15, Sundering, Unwieldy -5' },
  { name: 'Masterwork Tetsubo', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: true, description: 'Devastating +4, Knockback 2 + stun, Armor Breaker 5, Earthquake' },
  { name: 'Masterwork Bladed Chain', category: 'heavy', type: 'melee', tier: 3, damage: 'd12', isExotic: true, description: 'Reach 2, Multi-strike 3x, Entangle -20, Whirlwind no penalty' },
  { name: 'Masterwork Hooked Polearm', category: 'heavy', type: 'melee', tier: 3, damage: 'd20', isExotic: true, description: 'Reach +1, Hook +20 auto crit, Pull + attack, Impaling +10, Harvest' },
];

// Standard Armor Data
export const STANDARD_ARMOR: Armor[] = [
  // Light Armor - Tier 1
  { name: 'Leather Armor', category: 'light', tier: 1, capacity: 15, penalties: 'None', isExotic: false },
  { name: 'Padded Cloth', category: 'light', tier: 1, capacity: 15, penalties: 'None', isExotic: false },
  { name: 'Studded Leather', category: 'light', tier: 1, capacity: 15, penalties: 'None', isExotic: false },
  { name: 'Hide Armor', category: 'light', tier: 1, capacity: 15, penalties: 'None', isExotic: false },
  // Light Armor - Tier 2
  { name: 'Quality Leather Armor', category: 'light', tier: 2, capacity: 20, penalties: 'None', isExotic: false },
  { name: 'Reinforced Padded Cloth', category: 'light', tier: 2, capacity: 20, penalties: 'None', isExotic: false },
  { name: 'Quality Studded Leather', category: 'light', tier: 2, capacity: 20, penalties: 'None', isExotic: false },
  { name: 'Quality Hide Armor', category: 'light', tier: 2, capacity: 20, penalties: 'None', isExotic: false },
  // Light Armor - Tier 3
  { name: 'Masterwork Leather Armor', category: 'light', tier: 3, capacity: 25, penalties: 'None', isExotic: false },
  { name: 'Masterwork Padded Cloth', category: 'light', tier: 3, capacity: 25, penalties: 'None', isExotic: false },
  { name: 'Masterwork Studded Leather', category: 'light', tier: 3, capacity: 25, penalties: 'None', isExotic: false },
  { name: 'Masterwork Hide Armor', category: 'light', tier: 3, capacity: 25, penalties: 'None', isExotic: false },

  // Medium Armor - Tier 1
  { name: 'Chainmail', category: 'medium', tier: 1, capacity: 25, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Scale Mail', category: 'medium', tier: 1, capacity: 25, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Breastplate', category: 'medium', tier: 1, capacity: 25, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Brigandine', category: 'medium', tier: 1, capacity: 25, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  // Medium Armor - Tier 2
  { name: 'Quality Chainmail', category: 'medium', tier: 2, capacity: 35, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Quality Scale Mail', category: 'medium', tier: 2, capacity: 35, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Quality Breastplate', category: 'medium', tier: 2, capacity: 35, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Quality Brigandine', category: 'medium', tier: 2, capacity: 35, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  // Medium Armor - Tier 3
  { name: 'Masterwork Chainmail', category: 'medium', tier: 3, capacity: 45, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Masterwork Scale Mail', category: 'medium', tier: 3, capacity: 45, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Masterwork Breastplate', category: 'medium', tier: 3, capacity: 45, penalties: '-5 Agility, -5 Stealth', isExotic: false },
  { name: 'Masterwork Brigandine', category: 'medium', tier: 3, capacity: 45, penalties: '-5 Agility, -5 Stealth', isExotic: false },

  // Heavy Armor - Tier 1
  { name: 'Plate Armor', category: 'heavy', tier: 1, capacity: 40, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Full Plate', category: 'heavy', tier: 1, capacity: 40, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Field Plate', category: 'heavy', tier: 1, capacity: 40, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Banded Mail', category: 'heavy', tier: 1, capacity: 40, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  // Heavy Armor - Tier 2
  { name: 'Quality Plate Armor', category: 'heavy', tier: 2, capacity: 55, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Quality Full Plate', category: 'heavy', tier: 2, capacity: 55, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Quality Field Plate', category: 'heavy', tier: 2, capacity: 55, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Quality Banded Mail', category: 'heavy', tier: 2, capacity: 55, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  // Heavy Armor - Tier 3
  { name: 'Masterwork Plate Armor', category: 'heavy', tier: 3, capacity: 70, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Masterwork Full Plate', category: 'heavy', tier: 3, capacity: 70, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Masterwork Field Plate', category: 'heavy', tier: 3, capacity: 70, penalties: '-10 Agility, -15 Stealth', isExotic: false },
  { name: 'Masterwork Banded Mail', category: 'heavy', tier: 3, capacity: 70, penalties: '-10 Agility, -15 Stealth', isExotic: false },
];

// Exotic Armor Data
export const EXOTIC_ARMOR: Armor[] = [
  // Light Exotic - Tier 1
  { name: 'Spider Silk Weave', category: 'light', tier: 1, capacity: 15, penalties: 'None', isExotic: true, description: 'Silent +15 Stealth, Climbing +10, Fragile vs fire' },
  { name: 'Bone Plates', category: 'light', tier: 1, capacity: 18, penalties: '-5 Agility', isExotic: true, description: '+5 Physical Shield, +5 Intimidation, Rigid', physicalShieldBonus: 5 },
  { name: 'Enchanted Robes', category: 'light', tier: 1, capacity: 12, penalties: '+3 physical damage taken', isExotic: true, description: '+10 spellcasting, +15 Psychic Shield, Store 1 spell', psychicShieldBonus: 15 },
  { name: 'Shadow Leather', category: 'light', tier: 1, capacity: 15, penalties: '-5 Stealth in bright light', isExotic: true, description: '+10 Stealth (+15 dim/dark), Shadow Step 1/combat' },
  // Light Exotic - Tier 2
  { name: 'Quality Spider Silk Weave', category: 'light', tier: 2, capacity: 20, penalties: '+5 Agility', isExotic: true, description: 'Silent +20 Stealth, Wall walk, Fragile vs fire' },
  { name: 'Quality Bone Plates', category: 'light', tier: 2, capacity: 23, penalties: '-5 Agility', isExotic: true, description: '+10 Physical Shield, +10 Intimidation, Regen 5/day', physicalShieldBonus: 10 },
  { name: 'Quality Enchanted Robes', category: 'light', tier: 2, capacity: 15, penalties: '+3 physical damage taken', isExotic: true, description: '+15 spellcasting, +20 Psychic Shield, Store 2 spells, 20% reflect', psychicShieldBonus: 20 },
  { name: 'Quality Shadow Leather', category: 'light', tier: 2, capacity: 20, penalties: '-5 Stealth in bright light', isExotic: true, description: '+15 Stealth (+20 dark), Shadow Step 2/combat, Blend +25' },
  // Light Exotic - Tier 3
  { name: 'Masterwork Spider Silk Weave', category: 'light', tier: 3, capacity: 25, penalties: '+10 Agility', isExotic: true, description: 'Silent +25, Walk walls/ceilings, Web creation, Fragile vs fire' },
  { name: 'Masterwork Bone Plates', category: 'light', tier: 3, capacity: 30, penalties: 'None', isExotic: true, description: '+15 Physical Shield, Fear aura, Regen 10/day, Bone spikes d6', physicalShieldBonus: 15 },
  { name: 'Masterwork Enchanted Robes', category: 'light', tier: 3, capacity: 18, penalties: '+3 physical damage taken', isExotic: true, description: '+20 spellcasting, +25 Psychic Shield, Store 3 spells, 30% reflect, Absorb', psychicShieldBonus: 25 },
  { name: 'Masterwork Shadow Leather', category: 'light', tier: 3, capacity: 25, penalties: 'None', isExotic: true, description: '+20 Stealth (+30 dark), Shadow Step 3/combat, Invisible motionless, Shadow Form 1/day' },

  // Medium Exotic - Tier 1
  { name: 'Living Bark Armor', category: 'medium', tier: 1, capacity: 28, penalties: '-10 Agility, -5 Stealth', isExotic: true, description: 'Regen 3/hr in sun, Rooted +10, Nature Ward +5 Physical Shield in nature', physicalShieldBonus: 5 },
  { name: 'Crystal Plate', category: 'medium', tier: 1, capacity: 22, penalties: '-5 Agility, -5 Stealth, Brittle', isExotic: true, description: '+10 spellcasting, 20% deflect ranged, Resonance +3 sonic' },
  { name: 'Scaled Hide', category: 'medium', tier: 1, capacity: 30, penalties: '-5 Agility, -10 Stealth', isExotic: true, description: '-3 slash/pierce dmg, -5 fire dmg, Flexible -3 Agi penalty' },
  { name: 'Chain Mesh', category: 'medium', tier: 1, capacity: 25, penalties: '-5 Agility, -5 Stealth, Magnetic vuln', isExotic: true, description: '+5 defense with allies, 50% knockback reduction, Acrobatics -5' },
  // Medium Exotic - Tier 2
  { name: 'Quality Living Bark Armor', category: 'medium', tier: 2, capacity: 38, penalties: '-8 Agility, -5 Stealth', isExotic: true, description: 'Regen 5/hr sun, Rooted +15, Nature Ward +10 Physical Shield in nature', physicalShieldBonus: 10 },
  { name: 'Quality Crystal Plate', category: 'medium', tier: 2, capacity: 30, penalties: '-5 Agility, -5 Stealth, Brittle', isExotic: true, description: '+15 spellcasting, 30% deflect, Illusions, Resonance +5 sonic' },
  { name: 'Quality Scaled Hide', category: 'medium', tier: 2, capacity: 40, penalties: '-8 Stealth', isExotic: true, description: '-4 slash/pierce, -8 fire, No Agi penalty, Aquatic swim/breathe' },
  { name: 'Quality Chain Mesh', category: 'medium', tier: 2, capacity: 35, penalties: '-5 Agility, -5 Stealth, Magnetic vuln', isExotic: true, description: '+10 defense allies, Negate knockback <2, Acrobatics no penalty, Magnet trap +10 disarm' },
  // Medium Exotic - Tier 3
  { name: 'Masterwork Living Bark Armor', category: 'medium', tier: 3, capacity: 50, penalties: '-5 Agility, -5 Stealth', isExotic: true, description: 'Regen 8/hr sun, Immune knockback on earth, Nature +15 Physical Shield in nature', physicalShieldBonus: 15 },
  { name: 'Masterwork Crystal Plate', category: 'medium', tier: 3, capacity: 38, penalties: '-5 Agility, -5 Stealth, Brittle reduced', isExotic: true, description: '+20 spellcasting, 40% deflect redirect, Complex illusions, Resonance +8, Energy store' },
  { name: 'Masterwork Scaled Hide', category: 'medium', tier: 3, capacity: 50, penalties: 'None', isExotic: true, description: '-5 slash/pierce, -10 fire, +5 Agi bonus, Aquatic indefinite, Adaptive' },
  { name: 'Masterwork Chain Mesh', category: 'medium', tier: 3, capacity: 45, penalties: '-5 Agility, -5 Stealth', isExotic: true, description: '+15 defense allies share DR, Immune knockback, +5 Agi acrobatics, Magnetic control, Conductive' },

  // Heavy Exotic - Tier 1
  { name: 'Stone Plate', category: 'heavy', tier: 1, capacity: 50, penalties: '-20 Agility, -15 Stealth, Cannot swim', isExotic: true, description: '-5 all physical dmg, Immovable +20, Earthbound +10 Physical Shield on earth/stone', physicalShieldBonus: 10 },
  { name: 'Spiked Juggernaut Armor', category: 'heavy', tier: 1, capacity: 45, penalties: '-15 Agility, -15 Stealth', isExotic: true, description: 'Attackers take d6, Charge +10 dmg, Intimidating +10' },
  { name: 'Shell Armor', category: 'heavy', tier: 1, capacity: 45, penalties: '-10 Agility, -15 Stealth, 50% movement, Joint vuln', isExotic: true, description: 'Turtle +30 defense (no attack), DR -4' },
  { name: 'Reinforced Plate', category: 'heavy', tier: 1, capacity: 55, penalties: '-15 Agility, -15 Stealth', isExotic: true, description: '+10 capacity, DR -3, Tower Shield +10 defense' },
  // Heavy Exotic - Tier 2
  { name: 'Quality Stone Plate', category: 'heavy', tier: 2, capacity: 65, penalties: '-18 Agility, -15 Stealth, Cannot swim', isExotic: true, description: '-7 all physical, Immovable +25, Earthbound +15 Physical Shield on earth/stone', physicalShieldBonus: 15 },
  { name: 'Quality Spiked Juggernaut Armor', category: 'heavy', tier: 2, capacity: 58, penalties: '-13 Agility, -15 Stealth', isExotic: true, description: 'Attackers take d8, Charge +15 knockback, Intimidating +15, Rampage +5/kill' },
  { name: 'Quality Shell Armor', category: 'heavy', tier: 2, capacity: 58, penalties: '-10 Agility, -15 Stealth, 40% movement, Joint vuln reduced', isExotic: true, description: 'Turtle +40 defense, DR -5, Counter Shell 50% reflect' },
  { name: 'Quality Reinforced Plate', category: 'heavy', tier: 2, capacity: 68, penalties: '-13 Agility, -15 Stealth', isExotic: true, description: '+15 capacity, DR -4, Tower Shield +15, Wall brace +10 ally defense' },
  // Heavy Exotic - Tier 3
  { name: 'Masterwork Stone Plate', category: 'heavy', tier: 3, capacity: 85, penalties: '-15 Agility, -15 Stealth, Cannot swim', isExotic: true, description: '-10 all physical, Immovable +30 immune knockback, Earthbound +20 Physical Shield on earth/stone', physicalShieldBonus: 20 },
  { name: 'Masterwork Spiked Juggernaut Armor', category: 'heavy', tier: 3, capacity: 75, penalties: '-10 Agility, -15 Stealth', isExotic: true, description: 'Attackers take d10, Charge +20 stun, Intimidating +20, Rampage +10/kill, Unstoppable' },
  { name: 'Masterwork Shell Armor', category: 'heavy', tier: 3, capacity: 75, penalties: '-10 Agility, -15 Stealth, 30% movement', isExotic: true, description: 'Turtle +50 defense + ranged, DR -6, Counter 75% reflect, Fortified +20, No joint vuln' },
  { name: 'Masterwork Reinforced Plate', category: 'heavy', tier: 3, capacity: 85, penalties: '-10 Agility, -15 Stealth', isExotic: true, description: '+20 capacity, DR -5, Tower +20 all adj allies, Wall Formation barrier, Bastion difficult terrain' },
];

// Generic Enhancements (available to all disciplines)
export const GENERIC_ENHANCEMENTS: Enhancement[] = [
  // Weapon
  { name: 'Power Strike', discipline: 'Generic', type: 'weapon', description: '+2 damage on next attack', isPermanent: true, isTemporary: true },
  { name: 'Precision Edge', discipline: 'Generic', type: 'weapon', description: '+10 to attack roll', isPermanent: true, isTemporary: true },
  { name: 'Shield Breaker', discipline: 'Generic', type: 'weapon', description: '+10 damage vs Physical Shield', isPermanent: true, isTemporary: true },
  // Armor
  { name: 'Reinforced Field', discipline: 'Generic', type: 'armor', description: '+10 to Physical Shield', isPermanent: true, isTemporary: true, physicalShieldBonus: 10 },
  { name: 'Mental Ward', discipline: 'Generic', type: 'armor', description: '+10 to Psychic Shield', isPermanent: true, isTemporary: true, psychicShieldBonus: 10 },
  { name: 'Damage Reduction', discipline: 'Generic', type: 'armor', description: '-2 from next attack', isPermanent: true, isTemporary: true },
];

// Discipline-specific Armor Enhancements (with shield bonuses)
export const DISCIPLINE_ARMOR_ENHANCEMENTS: Enhancement[] = [
  // Biological
  { name: 'Vital Fortification', discipline: 'Biological', type: 'armor', description: '+10 to Physical Shield, enhanced natural healing', isPermanent: true, isTemporary: true, physicalShieldBonus: 10 },
  { name: 'Regenerative Tissue', discipline: 'Biological', type: 'armor', description: 'Regenerate 2 Shield per minute when not in combat', isPermanent: true, isTemporary: false },

  // Fission/Fusion
  { name: 'Fusion Battery', discipline: 'Fission/Fusion', type: 'armor', description: 'Regenerate 5 Shield per round (always active), +20 Physical Shield for 1 min (1/day)', isPermanent: true, isTemporary: false, physicalShieldBonus: 5 },
  { name: 'Radiation Shielding', discipline: 'Fission/Fusion', type: 'armor', description: 'Immunity to radiation damage, +5 Physical Shield', isPermanent: true, isTemporary: false, physicalShieldBonus: 5 },

  // Luminous
  { name: 'Photon Absorption', discipline: 'Luminous', type: 'armor', description: '+5 Shield per light-based attack absorbed (max +25)', isPermanent: true, isTemporary: false, physicalShieldBonus: 5 },

  // Psychic
  { name: 'Mental Aegis', discipline: 'Psychic', type: 'armor', description: '+20 to Psychic Shield, mental fortress', isPermanent: true, isTemporary: true, psychicShieldBonus: 20 },
  { name: 'Consciousness Ward', discipline: 'Psychic', type: 'armor', description: '+15 to Psychic Shield, resist mental intrusion', isPermanent: true, isTemporary: true, psychicShieldBonus: 15 },
  { name: 'Empathic Feedback', discipline: 'Psychic', type: 'armor', description: '+10 to Psychic Shield, attackers feel pain backlash', isPermanent: true, isTemporary: true, psychicShieldBonus: 10 },

  // Thermal
  { name: 'Reactive Temperature', discipline: 'Thermal', type: 'armor', description: '+10 to Physical Shield, temperature adaptation', isPermanent: true, isTemporary: true, physicalShieldBonus: 10 },
  { name: 'Flame Aura', discipline: 'Thermal', type: 'armor', description: '+15 to Physical Shield vs physical attacks, melee attackers take d4 fire', isPermanent: true, isTemporary: true, physicalShieldBonus: 15 },

  // Theurgist (Disciplina Academica)
  { name: 'Academy Wards', discipline: 'Theurgist', type: 'armor', description: '+10 to Physical Shield, systematic magical protection', isPermanent: true, isTemporary: false, physicalShieldBonus: 10 },
  { name: 'Systematic Protection', discipline: 'Theurgist', type: 'armor', description: 'Regen 5 armor/round, emergency +20 Shield when armor depleted', isPermanent: true, isTemporary: false },
];

// Helper functions
export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[getRandomInt(0, array.length)];
}

export interface GearRollingOptions {
  includeExoticWeapons: boolean;
  includeExoticArmor: boolean;
  includeWeaponEnhancements: boolean;
  includeArmorEnhancements: boolean;
  weaponCategories: WeaponCategory[];
  weaponTypes: WeaponType[];
  armorCategories: ArmorCategory[];
  tiers: Tier[];
}

export const DEFAULT_ROLLING_OPTIONS: GearRollingOptions = {
  includeExoticWeapons: false,
  includeExoticArmor: false,
  includeWeaponEnhancements: false,
  includeArmorEnhancements: false,
  weaponCategories: ['light', 'medium', 'heavy'],
  weaponTypes: ['melee', 'ranged'],
  armorCategories: ['light', 'medium', 'heavy'],
  tiers: [1, 2, 3],
};

export interface RolledGear {
  weapon: Weapon | undefined;
  armor: Armor | undefined;
  weaponEnhancement: Enhancement | undefined;
  armorEnhancement: Enhancement | undefined;
}

// Simplified gear type for character state (replaces Sanity GEAR_QUERY_RESULT)
export interface CharacterGearItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  category: string;
  tier: Tier;
  damage?: string;
  capacity?: number;
  penalties?: string;
  description?: string;
  isExotic: boolean;
  physicalShieldBonus?: number;
  psychicShieldBonus?: number;
  enhancement?: {
    name: string;
    description: string;
    physicalShieldBonus?: number;
    psychicShieldBonus?: number;
  };
}

export function rollGear(options: GearRollingOptions): RolledGear {
  // Filter weapons based on options
  let availableWeapons = [...STANDARD_WEAPONS];
  if (options.includeExoticWeapons) {
    availableWeapons = [...availableWeapons, ...EXOTIC_WEAPONS];
  }

  availableWeapons = availableWeapons.filter(w =>
    options.weaponCategories.includes(w.category) &&
    options.weaponTypes.includes(w.type) &&
    options.tiers.includes(w.tier)
  );

  // Filter armor based on options
  let availableArmor = [...STANDARD_ARMOR];
  if (options.includeExoticArmor) {
    availableArmor = [...availableArmor, ...EXOTIC_ARMOR];
  }

  availableArmor = availableArmor.filter(a =>
    options.armorCategories.includes(a.category) &&
    options.tiers.includes(a.tier)
  );

  // Roll weapon and armor
  const weapon = getRandomElement(availableWeapons);
  const armor = getRandomElement(availableArmor);

  // Roll enhancements if enabled
  let weaponEnhancement: Enhancement | undefined;
  let armorEnhancement: Enhancement | undefined;

  if (options.includeWeaponEnhancements) {
    const weaponEnhancements = GENERIC_ENHANCEMENTS.filter(e => e.type === 'weapon');
    weaponEnhancement = getRandomElement(weaponEnhancements);
  }

  if (options.includeArmorEnhancements) {
    const armorEnhancements = GENERIC_ENHANCEMENTS.filter(e => e.type === 'armor');
    armorEnhancement = getRandomElement(armorEnhancements);
  }

  return {
    weapon,
    armor,
    weaponEnhancement,
    armorEnhancement,
  };
}
