// ./src/sanity/lib/queries.ts

import { groq } from "next-sanity";

const CULTURES_PRE_QUERY = `*[_type == "culture"]{
  _id, title, entry->{ slug }, aspects, mainImage, description
}`;

const SCORES_PRE_QUERY = `*[_type == "score"]| order(title asc){
  _id, title, id, subscores[]->{_id, title, id, defaultValue, description}, description
}`;

const SUBSCORES_PRE_QUERY = `*[_type == "subscore"]{
  _id, title, score->{_id, title, id}, defaultValue, description
}`;

const ADDITIONAL_SCORES_PRE_QUERY = `*[_type == "additionalScores"]{
  _id, title, value, entry->{ slug }, scores[]->{ _id, title }, calculation, additionalCalculations[], description
}`;

const PATHS_PRE_QUERY = `*[_type == "path"]{
  _id, title, latin, slug, mainImage, modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue}, description
}`;

const PATRONAGES_PRE_QUERY = `*[_type == "patronage"]{
  _id, title, titleLatin, epithet, epithetLatin, entry->{ slug }, mainImage, effects[]{ title, titleLatin, entry->{ slug }, description }, description
}`;

const DISCIPLINES_PRE_QUERY = `*[_type == "discipline"]| order(title asc){
  _id, title, slug, paths[]->{_id, title }, techniques[]->{_id, title, latin, cooldown, description }, description
}`;

const GEAR_PRE_QUERY = `*[_type == "gear"]{
  _id, title, latin, type, value, damageBonus, shieldBonus, entry, mainImage, paths[]->{ _id }, modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue}, description
}`;

const GEAR_PAGE_PRE_QUERY = `*[_type == "gear" && type == $slug]| order( title asc, path.title asc ){
  _id, title, latin, type, value, damageBonus, shieldBonus, entry, mainImage, paths[]->{ _id, title }, modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue}, description
}`;

export const CULTURES_QUERY = groq`${CULTURES_PRE_QUERY}`;
export const SCORES_QUERY = groq`${SCORES_PRE_QUERY}`;
export const SUBSCORES_QUERY = groq`${SUBSCORES_PRE_QUERY}`;
export const ADDITIONAL_SCORES_QUERY = groq`${ADDITIONAL_SCORES_PRE_QUERY}`;
export const PATHS_QUERY = groq`${PATHS_PRE_QUERY}`;
export const PATRONAGES_QUERY = groq`${PATRONAGES_PRE_QUERY}`;
export const DISCIPLINES_QUERY = groq`${DISCIPLINES_PRE_QUERY}`;
export const GEAR_QUERY = groq`${GEAR_PRE_QUERY}`;
export const GEAR_PAGE_QUERY = groq`${GEAR_PAGE_PRE_QUERY}`;

export const CHARACTER_MANAGER_QUERY = groq`{
  "cultures": ${CULTURES_PRE_QUERY},
  "paths": ${PATHS_PRE_QUERY},
  "patronages": ${PATRONAGES_PRE_QUERY},
  "disciplines": ${DISCIPLINES_QUERY},
  "scores": ${SCORES_PRE_QUERY},
  "subscores": ${SUBSCORES_PRE_QUERY},
  "additionalScores": ${ADDITIONAL_SCORES_PRE_QUERY},
  "gear": ${GEAR_PRE_QUERY},
}`;

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug.current)][0...12]{
  _id, title, slug
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
  title, body, mainImage, categories[]->{title, slug}
}`;

// Entries query - searches across all entry-like document types
export const ENTRIES_QUERY = groq`*[_type in ["entry", "creature", "discipline", "technique", "path"] && defined(slug.current)]| order(coalesce(title, name) asc)[0...96]{
  _id,
  _type,
  "title": coalesce(title, name),
  slug,
  description
}`;

export const ENTRIES_COUNT_QUERY = groq`count(*[_type in ["entry", "creature", "discipline", "technique", "path"] && defined(slug.current)])`;

// Legacy entry query for regular entries
export const ENTRY_QUERY = groq`*[_type == "entry" && slug.current == $slug][0]{
  _type,
  title,
  cardDetails,
  entryBody,
  toc,
  mainImage,
  publishedAt,
  author->{name, slug},
  category->{title, slug, parent->{title, slug, parent->{title, slug, parent->{title, slug, parent->{}}}}}
}`;

// Unified entry query - searches across all entry-like document types by slug
export const UNIFIED_ENTRY_QUERY = groq`*[_type in ["entry", "creature", "discipline", "technique", "path"] && slug.current == $slug][0]{
  _type,
  "title": coalesce(title, name),
  slug,
  description,
  entryBody,
  toc,
  mainImage,
  category->{title, slug, parent->{title, slug, parent->{title, slug, parent->{title, slug, parent->{}}}}},

  // Entry-specific fields
  _type == "entry" => {
    cardDetails,
    publishedAt,
    author->{name, slug}
  },

  // Creature-specific fields
  _type == "creature" => {
    "name": name,
    physical,
    interpersonal,
    intellect,
    psyche,
    physicalShield,
    psychicShield,
    armorCapacity,
    damage,
    specialAbilities,
    challengeLevel,
    creatureType,
    environments,
    isSwarm,
    isUnique
  },

  // Discipline-specific fields
  _type == "discipline" => {
    paths[]->{_id, title, slug},
    techniques[]->{_id, title, latin, slug, cooldown, description}
  },

  // Technique-specific fields
  _type == "technique" => {
    latin,
    cooldown
  },

  // Path-specific fields
  _type == "path" => {
    latin,
    modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue }
  }
}`;

export const CATEGORIES_QUERY = groq`*[_type == "category" && defined(slug.current)][0...12]{
  _id, title, slug, description
}`;

// Category query - finds entries from multiple document types that reference this category
export const CATEGORY_QUERY = groq`*[_type == "category" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  description,
  parent->{title, slug},
  "entries": *[_type in ["entry", "creature", "discipline", "technique", "path"] && references(^._id)]| order(coalesce(title, name) asc) [0...96]{
    _id,
    _type,
    "title": coalesce(title, name),
    slug,
    description
  },
  "children": *[_type == "category" && references(^._id)]{
    _id,
    title,
    slug,
    description
  }
}`;

export const TIMELINE_QUERY = groq`*[_type == "timeline"]| order(year desc) {
  _id, title, URL, year, major, icon, description
}`;

// Creature queries for the Creature Roller
export const CREATURES_QUERY = groq`*[_type == "creature"]| order(name asc) {
  _id,
  name,
  slug,
  description,
  mainImage,
  physical,
  interpersonal,
  intellect,
  psyche,
  physicalShield,
  psychicShield,
  armorCapacity,
  damage,
  specialAbilities,
  challengeLevel,
  creatureType,
  environments,
  isSwarm,
  isUnique
}`;

export const CREATURE_QUERY = groq`*[_type == "creature" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  description,
  mainImage,
  physical,
  interpersonal,
  intellect,
  psyche,
  physicalShield,
  psychicShield,
  armorCapacity,
  damage,
  specialAbilities,
  challengeLevel,
  creatureType,
  environments,
  isSwarm,
  isUnique,
  entryBody,
  toc,
  category->{title, slug, parent->{title, slug, parent->{title, slug, parent->{title, slug, parent->{}}}}}
}`;

// Get unique filter values for the roller UI
export const CREATURE_FILTERS_QUERY = groq`{
  "environments": array::unique(*[_type == "creature"].environments[]),
  "creatureTypes": array::unique(*[_type == "creature"].creatureType),
  "challengeLevels": ["trivial", "easy", "moderate", "hard", "deadly"]
}`;
