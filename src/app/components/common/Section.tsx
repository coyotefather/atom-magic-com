'use client';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import NextImage from "next/image";
import { mdiArrowDownBoldCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Link, Image, useDisclosure } from "@nextui-org/react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ErrorDialog from '@/app/components/common/ErrorDialog';

const Section = ({
		expanded,
		nextExpanded,
		incomplete,
		variant,
		showExpandButton,
		expandFunction,
		children
	}: {
		expanded: boolean,
		nextExpanded: boolean,
		incomplete: string[],
		variant: string,
		showExpandButton: boolean,
		expandFunction: Function,
		children: React.ReactNode
	}) => {

	const {isOpen, onOpen, onOpenChange} = useDisclosure();
	const sectionRef = useRef(null);
	const buttonRef = useRef(null);
	const bottomRef = useRef<null | HTMLDivElement>(null);
	const handleClick = () => {
		if(incomplete.length !== 0) {
			onOpen();
		} else {
			expandFunction();
			if (bottomRef) {
				setTimeout( () => {
					bottomRef.current?.scrollIntoView({behavior: 'smooth', block: "start"});
				}, 500 );
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
						'bg-standard-gradient': variant === 'gradient'
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
									"rounded-full z-10 absolute bottom-[10px] bg-sunset-gradient border-black transition-all duration-300 ease-out",
									{ '-left-[74px]': !nextExpanded },
									{ '-left-[23px]': nextExpanded },
								)}>
									<Button
										ref={buttonRef}
										onClick={handleClick}
										radius="full"
										size="lg"
										variant="bordered"
										isIconOnly={nextExpanded}
										endContent={buttonGraphic}
										isDisabled={nextExpanded}
										disableRipple={true}
										className={clsx("text-black inconsolata font-bold border-black bg-transparent transition-all duration-300 ease-out",
											{
												'hover:bg-sunset-red uppercase tracking-widest p-2 pl-4 pr-4': nextExpanded === false
											},
											{
												'cursor-default bg-white opacity-100': nextExpanded === true
											},
										)}>
										{ nextExpanded ? "" : "CONTINUE"}
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