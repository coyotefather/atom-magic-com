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

const ADDITIONAL_PRE_QUERY = `*[_type == "additionalScores"]{
  _id, title, value, entry->{ slug }, scores[]->{ _id, title }, calculation, additionalCalculations[], description
}`;

const PATHS_PRE_QUERY = `*[_type == "path"]{
  _id, title, latin, entry, mainImage, modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue}, description
}`;

const PATRONAGES_PRE_QUERY = `*[_type == "patronage"]{
  _id, title, titleLatin, epithet, epithetLatin, entry->{ slug }, mainImage, effects[]{ title, titleLatin, entry->{ slug }, polarity, levels[]{ level, description }, description }, description
}`;

export const CULTURES_QUERY = groq`${CULTURES_PRE_QUERY}`;
export const SCORES_QUERY = groq`${SCORES_PRE_QUERY}`;
export const SUBSCORES_QUERY = groq`${SUBSCORES_PRE_QUERY}`;
export const ADDITIONAL_SCORES_QUERY = groq`${ADDITIONAL_PRE_QUERY}`;
export const PATHS_QUERY = groq`${PATHS_PRE_QUERY}`;
export const PATRONAGES_QUERY = groq`${PATRONAGES_PRE_QUERY}`;

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug.current)][0...12]{
  _id, title, slug
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
  title, body, mainImage, categories[]->{title, slug}
}`;

export const ENTRIES_QUERY = groq`*[_type == "entry" && defined(slug.current)][0...12]{
  _id, title, slug, description
}`;

export const ENTRIES_COUNT_QUERY = groq`count(*[_type == 'entry'])`;

export const ENTRY_QUERY = groq`*[_type == "entry" && slug.current == $slug][0]{
  title, cardDetails, entryBody, toc, mainImage, publishedAt, author->{name, slug}, category->{title, slug, parent->{title, slug, parent->{title, slug, parent->{title, slug, parent->{}}}}}
}`;

export const CATEGORIES_QUERY = groq`*[_type == "category" && defined(slug.current)][0...12]{
  _id, title, slug, description
}`;

export const CATEGORY_QUERY = groq`*[_type == "category" && slug.current == $slug][0]{
  _id, title, slug, description, parent->{title, slug}, "entries": *[_type == "entry" && references(^._id)]| order(_id) [0...96]{_id, title, slug, description}, "children": *[_type == "category" && references(^._id)]{_id, title, slug, description},
}`;

export const TIMELINE_QUERY = groq`*[_type == "timeline"]| order(year desc) {
  _id, title, URL, year, major, icon, description
}`;