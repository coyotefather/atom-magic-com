/**
 * Utility functions for random selection
 */

/**
 * Select a random element from an array
 * @returns The selected element, or undefined if array is empty
 */
export function selectRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Select a random element from an array, with a fallback value
 * @returns The selected element, or the fallback if array is empty
 */
export function selectRandomElementOr<T>(array: T[], fallback: T): T {
  if (array.length === 0) return fallback;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random boolean (coin flip)
 */
export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Get a random direction for ring rotation
 */
export function randomDirection(): 'cw' | 'ccw' {
  return randomBoolean() ? 'cw' : 'ccw';
}
