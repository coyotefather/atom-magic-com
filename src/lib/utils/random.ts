/**
 * random.ts
 *
 * Utility functions for random selection and randomized game decisions.
 *
 * Used throughout the app wherever a random choice needs to be made:
 *   - Character Manager: rolling random cultures, paths, gear, disciplines
 *   - Vorago game: randomizing AI move targets, ring rotation directions,
 *     and coin selections when the AI has multiple valid options
 *
 * All functions use `Math.random()` — not cryptographically secure, but
 * suitable for game mechanics where fair randomness is the goal.
 */

/**
 * Selects a uniformly random element from an array.
 *
 * This is the primary utility for "pick one at random" — used whenever the
 * Character Manager or Vorago AI needs to choose from a list of options.
 *
 * @returns A random element from the array, or `undefined` if the array is
 *   empty. Callers should handle the `undefined` case if the array might
 *   be empty (e.g., filtered gear lists that could come back empty).
 *
 * @example
 *   const culture = selectRandomElement(allCultures); // NormedCulture | undefined
 *   const gear = selectRandomElement(filteredWeapons); // CharacterGearItem | undefined
 */
export function selectRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Selects a uniformly random element from an array, with a fallback value
 * for the empty case.
 *
 * Use this when you always need a result and have a sensible default. The
 * fallback is returned only when the array is empty — it is NOT weighted
 * into the random selection.
 *
 * @param fallback - The value to return if `array` is empty.
 *
 * @example
 *   const direction = selectRandomElementOr(['cw', 'ccw'], 'cw'); // always 'cw' or 'ccw'
 */
export function selectRandomElementOr<T>(array: T[], fallback: T): T {
  if (array.length === 0) return fallback;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns `true` or `false` with equal probability (50/50 coin flip).
 *
 * Used as the building block for `randomDirection()` and anywhere else
 * a simple binary random choice is needed.
 */
export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Returns a random ring rotation direction — either clockwise (`'cw'`) or
 * counter-clockwise (`'ccw'`), with equal probability.
 *
 * Used by the Vorago AI when choosing which direction to spin a ring, and
 * by certain Cardinal Coins whose effects involve randomized rotation.
 *
 * Both values are valid inputs for the Vorago `rotateRing` reducer.
 */
export function randomDirection(): 'cw' | 'ccw' {
  return randomBoolean() ? 'cw' : 'ccw';
}
