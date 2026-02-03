import lzstring from 'lz-string';
import { CharacterState } from './slices/characterSlice';

// Constants
export const MAX_PAYLOAD_SIZE = 8192; // 8KB limit for URL safety
const UUID_PATTERN = /^[a-zA-Z0-9._-]+$/; // Sanity document ID pattern
const VALID_CATEGORIES = ['light', 'medium', 'heavy'] as const;
const VALID_TIERS = [1, 2, 3] as const;
const MAX_SHIELD_BONUS = 50; // Maximum reasonable shield bonus value
const MAX_WEALTH_VALUE = 999999; // Maximum wealth per field
const MAX_SCORE_VALUE = 100; // Maximum score/subscore value

// Type for shareable character (without derived fields)
export type ShareableCharacter = Omit<CharacterState, 'loaded' | 'additionalScores' | 'scorePoints'>;

/**
 * Strip derived fields that are recalculated on load
 */
function stripDerivedFields(character: CharacterState): ShareableCharacter {
  const { loaded, additionalScores, scorePoints, ...shareable } = character;
  return shareable;
}

/**
 * Sanitize and truncate string fields
 * Note: HTML escaping removed - React handles this automatically
 */
function sanitizeStrings(data: ShareableCharacter): ShareableCharacter {
  return {
    ...data,
    name: data.name.slice(0, 100),
    pronouns: data.pronouns.slice(0, 50),
    description: data.description.slice(0, 2000),
    animalCompanion: {
      ...data.animalCompanion,
      name: data.animalCompanion.name.slice(0, 100),
      details: data.animalCompanion.details.slice(0, 500),
    },
  };
}

/**
 * Validate UUID format (Sanity document IDs) or empty string
 */
function isValidUUID(str: string): boolean {
  if (str === '') return true;
  return UUID_PATTERN.test(str);
}

/**
 * Type guard to validate character data structure
 */
function validateCharacterStructure(data: unknown): data is ShareableCharacter {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Required string fields
  const requiredStrings = ['name', 'pronouns', 'description', 'culture', 'path', 'patronage'];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string') {
      return false;
    }
  }

  // UUID validation for reference fields
  const uuidFields = ['culture', 'path', 'patronage'];
  for (const field of uuidFields) {
    if (!isValidUUID(obj[field] as string)) {
      return false;
    }
  }

  // Age validation
  if (typeof obj.age !== 'number' || obj.age < 0) {
    return false;
  }

  // Array validation
  if (!Array.isArray(obj.disciplines) || !Array.isArray(obj.techniques)) {
    return false;
  }

  // Validate discipline/technique UUIDs
  for (const id of obj.disciplines as unknown[]) {
    if (typeof id !== 'string' || !isValidUUID(id)) {
      return false;
    }
  }
  for (const id of obj.techniques as unknown[]) {
    if (typeof id !== 'string' || !isValidUUID(id)) {
      return false;
    }
  }

  // Scores array validation
  if (!Array.isArray(obj.scores)) {
    return false;
  }
  for (const score of obj.scores as unknown[]) {
    if (typeof score !== 'object' || score === null) {
      return false;
    }
    const s = score as Record<string, unknown>;
    if (typeof s._id !== 'string' || !isValidUUID(s._id)) {
      return false;
    }
    // Validate score.title and score.description
    if (s.title !== null && typeof s.title !== 'string') {
      return false;
    }
    if (s.description !== null && typeof s.description !== 'string') {
      return false;
    }
    // Validate score.value is null or number in range
    if (s.value !== null) {
      if (typeof s.value !== 'number' || s.value < 0 || s.value > MAX_SCORE_VALUE) {
        return false;
      }
    }
    if (!Array.isArray(s.subscores)) {
      return false;
    }
    for (const subscore of s.subscores as unknown[]) {
      if (typeof subscore !== 'object' || subscore === null) {
        return false;
      }
      const ss = subscore as Record<string, unknown>;
      if (typeof ss._id !== 'string' || !isValidUUID(ss._id)) {
        return false;
      }
      // Validate subscore.title and subscore.description
      if (ss.title !== null && typeof ss.title !== 'string') {
        return false;
      }
      if (ss.description !== null && typeof ss.description !== 'string') {
        return false;
      }
      // Validate subscore.value is null or number in range
      if (ss.value !== null) {
        if (typeof ss.value !== 'number' || ss.value < 0 || ss.value > MAX_SCORE_VALUE) {
          return false;
        }
      }
    }
  }

  // Gear array validation
  if (!Array.isArray(obj.gear)) {
    return false;
  }
  for (const item of obj.gear as unknown[]) {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    const g = item as Record<string, unknown>;
    if (typeof g.id !== 'string' || typeof g.name !== 'string') {
      return false;
    }
    if (g.type !== 'weapon' && g.type !== 'armor') {
      return false;
    }
    // Validate category
    if (typeof g.category !== 'string' || !VALID_CATEGORIES.includes(g.category as typeof VALID_CATEGORIES[number])) {
      return false;
    }
    // Validate tier
    if (typeof g.tier !== 'number' || !VALID_TIERS.includes(g.tier as typeof VALID_TIERS[number])) {
      return false;
    }
    // Validate isExotic
    if (typeof g.isExotic !== 'boolean') {
      return false;
    }
    // Validate optional shield bonuses on gear
    if (g.physicalShieldBonus !== undefined) {
      if (typeof g.physicalShieldBonus !== 'number' || g.physicalShieldBonus < 0 || g.physicalShieldBonus > MAX_SHIELD_BONUS) {
        return false;
      }
    }
    if (g.psychicShieldBonus !== undefined) {
      if (typeof g.psychicShieldBonus !== 'number' || g.psychicShieldBonus < 0 || g.psychicShieldBonus > MAX_SHIELD_BONUS) {
        return false;
      }
    }
    // Validate enhancement if present
    if (g.enhancement !== undefined) {
      if (typeof g.enhancement !== 'object' || g.enhancement === null) {
        return false;
      }
      const enh = g.enhancement as Record<string, unknown>;
      if (typeof enh.name !== 'string' || typeof enh.description !== 'string') {
        return false;
      }
      // Validate enhancement shield bonuses
      if (enh.physicalShieldBonus !== undefined) {
        if (typeof enh.physicalShieldBonus !== 'number' || enh.physicalShieldBonus < 0 || enh.physicalShieldBonus > MAX_SHIELD_BONUS) {
          return false;
        }
      }
      if (enh.psychicShieldBonus !== undefined) {
        if (typeof enh.psychicShieldBonus !== 'number' || enh.psychicShieldBonus < 0 || enh.psychicShieldBonus > MAX_SHIELD_BONUS) {
          return false;
        }
      }
    }
  }

  // Wealth object validation
  if (typeof obj.wealth !== 'object' || obj.wealth === null) {
    return false;
  }
  const wealth = obj.wealth as Record<string, unknown>;
  const wealthFields = ['silver', 'gold', 'lead', 'uranium'];
  for (const field of wealthFields) {
    const value = wealth[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_WEALTH_VALUE) {
      return false;
    }
  }

  // Animal companion validation
  if (typeof obj.animalCompanion !== 'object' || obj.animalCompanion === null) {
    return false;
  }
  const companion = obj.animalCompanion as Record<string, unknown>;
  if (typeof companion.id !== 'string' || typeof companion.name !== 'string' || typeof companion.details !== 'string') {
    return false;
  }

  return true;
}

