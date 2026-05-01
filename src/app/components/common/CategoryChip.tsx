/**
 * CategoryChip.tsx
 *
 * A small, colored pill badge that represents a Codex category. Clicking the
 * chip navigates to the category's filtered Codex listing page
 * (`/codex/categories/<slug>`).
 *
 * The background color is driven by the `chipColor.hex` value stored on the
 * category document in Payload CMS. If no color is set, it falls back to the
 * project's gold color (`#BB9731`). Text is always black for contrast.
 *
 * Note: this component intentionally uses `rounded-full` (pill shape) rather
 * than the project's usual sharp-corner aesthetic, following the convention
 * established for category chips in the Codex UI.
 *
 * Props:
 *   - category: { title, slug, chipColor: { hex } | null }
 *     All fields may be null — the component renders safely but may display
 *     empty if title/slug are missing.
 *
 * Used by:
 *   - Codex entry pages (alongside article titles)
 *   - Codex search results and listing grids
 */

import Link from "next/link";
import { Chip } from "@heroui/react";

const CategoryChip = ({
		category
	}: {
		category: {
			title: string | null,
			slug: string | null,
			chipColor: { hex: string } | null
		}
	}) => {

	return (
		<Link href={`/codex/categories/${category?.slug}`}>
			<Chip
				style={{ backgroundColor: category.chipColor?.hex ?? '#BB9731' }}
				className="rounded-full hover:gold-gradient text-black font-semibold hover:text-black hover:font-bold"
			>
				{category?.title}
			</Chip>
		</Link>
	);
};

export default CategoryChip;