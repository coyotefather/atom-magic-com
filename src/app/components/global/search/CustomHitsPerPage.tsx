import React from 'react';
import {Select, SelectSection, SelectItem} from "@heroui/select";
import {
	useHitsPerPage,
	UseHitsPerPageProps,
} from 'react-instantsearch';

export default function CustomHitsPerPage(props: UseHitsPerPageProps) {
	const { items, refine } = useHitsPerPage(props);
	const { value: currentValue } = items.find(({ isRefined }) => isRefined)! || {};

	return (
		<Select
			label="Items per page"
			variant="bordered"
			size="sm"
			className="max-w-64"
			onChange={(event) => {
			refine(Number(event.target.value));
			}}
			value={String(currentValue)}>
			{items.map((item) => (
				<SelectItem
					key={item.value}>
					{item.label}
				</SelectItem>
			))}
		</Select>
	);
}