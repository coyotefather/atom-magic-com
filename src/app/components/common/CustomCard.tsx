'use client';
import {Card, CardHeader, CardFooter} from "@heroui/react";
import Icon from '@mdi/react';
import { mdiFileDocument, mdiFolderText } from '@mdi/js';
import Image from "next/image";
import clsx from 'clsx';

const CustomCard = ({
		type,
		title,
		description,
		url,
		imagePath,
		showImage,
	}: {
		type: string,
		title: string,
		description: string,
		url: string,
		imagePath: string,
		showImage: boolean
	}) => {

	const imgSrc = imagePath ? imagePath : "/atom-magic-circle-black.png";
	const iconPath = type === "category" ? mdiFolderText : mdiFileDocument;
	const iconSize = type === "category" ? 2 : 1;
	const isCategory = type === "category";

	return (
		<a
			href={url}
			className="transition duration-200 ease-in hover:brightness-110 hover:drop-shadow-lg block w-full no-underline hover:no-underline"
		>
			<Card shadow="sm" className={clsx(
				"w-full notoserif",
				isCategory ? 'gold-gradient' : 'bg-parchment',
				showImage ? 'h-[300px]' : 'h-[200px]',
			)}>
				<CardHeader
					className="bg-ivory-black items-start absolute z-10 top-0 border-b-2 border-gold">
					<h2 className={clsx(
						"marcellus mt-0 mb-0 w-full flex flex-row items-center justify-start text-gold no-underline hover:no-underline",
						isCategory ? 'text-3xl' : 'text-xl',
					)}>
						<Icon
							className="text-gold align-center mr-2"
							path={iconPath}
							size={iconSize} />
						{title}
					</h2>
				</CardHeader>
				<Image
					className={clsx(
						"z-0 w-full h-full object-cover",
						!showImage && 'hidden'
					)}
					src={imgSrc}
					width={150}
					height={150}
					alt=""
				/>
				<CardFooter
					className="bg-ivory-black not-prose font-normal text-white text-md flex-col items-start! absolute z-10 bottom-0 min-h-28">
					{description}
				</CardFooter>
			</Card>
		</a>
	);
};

export default CustomCard;
