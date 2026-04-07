'use client';
import Icon from '@mdi/react';
import { mdiAtom } from '@mdi/js';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkExtendedTable } from 'remark-extended-table';
import { remarkDefinitionList } from 'remark-definition-list';
import remarkHeadingId from 'remark-heading-id';
import NextImage from "next/image";
import clsx from 'clsx';
import { RichText } from '@/app/components/common/RichText';
import type { LexicalContent } from '@/app/components/common/RichText';


const SelectDetail = ({
		imagePath,
		name,
		description,
		disabled,
		children
	}: {
		imagePath: string,
		name: string,
		description: string | LexicalContent,
		disabled: boolean,
		children: React.ReactNode
	}) => {

	const renderDescription = (desc: typeof description) => {
		if (!desc) return null;
		if (typeof desc === 'string') {
			return (
				<Markdown remarkPlugins={[remarkGfm, remarkExtendedTable, remarkDefinitionList, [remarkHeadingId, {defaults: true, uniqueDefaults: true }]]}>
					{desc}
				</Markdown>
			);
		}
		return <RichText content={desc} />;
	};

	let image = (<></>);
	if(imagePath !== "") {
		image = (
			<NextImage
				width={150}
				height={150}
				src={imagePath}
				alt={`Sigil of ${name}`} />
		);
	}

	return (
		<>
			<div className={clsx(
			'p-4 border-2 border-gold bg-white',
			{
				'hidden': disabled === true,
			})}>
				<div className="grid grid-cols-3 gap-4">
					<div className={clsx(
						"",
						{ "col-span-2": imagePath !== "" },
						{ "col-span-3": imagePath === "" },
					)}>
						<h3 className="marcellus text-3xl border-b-2 mb-4">{name}</h3>
						<div className="prose prose-sm">
							{renderDescription(description)}
						</div>
					</div>
					<div className="flex justify-around">
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
				<NextImage
					width={150}
					height={150}
					src="/atom-magic-circle-black.png"
					className="opacity-5 mx-auto"
					alt="Atom Magic Circle" />
				<div className="text-center m-8 text-sm opacity-75">
					{renderDescription(description)}
				</div>
			</div>
		</>
	);
};

export default SelectDetail;