/**
 * Compress character data for URL sharing
 * Returns null if compression fails or result exceeds MAX_PAYLOAD_SIZE
 */
export function compressCharacter(character: CharacterState): string | null {
  try {
    const shareable = stripDerivedFields(character);
    const json = JSON.stringify(shareable);
    const compressed = lzstring.compressToEncodedURIComponent(json);

    if (compressed.length > MAX_PAYLOAD_SIZE) {
      console.error('Compressed character data exceeds maximum payload size');
      return null;
    }

    return compressed;
  } catch (error) {
    console.error('Failed to compress character:', error);
    return null;
  }
}

/**
 * Decompress and validate character data from URL parameter
 * Returns null if decompression fails or data is invalid
 */
export function decompressCharacter(compressed: string): ShareableCharacter | null {
  try {
    // Check payload size
    if (compressed.length > MAX_PAYLOAD_SIZE) {
      console.error('Compressed payload exceeds maximum size');
      return null;
    }

    // Decompress
    const json = lzstring.decompressFromEncodedURIComponent(compressed);
    if (!json) {
      console.error('Failed to decompress character data');
      return null;
    }

    // Parse
    const data = JSON.parse(json);

    // Validate structure
    if (!validateCharacterStructure(data)) {
      console.error('Invalid character data structure');
      return null;
    }

    // Sanitize strings
    return sanitizeStrings(data);
  } catch (error) {
    console.error('Failed to decompress character:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a character
 * Returns null if compression fails or if called during SSR (window undefined)
 */
export function generateShareUrl(character: CharacterState): string | null {
  // Return null during SSR - sharing requires browser context
  if (typeof window === 'undefined') {
    return null;
  }

  const compressed = compressCharacter(character);
  if (!compressed) {
    return null;
  }

  return `${window.location.origin}/character/shared?c=${compressed}`;
}

/**
 * Reinitialize derived fields that were stripped for sharing
 * Converts ShareableCharacter back to full CharacterState
 */
export function reinitializeDerivedFields(shareable: ShareableCharacter): CharacterState {
  return {
    ...shareable,
    loaded: true,
    additionalScores: [],
    scorePoints: 0,
  };
}
