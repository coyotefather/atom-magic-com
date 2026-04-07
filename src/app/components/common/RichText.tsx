import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'

interface RichTextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
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
