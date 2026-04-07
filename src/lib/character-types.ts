/**
 * Normalized character data types returned by fetchCharacterData.
 * Payload uses numeric id; fetchCharacterData adds _id = String(id) for
 * backwards compatibility with character components.
 */
import type { Media } from '../../payload-types'
import type { LexicalContent } from '@/app/components/common/RichText'

export interface NormedSubscore {
  _id: string
  id: number
  title: string
  subscoreId?: string | null
  defaultValue?: number | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedScore {
  _id: string
  id: number
  title: string
  scoreId?: string | null
  subscores: NormedSubscore[]
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedModifierSubscore {
  _id: string
  id: number
  title?: string | null
  score?: { _id: string; id: number; title?: string | null } | null
}

export interface NormedPath {
  _id: string
  id: number
  title: string
  latin?: string | null
  slug?: string | null
  mainImage?: Media | number | null
  modifiers?: Array<{
    modifierSubscore: NormedModifierSubscore | null
    modifierValue?: number | null
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedEntry {
  _id: string
  id: number
  slug: string
  title: string
}

export interface NormedPatronage {
  _id: string
  id: number
  title: string
  titleLatin?: string | null
  epithet?: string | null
  epithetLatin?: string | null
  mainImage?: Media | number | null
  effects?: Array<{
    title?: string | null
    titleLatin?: string | null
    entry?: NormedEntry | number | null
    description?: LexicalContent
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedTechnique {
  _id: string
  id: number
  title: string | null
  latin?: string | null
  cooldown?: number | null
  description?: LexicalContent
}

export interface NormedDiscipline {
  _id: string
  id: number
  title: string
  slug?: string | null
  paths: Array<{ _id: string; id: number; title: string | null }>
  techniques: NormedTechnique[]
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedCulture {
  _id: string
  id: number
  title: string
  mainImage?: Media | number | null
  aspects?: Array<{
    aspectName?: string | null
    aspectId?: string | null
    aspectContentSlug?: string | null
    aspectDescription?: LexicalContent
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}

export interface NormedAdditionalScore {
  _id: string
  id: number
  title: string
  value?: number | null
  scores: Array<{ _id: string }>
  calculation: 'sum' | 'difference' | 'multiply' | 'divide'
  additionalCalculations?: Array<{
    calculationType?: ('sum' | 'difference' | 'multiply' | 'divide') | null
    value?: number | null
    id?: string | null
  }> | null
  description?: LexicalContent
  updatedAt: string
  createdAt: string
}
