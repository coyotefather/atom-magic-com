// ./src/sanity/lib/queries.ts

import { groq } from "next-sanity";

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

export const CULTURES_QUERY = groq`*[_type == "culture"]{
  _id, title, entry->{ slug }, aspects, mainImage, description
}`;

export const SCORES_QUERY = groq`*[_type == "score"]| order(title asc){
  _id, title, id, subscores[]->{_id, title, id, defaultValue, description}, description
}`;

export const SUBSCORES_QUERY = groq`*[_type == "subscore"]{
  _id, title, score->{_id, title, id}, defaultValue, description
}`;

export const PATHS_QUERY = groq`*[_type == "path"]{
  _id, title, latin, entry, mainImage, modifiers[]{ modifierSubscore->{ _id, title, score->{ _id, title } }, modifierValue}, description
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