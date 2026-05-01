/**
 * SelectDetail.tsx
 *
 * A detail panel that appears alongside a selection control (e.g. a dropdown
 * or radio list) to preview information about the currently selected item.
 * When an item IS selected (`disabled = false`) it shows a two-column layout:
 *   - Left: Marcellus heading + description text (spanning 2 of 3 columns)
 *   - Right: a large MDI icon (size 6) representing the selected item
 *
 * When nothing is selected yet (`disabled = true`) the two-column layout is
 * hidden and instead a single very large, near-invisible icon (size 8,
 * 5% opacity) is shown centered — acting as a placeholder silhouette.
 *
 * NOTE: This is an older, icon-based variant. The expanded version of this
 * pattern (which supports images, Markdown, and Lexical rich text) is in
 * SelectDetailExpanded.tsx. New character creation steps use the expanded
 * variant; this simpler one is kept for backwards compatibility.
 *
 * Props:
 *   - iconPath: string    — MDI icon path for the selected item
 *   - name: string        — heading displayed when an item is selected
 *   - description: string — descriptive body text shown when selected
 *   - disabled: boolean   — true = nothing selected (placeholder state);
 *                           false = item selected (full detail view)
 *
 * Used by:
 *   - Older character creation selection steps that haven't migrated to
 *     SelectDetailExpanded
 */

import Icon from '@mdi/react';
import clsx from 'clsx';

const SelectDetail = ({
		iconPath,
		name,
		description,
		disabled
	}: {
		iconPath: string,
		name: string,
		description: string,
		disabled: boolean
	}) => {
	return (
		<>
			<div className={clsx(
			'',
			{
				'hidden': disabled === true,
			})}>
				<div className="grid grid-cols-3 gap-4">
					<div className="col-span-2">
						<h3 className="marcellus text-3xl border-b-2 mb-4">{name}</h3>
						<div>
							{description}
						</div>
					</div>
					<div className="flex justify-around">
						<Icon
							path={iconPath}
							className={clsx(
							'inline ml-2',
							{
								'opacity-25': disabled === true,
							})}
							size={6} />
					</div>
				</div>
			</div>
			<div className={clsx(
			'h-full grid grid-cols-1 content-center',
			{
				'hidden': disabled === false,
			})}>
				<Icon
					path={iconPath}
					className={clsx(
					'mx-auto',
					{
						'opacity-5': disabled === true,
					})}
					size={8} />
			</div>
		</>
	);
};

export default SelectDetail;