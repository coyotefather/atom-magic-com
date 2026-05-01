/**
 * TableOfContents.tsx
 *
 * Renders the table of contents for a Codex entry. The `toc` field in Payload
 * is a separate Lexical rich text field (distinct from `entryBody`) intended to
 * hold a structured list of section links. Rendered with a dark background to
 * visually separate it from the main content.
 *
 * If `toc` is null or undefined, renders nothing (or an empty container).
 *
 * Used by:
 *   - `src/app/components/codex/Entry.tsx`
 *   - `src/app/components/codex/UnifiedEntry.tsx`
 */
import { RichText } from '@/app/components/common/RichText';

const TableOfContents = ({
	toc
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toc: any | null | undefined
}) => {
	return (
		<div className="bg-black text-white w-full border-b-1 border-white">
			<div className="border-b-1 border-white w-full">
				Contents
			</div>
			<div className="text-white">
				<RichText content={toc} />
			</div>
		</div>
	);
}

export default TableOfContents;
