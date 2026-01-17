// Miscellaneous loot items for the loot roller

export interface MiscItem {
  name: string;
  category: 'common' | 'uncommon' | 'rare';
  value: string; // in gold
  description?: string;
}

export const MISC_ITEMS: MiscItem[] = [
  // Common items (1-10 gold equivalent)
  { name: 'Canteen (water)', category: 'common', value: '1g' },
  { name: 'Rope (50ft)', category: 'common', value: '2g' },
  { name: 'Torch (bundle of 5)', category: 'common', value: '1g' },
  { name: 'Flint and Steel', category: 'common', value: '2g' },
  { name: 'Bedroll', category: 'common', value: '3g' },
  { name: 'Rations (3 days)', category: 'common', value: '2g' },
  { name: 'Waterskin', category: 'common', value: '1g' },
  { name: 'Satchel', category: 'common', value: '2g' },
  { name: 'Chalk (10 pieces)', category: 'common', value: '1g' },
  { name: 'Oil Flask', category: 'common', value: '2g' },
  { name: 'Iron Spikes (10)', category: 'common', value: '3g' },
  { name: 'Whetstone', category: 'common', value: '1g' },
  { name: 'Clay Pot', category: 'common', value: '1g' },
  { name: 'Wool Blanket', category: 'common', value: '2g' },
  { name: 'Wooden Cup', category: 'common', value: '1g' },

  // Uncommon items (10-50 gold equivalent)
  { name: 'Healer\'s Kit', category: 'uncommon', value: '15g' },
  { name: 'Lockpicks', category: 'uncommon', value: '25g' },
  { name: 'Spyglass', category: 'uncommon', value: '40g' },
  { name: 'Compass', category: 'uncommon', value: '30g' },
  { name: 'Lantern (hooded)', category: 'uncommon', value: '12g' },
  { name: 'Grappling Hook', category: 'uncommon', value: '20g' },
  { name: 'Chain (10ft)', category: 'uncommon', value: '25g' },
  { name: 'Manacles', category: 'uncommon', value: '15g' },
  { name: 'Caltrops (bag)', category: 'uncommon', value: '10g' },
  { name: 'Signal Whistle', category: 'uncommon', value: '12g' },
  { name: 'Ink and Quill Set', category: 'uncommon', value: '15g' },
  { name: 'Blank Scroll (5)', category: 'uncommon', value: '20g' },
  { name: 'Silver Mirror', category: 'uncommon', value: '35g' },
  { name: 'Bronze Figurine', category: 'uncommon', value: '25g' },
  { name: 'Perfumed Oil', category: 'uncommon', value: '18g' },

  // Rare items (50-200 gold equivalent)
  { name: 'Crystal Vial (enchantable)', category: 'rare', value: '75g' },
  { name: 'Astrolabe', category: 'rare', value: '120g' },
  { name: 'Magnifying Lens', category: 'rare', value: '80g' },
  { name: 'Alchemist\'s Kit', category: 'rare', value: '150g' },
  { name: 'Cartographer\'s Tools', category: 'rare', value: '90g' },
  { name: 'Jeweler\'s Loupe', category: 'rare', value: '100g' },
  { name: 'Gilded Inkwell', category: 'rare', value: '60g' },
  { name: 'Ornate Lockbox', category: 'rare', value: '85g' },
  { name: 'Ancient Coin Collection', category: 'rare', value: '175g' },
  { name: 'Ivory Dice Set', category: 'rare', value: '65g' },
  { name: 'Silver Candelabra', category: 'rare', value: '95g' },
  { name: 'Embroidered Tapestry', category: 'rare', value: '130g' },
  { name: 'Jade Amulet (non-magical)', category: 'rare', value: '110g' },
  { name: 'Gilded Hand Mirror', category: 'rare', value: '70g' },
  { name: 'Ancient Map Fragment', category: 'rare', value: '200g', description: 'May lead somewhere interesting' },
];

export interface CoinRoll {
  type: 'silver' | 'gold' | 'lead' | 'uranium';
  min: number;
  max: number;
}

export const COIN_TABLES: Record<string, CoinRoll[]> = {
  poor: [
    { type: 'silver', min: 5, max: 30 },
  ],
  modest: [
    { type: 'silver', min: 10, max: 50 },
    { type: 'gold', min: 1, max: 5 },
  ],
  comfortable: [
    { type: 'silver', min: 20, max: 80 },
    { type: 'gold', min: 5, max: 20 },
  ],
  wealthy: [
    { type: 'silver', min: 50, max: 150 },
    { type: 'gold', min: 15, max: 50 },
    { type: 'lead', min: 0, max: 2 },
  ],
  rich: [
    { type: 'gold', min: 30, max: 100 },
    { type: 'lead', min: 1, max: 5 },
    { type: 'uranium', min: 0, max: 1 },
  ],
};

export const WEALTH_LEVELS = [
  { id: 'poor', label: 'Poor', description: 'Peasant, beggar' },
  { id: 'modest', label: 'Modest', description: 'Laborer, soldier' },
  { id: 'comfortable', label: 'Comfortable', description: 'Merchant, artisan' },
  { id: 'wealthy', label: 'Wealthy', description: 'Noble, successful merchant' },
  { id: 'rich', label: 'Rich', description: 'Aristocrat, crime lord' },
];
