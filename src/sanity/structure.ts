import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Codex')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('entry').title('Entries'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('culture').title('Cultures'),
      S.documentTypeListItem('timeline').title('Timeline'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'entry', 'category', 'culture', 'timeline', 'author'].includes(item.getId()!),
      ),
    ])
