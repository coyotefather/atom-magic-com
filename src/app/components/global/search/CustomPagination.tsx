import React from 'react';
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
		<div className="flex flex-row gap-2">
			<PaginationItem
				isDisabled={isFirstPage}
				href={createURL(firstPageIndex)}
				onClick={() => refine(firstPageIndex)}
				iconOnly={true}
				currentPage={null}
				thisPage={null}>
				<Icon path={mdiChevronDoubleLeft} size={1} />
			</PaginationItem>
			<PaginationItem
				isDisabled={isFirstPage}
				href={createURL(previousPageIndex)}
				onClick={() => refine(previousPageIndex)}
				iconOnly={true}
				currentPage={null}
				thisPage={null}>
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
					iconOnly={false}
					currentPage={currentRefinement}
					thisPage={page}>
					<div className="text-black text-md text-lg">{label}</div>
				</PaginationItem>
				);
			})}
			<PaginationItem
				isDisabled={isLastPage}
				href={createURL(nextPageIndex)}
				onClick={() => refine(nextPageIndex)}
				iconOnly={true}
				currentPage={null}
				thisPage={null}>
				<Icon path={mdiChevronRight} size={1} />
			</PaginationItem>
			<PaginationItem
				isDisabled={isLastPage}
				href={createURL(lastPageIndex)}
				onClick={() => refine(lastPageIndex)}
				iconOnly={true}
				currentPage={null}
				thisPage={null}>
				<Icon path={mdiChevronDoubleRight} size={1} />
			</PaginationItem>
		</div>
	);
}

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
	onClick: NonNullable<React.ComponentProps<'a'>['onClick']>;
	isDisabled: boolean;
	iconOnly: boolean;
	currentPage: number | null;
	thisPage: number | null;
};

function PaginationItem({
	isDisabled,
	href,
	onClick,
	iconOnly,
	currentPage,
	thisPage,
	...props
	}: PaginationItemProps) {
	if (isDisabled) {
		return (
			<button className="rounded-full opacity-25 border-0" disabled={true}>
				<span {...props} />
			</button>
		);
	}

	return (
		<button className={clsx(
			'rounded-full w-10 h-10',
			{ 'm-2': !iconOnly},
			)}>
			<a
				className={clsx(
					'rounded-full inline-block no-underline',
					{ 'w-full h-full flex items-center justify-center': !iconOnly },
					{ 'sunset-gradient': thisPage === currentPage },
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
		</button>
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