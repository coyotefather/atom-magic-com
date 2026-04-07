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
