// ./src/sanity/lib/queries.ts

import { groq } from "next-sanity";

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug.current)][0...12]{
  _id, title, slug
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]{
  title, body, mainImage, categories[]->{title, slug}
}`;

export const CATEGORIES_QUERY = groq`*[_type == "category" && defined(slug.current)][0...12]{
  _id, title, slug, description
}`;

export const CATEGORY_QUERY = groq`*[_type == "category" && slug.current == $slug][0]{
  title, slug, description
}`;