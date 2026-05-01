/**
 * character-types.ts
 *
 * TypeScript interfaces for the normalized character creation data returned
 * by `fetchCharacterData()`.
 *
 * Background — why "Normed" types exist:
 *   Payload CMS uses `id: number` for all documents. The Character Manager
 *   components were originally written for Sanity CMS which used `_id: string`.
 *   Rather than rewriting every component, `fetchCharacterData()` adds
 *   `_id: String(id)` to every document via the `norm()` helper. The types
 *   in this file describe the resulting "normalized" shape — documents that have
 *   BOTH `id: number` AND `_id: string`.
 *
 *   This means you can write `culture._id` OR `culture.id` and both work:
 *   - `_id` (string) — used by older character components, Redux state, localStorage
 *   - `id` (number)  — the native Payload identifier
 *
 * All types in this file are "Normed" variants of their Payload counterparts.
 * They are NOT the same as the auto-generated types in `payload-types.ts`.
 * Do not use payload-types.ts types directly in character components.
 *
 * Used by:
 *   - `src/lib/fetchCharacterData.ts` (return type of the cache function)
 *   - `src/lib/slices/characterSlice.ts` (action payload types)
 *   - All character section components (ChooseCulture, ChoosePath, etc.)
 *   - `src/lib/character-generator.ts`
 */

import type { Media } from '../../payload-types'
import type { LexicalContent } from '@/app/components/common/RichText'

/**
 * A subscore with `_id` shim added.
 * Subscores are the individual attributes (e.g., Strength, Agility) that
 * make up a parent Score. See the Subscores collection for full details.
 */
export interface NormedSubscore {
  _id: string         // String version of `id` — used by character components
  id: number          // Native Payload document ID
  title: string
  subscoreId?: string | null   // Stable string ID stored in saved characters
  defaultValue?: number | null // Starting value before path modifiers are applied
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * A core Score with `_id` shim and its subscores pre-joined.
 * The four core Scores are Physical, Interpersonal, Intellect, and Psyche.
 * Each contains its subscores as a nested array (joined by `fetchCharacterData()`
 * since Payload's native depth resolution doesn't support this direction).
 */
export interface NormedScore {
  _id: string
  id: number
  title: string
  scoreId?: string | null  // Stable string ID stored in saved characters
  subscores: NormedSubscore[]
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * A subscore reference as it appears inside a Path's `modifiers` array.
 * Includes the parent Score reference (partially resolved) so the UI can
 * display modifier context like "Agility (Physical score): +2".
 */
export interface NormedModifierSubscore {
  _id: string
  id: number
  title?: string | null
  /** The parent Score of this subscore, partially resolved. */
  score?: { _id: string; id: number; title?: string | null } | null
}

/**
 * A character Path (Theurgist, Iconoclast, or Autodidact) with `_id` shim
 * and modifiers pre-resolved to NormedModifierSubscore references.
 *
 * The `modifiers` array defines score adjustments applied when this path is chosen.
 * Each modifier specifies which subscore to adjust and by how much.
 */
export interface NormedPath {
  _id: string
  id: number
  title: string
  latin?: string | null     // Latin name (e.g., "Doctrina Academia")
  slug?: string | null
  mainImage?: Media | number | null
  modifiers?: Array<{
    modifierSubscore: NormedModifierSubscore | null
    modifierValue?: number | null  // Positive or negative integer
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * A minimal Codex Entry reference — just the fields needed to display
 * a link or reference in UI contexts.
 */
export interface NormedEntry {
  _id: string
  id: number
  slug: string
  title: string
}

/**
 * A patronage (Cardinal patron) with `_id` shim and effects pre-joined.
 * Each effect is a supernatural boon the character gains from this patron.
 */
export interface NormedPatronage {
  _id: string
  id: number
  title: string
  titleLatin?: string | null   // Latin version of the patron's name
  epithet?: string | null      // Short descriptive title
  epithetLatin?: string | null
  mainImage?: Media | number | null
  effects?: Array<{
    title?: string | null
    titleLatin?: string | null
    entry?: NormedEntry | number | null  // Codex entry link for this effect (if any)
    description?: LexicalContent         // What the effect does in play
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * A Technique (individual magic ability) with `_id` shim.
 * Techniques appear inside NormedDiscipline.techniques.
 */
export interface NormedTechnique {
  _id: string
  id: number
  title: string | null
  latin?: string | null    // Latin incantation (flavor text)
  cooldown?: number | null // Rounds before the technique can be used again
  description?: LexicalContent
}

/**
 * A Discipline (magic school) with `_id` shim, paths resolved, and techniques resolved.
 *
 * `paths` lists which character Paths have access to this discipline.
 * `techniques` lists the individual abilities the discipline provides.
 * Both are pre-resolved to their normed shapes by `fetchCharacterData()`.
 */
export interface NormedDiscipline {
  _id: string
  id: number
  title: string
  slug?: string | null
  /** Which paths can choose this discipline. */
  paths: Array<{ _id: string; id: number; title: string | null }>
  /** The techniques (abilities) this discipline offers. */
  techniques: NormedTechnique[]
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * A Culture with `_id` shim and aspects included.
 *
 * `aspects` are the sub-groups or traditions within the culture that a
 * player can choose from. `aspectId` within each aspect is a stable string
 * stored in saved characters — do not change it after characters are saved.
 */
export interface NormedCulture {
  _id: string
  id: number
  title: string
  mainImage?: Media | number | null
  aspects?: Array<{
    aspectName?: string | null
    aspectId?: string | null           // Stored in saved characters — treat as immutable
    aspectContentSlug?: string | null  // Slug of the associated Codex entry
    aspectDescription?: LexicalContent
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

/**
 * An Additional Score (derived stat like Physical Shield) with `_id` shim
 * and its formula source references flattened to `{ _id: string }`.
 *
 * The `scores` array contains references to whichever Score or Subscore
 * documents feed into this derived stat's formula. They are flattened to
 * `{ _id: string }` by `fetchCharacterData()` so the `setAdditionalScores`
 * reducer in `characterSlice.ts` can look them up by `_id`.
 *
 * The `calculation` field specifies how the referenced scores are combined.
 * `additionalCalculations` provides follow-up operations (e.g., "then add 5").
 */
export interface NormedAdditionalScore {
  _id: string
  id: number
  title: string
  value?: number | null
  /** References to the Score/Subscore documents used as inputs to the formula. */
  scores: Array<{ _id: string }>
  /** Primary operation applied to the scores. */
  calculation: 'sum' | 'difference' | 'multiply' | 'divide'
  /** Optional follow-up operations applied after the primary calculation. */
  additionalCalculations?: Array<{
    calculationType?: ('sum' | 'difference' | 'multiply' | 'divide') | null
    value?: number | null
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}
