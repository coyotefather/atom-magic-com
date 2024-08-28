import React from 'react';
import {Button, ButtonGroup} from "@nextui-org/react";
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronDoubleLeft, mdiChevronRight, mdiChevronDoubleRight } from '@mdi/js';
import { usePagination, UsePaginationProps, } from 'react-instantsearch';
import clsx from 'clsx';

export default function CustomPagination(props: UsePaginationProps) {
	const {
		pages,
		currentRefinement,
		nbPages,
		isFirstPage,
		isLastPage,
		refine,
		createURL,
	} = usePagination(props);
	const firstPageIndex = 0;
	const previousPageIndex = currentRefinement - 1;
	const nextPageIndex = currentRefinement + 1;
	const lastPageIndex = nbPages - 1;

	return (
		<ButtonGroup variant="light" className="bg-sunset-gradient border-2 border-black divide-x-2 rounded-full">
			<PaginationItem
				isDisabled={isFirstPage}
				href={createURL(firstPageIndex)}
				onClick={() => refine(firstPageIndex)}
				iconOnly={true}>
				<Icon path={mdiChevronDoubleLeft} size={1} />
			</PaginationItem>
			<PaginationItem
				isDisabled={isFirstPage}
				href={createURL(previousPageIndex)}
				onClick={() => refine(previousPageIndex)}
				iconOnly={true}>
				<Icon path={mdiChevronLeft} size={1} />
			</PaginationItem>
			{pages.map((page) => {
				const label = page + 1;

				return (
				<PaginationItem
					key={page}
					isDisabled={false}
					aria-label={`Page ${label}`}
					href={createURL(page)}
					onClick={() => refine(page)}
					iconOnly={false}>
					<div className="text-black text-md text-lg">{label}</div>
				</PaginationItem>
				);
			})}
			<PaginationItem
				isDisabled={isLastPage}
				href={createURL(nextPageIndex)}
				onClick={() => refine(nextPageIndex)}
				iconOnly={true}>
				<Icon path={mdiChevronRight} size={1} />
			</PaginationItem>
			<PaginationItem
				isDisabled={isLastPage}
				href={createURL(lastPageIndex)}
				onClick={() => refine(lastPageIndex)}
				iconOnly={true}>
				<Icon path={mdiChevronDoubleRight} size={1} />
			</PaginationItem>
		</ButtonGroup>
	);
}

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
	onClick: NonNullable<React.ComponentProps<'a'>['onClick']>;
	isDisabled: boolean;
	iconOnly: boolean;
};

function PaginationItem({
	isDisabled,
	href,
	onClick,
	iconOnly,
	...props
	}: PaginationItemProps) {
	if (isDisabled) {
		return (
			<Button isIconOnly={iconOnly} isDisabled={true}>
			<span {...props} />
			</Button>
		);
	}

	return (
		<Button className={clsx(
			'',
			{ 'p-0': !iconOnly},
			)} isIconOnly={iconOnly}>
			<a
				className={clsx(
					'',
					{ 'w-full h-full flex items-center justify-center': !iconOnly }
					)}
				href={href}
				onClick={(event) => {
					if (isModifierClick(event)) {
						return;
					}

					event.preventDefault();

					onClick(event);
				}}
				{...props}
			/>
		</Button>
	);
}

function isModifierClick(event: React.MouseEvent) {
	const isMiddleClick = event.button === 1;

	return Boolean(
		isMiddleClick ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	);
}