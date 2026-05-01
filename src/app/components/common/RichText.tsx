/**
 * RichText.tsx
 *
 * Renders Payload CMS Lexical rich-text JSON as HTML. Payload stores all
 * long-form content (article bodies, discipline descriptions, technique
 * descriptions, etc.) in the Lexical editor format — a JSON tree, NOT HTML
 * or Markdown. This component converts that JSON to React elements using the
 * official `@payloadcms/richtext-lexical/react` renderer.
 *
 * Always use this component when displaying Payload rich-text fields. Never
 * try to render the JSON directly in JSX — it will show as "[object Object]".
 *
 * The `LexicalContent` type is also exported so other files can type their
 * rich-text props without importing from Lexical directly.
 *
 * Props:
 *   - content: LexicalContent — the raw Lexical JSON from Payload (typically
 *     from a field like `doc.entryBody`, `doc.description`, etc.). Renders
 *     nothing if null or undefined.
 *   - className?: string      — optional class added to the wrapping <div>
 *                               (useful for applying prose styles)
 *
 * Used by:
 *   - Codex entry pages (entryBody field)
 *   - Discipline, technique, path, culture, and patronage detail views
 *   - SelectDetailExpanded (character creation description panels)
 *   - Anywhere a Payload Lexical field needs to be displayed
 */

import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'

/** Payload Lexical rich text JSON. Must be rendered with <RichText content={...} /> — never directly in JSX. */
export type LexicalContent = SerializedEditorState | null | undefined

interface RichTextProps {
  content: LexicalContent
  className?: string
}

export function RichText({ content, className }: RichTextProps) {
  if (!content) return null
  return (
    <div className={className}>
      <PayloadRichText data={content} />
    </div>
  )
}
