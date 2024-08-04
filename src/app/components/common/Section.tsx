'use client';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';
import {Image} from "@nextui-org/image";
import NextImage from "next/image";
import { mdiArrowUpBoldCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const Section = ({
		expanded,
		variant,
		showExpandButton,
		expandFunction,
		children
	}: {
		expanded: Boolean,
		variant: string,
		showExpandButton: Boolean,
		expandFunction: Function,
		children: React.ReactNode
	}) => {

	const sectionRef = useRef(null);
	const buttonRef = useRef(null);
	const [buttonGraphic, setButtonGraphic] = useState(false);
	const buttonIcon = (
		<Icon
			path={mdiArrowUpBoldCircleOutline}
			className="mx-auto text-black"
			alt="Expand Next Section"
			size={2}
			horizontal
			vertical />
	);
	const buttonImage = (
		<NextImage
			width={40}
			height={40}
			src="/atom-magic-circle-black.png"
			className="mx-auto"
			alt="Review Below Section" />
	);

	let headTag = (<></>);
	if(name !== "") {
		headTag = (<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">{name}</h2>);
	}

	const handleClick = () => {
		setButtonGraphic(true);
		expandFunction();
	};

	return (
		<SwitchTransition mode="out-in">
			<CSSTransition
				key={expanded ? "x" : "y"}
				nodeRef={sectionRef}
				timeout={300}
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
						'border-black': variant === 'dual'
					},
				)}>
					{headTag}
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
						<div
							className="bg-standard-gradient border-4 border-black rounded-full w-[70px] h-[70px] grid grid-cols-1 content-center z-10 absolute -left-[35px] bottom-0"
							onClick={handleClick}>
							<SwitchTransition mode="out-in">
								<CSSTransition
									key={buttonGraphic ? "x" : "y"}
									nodeRef={buttonRef}
									timeout={300}
									classNames='fade'>
									<div ref={buttonRef}>
										{buttonGraphic === false ? buttonIcon : (<></>)}
										{buttonGraphic === true ? buttonImage : (<></>)}
									</div>
								</CSSTransition>
							</SwitchTransition>
						</div>
					</div>
				</div>
			</CSSTransition>
		</SwitchTransition>
	);
};

export default Section;