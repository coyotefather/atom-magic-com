/**
 * SelectDetailExpanded.tsx
 *
 * The expanded version of the selection detail panel used in the Character
 * Manager wizard. Shows a rich detail view for the currently selected item
 * (culture, path, patronage, etc.) and a placeholder when nothing is selected.
 *
 * When an item IS selected (`disabled = false`):
 *   - Renders a gold-bordered card with a Marcellus heading.
 *   - Description can be either a plain string (rendered as Markdown with GFM,
 *     extended tables, definition lists, and heading IDs) or a Payload Lexical
 *     JSON object (rendered via the RichText component).
 *   - If `imagePath` is provided, an image (150×150 px) fills the right column
 *     and the text area spans 2 of 3 columns; otherwise text spans all 3.
 *   - The `children` slot renders below the description — used to inject extra
 *     controls or stats relevant to the selected item.
 *
 * When nothing is selected yet (`disabled = true`):
 *   - Shows a large, near-invisible (5% opacity) Atom Magic circle as a
 *     placeholder image, plus a small faded version of the description text
 *     so the user can preview what info will appear once they make a selection.
 *
 * Differences from the simpler SelectDetail.tsx:
 *   - Supports both Markdown strings AND Lexical rich text (not just plain text)
 *   - Uses a sigil image instead of an MDI icon
 *   - Has a `children` slot for injecting additional UI
 *   - Styled with a gold border (rather than being borderless)
 *
 * Props:
 *   - imagePath: string          — path to the item's sigil/image; empty string
 *                                  hides the image column
 *   - name: string               — heading for the selected item
 *   - description: string | LexicalContent — body text (Markdown string or
 *                                  Payload Lexical JSON)
 *   - disabled: boolean          — true = placeholder state; false = selected state
 *   - children: ReactNode        — additional content rendered below the description
 *                                  (visible only when an item is selected)
 *
 * Used by:
 *   - ChooseCulture, ChoosePath, ChoosePatronage, and similar character
 *     creation wizard steps
 */

'use client';
import Icon from '@mdi/react';
import { mdiAtom } from '@mdi/js';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkExtendedTable } from 'remark-extended-table';
import { remarkDefinitionList } from 'remark-definition-list';
import remarkHeadingId from 'remark-heading-id';
import NextImage from "next/image";
import clsx from 'clsx';
import { RichText } from '@/app/components/common/RichText';
import type { LexicalContent } from '@/app/components/common/RichText';


const SelectDetail = ({
		imagePath,
		name,
		description,
		disabled,
		children
	}: {
		imagePath: string,
		name: string,
		description: string | LexicalContent,
		disabled: boolean,
		children: React.ReactNode
	}) => {

	const renderDescription = (desc: typeof description) => {
		if (!desc) return null;
		if (typeof desc === 'string') {
			return (
				<Markdown remarkPlugins={[remarkGfm, remarkExtendedTable, remarkDefinitionList, [remarkHeadingId, {defaults: true, uniqueDefaults: true }]]}>
					{desc}
				</Markdown>
			);
		}
		return <RichText content={desc} />;
	};

	let image = (<></>);
	if(imagePath !== "") {
		image = (
			<NextImage
				width={150}
				height={150}
				src={imagePath}
				alt={`Sigil of ${name}`} />
		);
	}

	return (
		<>
			<div className={clsx(
			'p-4 border-2 border-gold bg-white',
			{
				'hidden': disabled === true,
			})}>
				<div className="grid grid-cols-3 gap-4">
					<div className={clsx(
						"",
						{ "col-span-2": imagePath !== "" },
						{ "col-span-3": imagePath === "" },
					)}>
						<h3 className="marcellus text-3xl border-b-2 mb-4">{name}</h3>
						<div className="prose prose-sm">
							{renderDescription(description)}
						</div>
					</div>
					<div className="flex justify-around">
						{image}
					</div>
				</div>
				<div>
					{children}
				</div>
			</div>
			<div className={clsx(
			'h-full grid grid-cols-1 content-center',
			{
				'hidden': disabled === false,
			})}>
				<NextImage
					width={150}
					height={150}
					src="/atom-magic-circle-black.png"
					className="opacity-5 mx-auto"
					alt="Atom Magic Circle" />
				<div className="text-center m-8 text-sm opacity-75">
					{renderDescription(description)}
				</div>
			</div>
		</>
	);
};

export default SelectDetail;