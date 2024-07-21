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
		<div>
			<div className={clsx(
			'',
			{
				'hidden': disabled === true,
			})}>
				<h3 className="marcellus text-3xl border-b-2">{name}</h3>
				<div className="flex justify-around">
					<div className="mt-4">
						{description}
					</div>
					<div className="mx-2">
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
			'',
			{
				'hidden': disabled === false,
			})}>
				<Icon
					path={iconPath}
					className={clsx(
					'm-auto',
					{
						'opacity-25': disabled === true,
					})}
					size={5} />
			</div>
		</div>
	);
};

export default SelectDetail;