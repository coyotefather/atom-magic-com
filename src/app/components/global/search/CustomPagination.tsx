import React from 'react';
import Icon from '@mdi/react';
import {
	mdiChevronLeft,
	mdiChevronDoubleLeft,
	mdiChevronRight,
	mdiChevronDoubleRight,
} from '@mdi/js';
import { usePagination, UsePaginationProps } from 'react-instantsearch';
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

	if (nbPages <= 1) {
		return null;
	}

	return (
		<nav className="flex items-center gap-1" aria-label="Pagination">
			{/* First page */}
			<PaginationButton
				isDisabled={isFirstPage}
				href={createURL(firstPageIndex)}
				onClick={() => refine(firstPageIndex)}
				aria-label="First page"
			>
				<Icon path={mdiChevronDoubleLeft} size={0.875} />
			</PaginationButton>

			{/* Previous page */}
			<PaginationButton
				isDisabled={isFirstPage}
				href={createURL(previousPageIndex)}
				onClick={() => refine(previousPageIndex)}
				aria-label="Previous page"
			>
				<Icon path={mdiChevronLeft} size={0.875} />
			</PaginationButton>

			{/* Page numbers */}
			{pages.map((page) => {
				const label = page + 1;
				const isActive = page === currentRefinement;

				return (
					<PaginationButton
						key={page}
						isDisabled={false}
						isActive={isActive}
						href={createURL(page)}
						onClick={() => refine(page)}
						aria-label={`Page ${label}`}
						aria-current={isActive ? 'page' : undefined}
					>
						{label}
					</PaginationButton>
				);
			})}

			{/* Next page */}
			<PaginationButton
				isDisabled={isLastPage}
				href={createURL(nextPageIndex)}
				onClick={() => refine(nextPageIndex)}
				aria-label="Next page"
			>
				<Icon path={mdiChevronRight} size={0.875} />
			</PaginationButton>

			{/* Last page */}
			<PaginationButton
				isDisabled={isLastPage}
				href={createURL(lastPageIndex)}
				onClick={() => refine(lastPageIndex)}
				aria-label="Last page"
			>
				<Icon path={mdiChevronDoubleRight} size={0.875} />
			</PaginationButton>
		</nav>
	);
}

interface PaginationButtonProps {
	isDisabled: boolean;
	isActive?: boolean;
	href: string;
	onClick: () => void;
	children: React.ReactNode;
	'aria-label'?: string;
	'aria-current'?: 'page' | undefined;
}

function PaginationButton({
	isDisabled,
	isActive = false,
	href,
	onClick,
	children,
	...props
}: PaginationButtonProps) {
	const baseClasses =
		'w-10 h-10 flex items-center justify-center border-2 transition-colors marcellus text-sm';

	if (isDisabled) {
		return (
			<span
				className={clsx(
					baseClasses,
					'border-stone/30 text-stone/30 cursor-not-allowed'
				)}
				{...props}
			>
				{children}
			</span>
		);
	}

	return (
		<a
			href={href}
			onClick={(event) => {
				if (isModifierClick(event)) {
					return;
				}
				event.preventDefault();
				onClick();
			}}
			className={clsx(
				baseClasses,
				'no-underline',
				isActive
					? 'bg-gold border-gold text-black'
					: 'border-stone text-stone hover:border-gold hover:text-gold'
			)}
			{...props}
		>
			{children}
		</a>
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
