'use client';
import Icon from '@mdi/react';
import { mdiAtom } from '@mdi/js';
import {Image} from "@nextui-org/image";
import NextImage from "next/image";
import clsx from 'clsx';


const SelectDetail = ({
		imagePath,
		name,
		description,
		disabled,
		children
	}: {
		imagePath: string,
		name: string,
		description: string,
		disabled: boolean,
		children: React.ReactNode
	}) => {

	let image = (<></>);
	if(imagePath !== "") {
		image = (
			<Image
				as={NextImage}
				width={100}
				height={100}
				src={imagePath}
				alt={`Sigil of ${name}`}
				className='inline ml-2 mt-4' />
		);
	}

	return (
		<>
			<div className={clsx(
			'',
			{
				'hidden': disabled === true,
			})}>
				<h3 className="marcellus text-3xl border-b-2">{name}</h3>
				<div className="flex justify-between">
					<div className="mt-2">
						{description}
					</div>
					<div className="mx-2">
						{image}
					</div>
				</div>
				<div>
					{children}
				</div>
			</div>
			<div className={clsx(
			'h-full grid grid-cols-1 content-center',
			{
				'hidden': disabled === false,
			})}>
				<Icon
					path={mdiAtom}
					className={clsx(
					'mx-auto',
					{
						'opacity-5': disabled === true,
					})}
					size={8} />
			</div>
		</>
	);
};

export default SelectDetail;