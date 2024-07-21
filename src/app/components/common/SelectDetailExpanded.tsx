'use client';
import Icon from '@mdi/react';
import {Image} from "@nextui-org/image";
import clsx from 'clsx';

const SelectDetail = ({
		imagePath,
		name,
		description,
		disabled
	}: {
		imagePath: string,
		name: string,
		description: string,
		disabled: boolean
	}) => {
	return (
		<>
			<div className={clsx(
			'',
			{
				'hidden': disabled === true,
			})}>
				<h3 className="marcellus text-3xl border-b-2">{name}</h3>
				<div className="flex justify-around">
					<div className="mt-2">
						{description}
					</div>
					<div className="mx-2">
						<Image
							src={`./public/sigils/${imagePath}.svg`}
							alt={`Sigil of ${name}`}
							className='inline ml-2'
							width={100} />
					</div>
				</div>
				<div>
					Patronage Benefits table
				</div>
			</div>
			<div className={clsx(
			'h-full grid grid-cols-1 content-center',
			{
				'hidden': disabled === false,
			})}>
				<Icon
					path={iconPath}
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