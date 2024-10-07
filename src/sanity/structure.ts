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
      S.documentTypeListItem('score').title('Scores'),
      S.documentTypeListItem('subscore').title('Subscores'),
      S.documentTypeListItem('additionalScores').title('Additional Scores'),
      S.documentTypeListItem('path').title('Paths'),
      S.documentTypeListItem('patronage').title('Patronage'),
      S.documentTypeListItem('discipline').title('Discipline'),
      S.documentTypeListItem('technique').title('Technique'),
      S.documentTypeListItem('gear').title('Gear'),
      S.documentTypeListItem('timeline').title('Timeline'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'entry', 'category', 'culture', 'score', 'subscore', 'additionalScores', 'timeline', 'path', 'patronage', 'discipline', 'technique', 'gear', 'author'].includes(item.getId()!),
      ),
    ])
