/**
 * CustomHitsPerPage.tsx
 *
 * A styled hits-per-page selector for the Algolia search results page. Wraps
 * the `useHitsPerPage` hook from `react-instantsearch`. Renders as a row of
 * selectable number options (e.g., 10 / 25 / 50).
 *
 * Used by:
 *   - `src/app/components/global/search/Search.tsx`
 */
import React from 'react';
import { useHitsPerPage, UseHitsPerPageProps } from 'react-instantsearch';

export default function CustomHitsPerPage(props: UseHitsPerPageProps) {
	const { items, refine } = useHitsPerPage(props);
	const { value: currentValue } =
		items.find(({ isRefined }) => isRefined) || {};

	return (
		<div className="flex items-center gap-2">
			<label
				htmlFor="hits-per-page"
				className="text-sm text-stone whitespace-nowrap"
			>
				Show:
			</label>
			<select
				id="hits-per-page"
				onChange={(event) => {
					refine(Number(event.target.value));
				}}
				value={String(currentValue)}
				className="px-3 py-2 border-2 border-stone text-sm bg-white focus:border-gold focus:outline-none transition-colors cursor-pointer"
			>
				{items.map((item) => (
					<option key={item.value} value={item.value}>
						{item.value} per page
					</option>
				))}
			</select>
		</div>
	);
}
