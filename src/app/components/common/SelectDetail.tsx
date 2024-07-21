'use client';
import Icon from '@mdi/react';
import clsx from 'clsx';

const SelectDetail = ({
		iconPath,
		name,
		description,
		disabled
	}: {
		iconPath: string,
		name: string,
		description: string,
		disabled: boolean
	}) => {
	return (
		<div className="flex justify-around transition-all duration-200 ease-linear">
			<div className="mx-2 my-auto">
				<Icon
					path={iconPath}
					className={clsx(
					'inline ml-2',
					{
						'opacity-25': disabled === true,
					})}
					size={3}
					horizontal
					vertical />
			</div>
			<div className={clsx(
			'mt-2',
			{
				'hidden': disabled === true,
			})}>
				<h3 className="text-2xl border-b-2 mb-2">{name}</h3>
				<div>
					{description}
				</div>
			</div>
		</div>
	);
};

export default SelectDetail;