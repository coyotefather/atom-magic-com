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

export const ENTRY_BY_ID_QUERY = groq`*[_type == "entry"][$entryId]{
  _id, title, entryBody, slug
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