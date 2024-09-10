import React, { useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {Input} from "@nextui-org/input";
import {Button} from "@nextui-org/react";
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import { useInstantSearch, useSearchBox, UseSearchBoxProps } from 'react-instantsearch';

export default function CustomSearchBox(props: UseSearchBoxProps) {
	const { query, refine } = useSearchBox(props);
	const { status } = useInstantSearch();
	const [inputValue, setInputValue] = useState(query);
	const inputRef = useRef<HTMLInputElement>(null);

	const isSearchStalled = status === 'stalled';

	function setQuery(newQuery: string) {
		debounced(newQuery);
		setInputValue(newQuery);
		//refine(newQuery);
	}

	const debounced = useDebouncedCallback(
		// function
		(value: string) => {
		  //setInputValue(value);
		  refine(value);
		},
		// delay in ms
		1500
	);

	return (
		<div className="w-full">
			<form
				className="flex items-center gap-2"
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
				}}>
				<Input
					isClearable
					variant="bordered"
					size="lg"
					className="block w-full"
					ref={inputRef}
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					placeholder="Search Codex"
					spellCheck={false}
					maxLength={512}
					type="search"
					value={inputValue}
					onChange={(event) => {
						setQuery(event.currentTarget.value);
					}}
					onClear={() => setInputValue("")}
					autoFocus/>
				<Button
					onClick={() => {
						setQuery(inputValue);
					}}
					endContent={<Icon path={mdiMagnify} size={2} />}
					className="bg-sunset-gradient font-bold inconsolata uppercase tracking-widest p-2 pl-4 pr-4 border-black border-2 rounded-full"
 					size="lg"
					type="submit">
					SEARCH
				</Button>
				<span hidden={!isSearchStalled}>Searching…</span>
			</form>
		</div>
	);
}