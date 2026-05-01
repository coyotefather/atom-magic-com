/**
 * Section.tsx
 *
 * A collapsible wizard step container used in the Character Manager creation
 * flow. Each character creation step (choose culture, choose path, set scores,
 * etc.) is wrapped in a Section so that only one step is visible at a time and
 * the user must complete each step before advancing.
 *
 * Behavior:
 *   - When `expanded` is false the section is hidden entirely (zero-height,
 *     `hidden` class applied).
 *   - When `expanded` is true the section content is visible, with a bottom
 *     border separating it from the next step.
 *   - A "CONTINUE" button floats centered on the bottom border. When clicked:
 *       - If `incomplete` is a non-empty string (required field names), an
 *         ErrorDialog modal fires instead of advancing.
 *       - If all required fields are filled, `expandFunction` is called to
 *         expand the next section, then the page smoothly scrolls to the
 *         newly revealed content using double-rAF (waits for DOM paint).
 *   - When `nextExpanded` is true the button switches from "CONTINUE" to a
 *     small Atom Magic circle icon, indicating the user has already passed
 *     this step and cannot re-activate it from here.
 *
 * Four background/style variants via the `variant` prop:
 *   - "light"     — standard white background with container padding
 *   - "dark"      — black background, white text
 *   - "gradient"  — applies the project's standard-gradient utility class
 *   - "dual"      — white background with a black border
 *
 * Transitions: uses react-transition-group's SwitchTransition + CSSTransition
 * so sections fade in/out smoothly when their expanded state changes.
 *
 * Props:
 *   - expanded: boolean        — whether this section is currently visible
 *   - nextExpanded: boolean    — whether the NEXT section is already open
 *                                (changes the continue button to a passive icon)
 *   - incomplete: string       — name(s) of missing required fields; empty string
 *                                means all required fields are complete
 *   - variant: string          — visual style ('light' | 'dark' | 'gradient' | 'dual')
 *   - clickCheck: Function     — called with true/false to notify parent whether
 *                                validation failed
 *   - showExpandButton: boolean — whether the continue button is shown at all
 *   - expandFunction: Function  — called to expand the next section
 *   - children: ReactNode       — the section's form content
 *
 * Used by:
 *   - src/app/components/character/Sections.tsx (orchestrates all wizard steps)
 */

'use client';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import NextImage from "next/image";
import { mdiArrowDownBoldCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, useOverlayState } from "@heroui/react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ErrorDialog from '@/app/components/common/ErrorDialog';

const Section = ({
		expanded,
		nextExpanded,
		incomplete,
		variant,
		clickCheck,
		showExpandButton,
		expandFunction,
		children
	}: {
		expanded: boolean,
		nextExpanded: boolean,
		incomplete: string,
		variant: string,
		clickCheck: Function,
		showExpandButton: boolean,
		expandFunction: Function,
		children: React.ReactNode
	}) => {

	const overlayState = useOverlayState();
	const isOpen = overlayState.isOpen;
	const onOpen = overlayState.open;
	const onOpenChange = (open: boolean) => open ? overlayState.open() : overlayState.close();
	const sectionRef = useRef(null);
	const buttonRef = useRef(null);
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const handleClick = () => {
		if(incomplete) {
			onOpen();
			clickCheck(true);
		} else {
			clickCheck(false);
			expandFunction();
			// Use requestAnimationFrame to wait for the DOM update, then scroll
			// This is more reliable than arbitrary setTimeout delays
			if (bottomRef) {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
					});
				});
			}
		}
	};

	let buttonGraphic = (
		<Icon
			path={mdiArrowDownBoldCircleOutline}
			className="text-black"
			size={1} />
	);
	if(nextExpanded) {
		buttonGraphic = (
			<NextImage
				width={20}
				height={20}
				src="/atom-magic-circle-black.png"
				alt="Review Below Section" />
		);
	}

	return (
		<SwitchTransition mode="out-in">
			<CSSTransition
				key={expanded ? "x" : "y"}
				nodeRef={sectionRef}
				timeout={100}
				classNames='grow'
				>
				<div ref={sectionRef} className={clsx(
					'relative',
					{
						'max-x-0 hidden': expanded === false
					},
					{
						'border-b-2 overflow-y-visible': expanded === true
					},
					{
						'pt-16 pb-16 container': variant === 'light'
					},
					{
						'bg-black text-white': variant === 'dark'
					},
					{
						'standard-gradient': variant === 'gradient'
					},
					{
						'border-black bg-white': variant === 'dual'
					},
				)}>
					{children}
					<div className={clsx(
					'w-[100px] h-[100px] absolute left-1/2 -bottom-[35px]',
					{
						'w-[100px] h-[100px]': showExpandButton === true
					},
					{
						'w-[0px] h-[0px] hidden': showExpandButton === false
					},
					)}>
						<SwitchTransition mode="out-in">
							<CSSTransition
								key={nextExpanded ? "x" : "y"}
								nodeRef={buttonRef}
								timeout={100}
								classNames='fade'>
								<div className={clsx(
									"bg-white z-10 absolute bottom-[10px] transition duration-300 ease-in",
									{ '-left-[74px]': !nextExpanded },
									{ '-left-[23px]': nextExpanded },
								)}>
									{/* White background to cover section border line */}
									<div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%+16px)] h-4 bg-white" />
									<Button
										ref={buttonRef}
										onPress={handleClick}
										isIconOnly={nextExpanded}
										isDisabled={nextExpanded}
										className={clsx("font-extrabold relative z-10 marcellus",
											{
												'uppercase tracking-widest px-6 py-2 bg-gold text-black border-2 border-oxblood hover:bg-brightgold transition-colors': nextExpanded === false
											},
											{
												'cursor-default bg-white border-2 border-stone': nextExpanded === true
											},
										)}>
										{ nextExpanded ? buttonGraphic : <>CONTINUE{buttonGraphic}</>}
									</Button>
								</div>
							</CSSTransition>
						</SwitchTransition>
						<ErrorDialog
							title="Please complete the missing fields."
							message="It looks like you didn't enter all the required information. Please complete the following required field(s):"
							buttonText="Close"
							incomplete={incomplete}
							isOpen={isOpen}
							onOpenChange={onOpenChange} />
					</div>
					<div ref={bottomRef}></div>
				</div>
			</CSSTransition>
		</SwitchTransition>
	);
};

export default Section;