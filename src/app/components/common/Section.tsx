'use client';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';
import {Image} from "@nextui-org/image";
import NextImage from "next/image";

const Section = ({
		expanded,
		variant,
		name = "",
		children
	}: {
		expanded: Boolean,
		variant: string,
		name: string,
		children: React.ReactNode
	}) => {
	let headTag = (<></>);
	if(name !== "") {
		headTag = (<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">{name}</h2>);
	}
	return (
		<div className={clsx(
			'relative',
			{
				'h-0 hidden': expanded === false
			},
			{
				'h-auto border-t-2 overflow-y-visible': expanded === true
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
			<div className="w-[100px] h-[100px] absolute left-1/2 -bottom-[35px]">
				<div className="bg-standard-gradient border-4 border-black rounded-full w-[70px] h-[70px] grid grid-cols-1 content-center z-10 absolute -left-[35px] bottom-0">
					<NextImage
					width={40}
					height={40}
					src="/atom-magic-circle-black.png"
					className="mx-auto"
					alt="Atom Magic Circle" />
				</div>
			</div>
		</div>
	);
};

export default Section;