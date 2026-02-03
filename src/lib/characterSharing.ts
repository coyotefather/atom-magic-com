import lzstring from 'lz-string';
import { CharacterState } from './slices/characterSlice';

// Constants
export const MAX_PAYLOAD_SIZE = 8192; // 8KB limit for URL safety
const UUID_PATTERN = /^[a-zA-Z0-9._-]+$/; // Sanity document ID pattern
const EXCLUDED_FIELDS = ['loaded', 'additionalScores', 'scorePoints'] as const;

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
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize and truncate string fields
 */
function sanitizeStrings(data: ShareableCharacter): ShareableCharacter {
  return {
    ...data,
    name: escapeHtml(data.name.slice(0, 100)),
    pronouns: escapeHtml(data.pronouns.slice(0, 50)),
    description: escapeHtml(data.description.slice(0, 2000)),
    animalCompanion: {
      ...data.animalCompanion,
      name: escapeHtml(data.animalCompanion.name.slice(0, 100)),
      details: escapeHtml(data.animalCompanion.details.slice(0, 500)),
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
  }

  // Wealth object validation
  if (typeof obj.wealth !== 'object' || obj.wealth === null) {
    return false;
  }
  const wealth = obj.wealth as Record<string, unknown>;
  const wealthFields = ['silver', 'gold', 'lead', 'uranium'];
  for (const field of wealthFields) {
    if (typeof wealth[field] !== 'number' || wealth[field] < 0) {
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
 * Returns null if compression fails
 */
export function generateShareUrl(character: CharacterState): string | null {
  const compressed = compressCharacter(character);
  if (!compressed) {
    return null;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/character/shared?c=${compressed}`;
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
