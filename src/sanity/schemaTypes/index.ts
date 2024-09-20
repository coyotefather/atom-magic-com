import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {entryType} from './entryType'
import {cultureType} from './cultureType'
import {scoreType} from './scoreType'
import {subscoreType} from './subscoreType'
import {timelineType} from './timelineType'
import {authorType} from './authorType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    entryType,
    cultureType,
    scoreType,
    subscoreType,
    timelineType,
    authorType
  ],
}
