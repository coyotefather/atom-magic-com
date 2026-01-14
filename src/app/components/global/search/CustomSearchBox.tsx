import React, { useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import {
	useInstantSearch,
	useSearchBox,
	UseSearchBoxProps,
} from 'react-instantsearch';

export default function CustomSearchBox(props: UseSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const { status } = useInstantSearch();
	const [inputValue, setInputValue] = useState(query);
	const inputRef = useRef<HTMLInputElement>(null);

	const isSearchStalled = status === 'stalled';

	function setQuery(newQuery: string) {
		debounced(newQuery);
		setInputValue(newQuery);
	}

	const debounced = useDebouncedCallback((value: string) => {
		refine(value);
	}, 1500);

	return (
		<div className="w-full">
			<form
				className="flex items-stretch gap-0 not-prose"
				action=""
				role="search"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (inputRef.current) {
						inputRef.current.blur();
					}
				}}
				onReset={(event) => {
					event.preventDefault();
					event.stopPropagation();

					setQuery('');

					if (inputRef.current) {
						inputRef.current.focus();
					}
				}}
			>
				<div className="relative flex-grow">
					<input
						ref={inputRef}
						type="search"
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						placeholder="Search the Codex..."
						maxLength={512}
						value={inputValue}
						onChange={(event) => {
							setQuery(event.currentTarget.value);
						}}
						autoFocus
						className="w-full h-full px-4 py-3 border-2 border-stone border-r-0 text-lg focus:border-gold focus:outline-none transition-colors"
					/>
					{inputValue && (
						<button
							type="button"
							onClick={() => setQuery('')}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-black transition-colors"
							aria-label="Clear search"
						>
							&times;
						</button>
					)}
				</div>
				<button
					type="submit"
					className="px-6 bg-gold text-black border-2 border-gold hover:bg-brightgold transition-colors flex items-center gap-2 marcellus uppercase tracking-wider"
				>
					<Icon path={mdiMagnify} size={1} />
					<span className="hidden sm:inline">Search</span>
				</button>
			</form>
			{isSearchStalled && (
				<p className="text-sm text-stone mt-2 animate-pulse">Searching...</p>
			)}
		</div>
	);
}
