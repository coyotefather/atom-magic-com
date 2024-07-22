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
					<div>
						<Icon
							path={iconPath}
							className={clsx(
							'inline ml-2',
							{
								'opacity-25': disabled === true,
							})}
							size={5} />
					</div>
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