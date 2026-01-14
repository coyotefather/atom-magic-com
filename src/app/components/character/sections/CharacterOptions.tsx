'use client';
import { useRef } from 'react';
import Icon from '@mdi/react';
import {
	mdiArrowDownBoldCircleOutline,
	mdiUploadCircleOutline,
	mdiDiceMultiple,
} from '@mdi/js';

interface CharacterOptionCardProps {
	title: string;
	description: string;
	icon: string;
	buttonText: string;
	onClick: () => void;
}

const CharacterOptionCard = ({
	title,
	description,
	icon,
	buttonText,
	onClick,
}: CharacterOptionCardProps) => {
	return (
		<div className="bg-white border-2 border-stone hover:border-oxblood transition-colors group">
			<div className="h-1 bg-oxblood" />
			<div className="p-6 text-center">
				<div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border-2 border-stone group-hover:border-oxblood transition-colors">
					<Icon
						path={icon}
						size={1.25}
						className="text-stone group-hover:text-oxblood transition-colors"
					/>
				</div>
				<h3 className="marcellus text-xl text-black mb-2">{title}</h3>
				<p className="text-sm text-stone-dark mb-4">{description}</p>
				<button
					onClick={onClick}
					className="w-full py-3 px-4 bg-oxblood text-white marcellus uppercase tracking-wider text-sm hover:bg-oxblood-dark transition-colors"
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
};

const CharacterOptions = ({
	buttonFunction,
}: {
	buttonFunction: () => void;
}) => {
	const bottomRef = useRef<null | HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (bottomRef) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					bottomRef.current?.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
					});
				});
			});
		}
	};

	const handleStartClick = () => {
		scrollToBottom();
	};

	const handleManageClick = () => {
		buttonFunction();
		scrollToBottom();
	};

	const handleGenerateClick = () => {
		buttonFunction();
		scrollToBottom();
	};

	return (
		<section className="bg-parchment py-8 md:py-12">
			<div className="container px-6 md:px-8">
				<div className="text-center mb-8">
					<h2 className="marcellus text-2xl md:text-3xl text-black mb-2">
						Choose Your Path
					</h2>
					<p className="text-stone-dark">
						Start fresh, continue an existing character, or let fate decide.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
					<CharacterOptionCard
						title="New Character"
						description="Build a practitioner from scratch, step by step."
						icon={mdiArrowDownBoldCircleOutline}
						buttonText="Start"
						onClick={handleStartClick}
					/>
					<CharacterOptionCard
						title="Manage Character"
						description="Continue working on an existing character."
						icon={mdiUploadCircleOutline}
						buttonText="Manage"
						onClick={handleManageClick}
					/>
					<CharacterOptionCard
						title="Generate Character"
						description="Roll the dice and let fate guide your creation."
						icon={mdiDiceMultiple}
						buttonText="Generate"
						onClick={handleGenerateClick}
					/>
				</div>
			</div>
			<div ref={bottomRef}></div>
		</section>
	);
};

export default CharacterOptions;
