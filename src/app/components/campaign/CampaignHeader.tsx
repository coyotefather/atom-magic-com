'use client';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { Campaign } from '@/lib/campaignPersistence';
import { formatFullTimestamp } from '@/lib/adventure-log-data';

interface CampaignHeaderProps {
	campaign: Campaign;
	onNameChange: (name: string) => void;
	onDescriptionChange: (description: string) => void;
	onDelete: () => void;
}

const CampaignHeader = ({
	campaign,
	onNameChange,
	onDescriptionChange,
	onDelete,
}: CampaignHeaderProps) => {
	const [confirmDelete, setConfirmDelete] = useState(false);

	const handleDeleteClick = () => {
		if (confirmDelete) {
			onDelete();
		} else {
			setConfirmDelete(true);
		}
	};

	return (
		<div className="bg-parchment border-2 border-stone p-6 space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-3">
					<div>
						<label className="block text-xs text-stone uppercase tracking-wider mb-2">
							Campaign Name
						</label>
						<input
							type="text"
							value={campaign.name}
							onChange={e => onNameChange(e.target.value)}
							className="w-full px-4 py-2 border-2 border-stone bg-white marcellus text-xl focus:border-bronze focus:outline-none"
							placeholder="Enter campaign name..."
						/>
					</div>
					<div>
						<label className="block text-xs text-stone uppercase tracking-wider mb-2">
							Description
						</label>
						<textarea
							value={campaign.description ?? ''}
							onChange={e => onDescriptionChange(e.target.value)}
							rows={2}
							className="w-full px-4 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none resize-none"
							placeholder="Optional campaign notes or description..."
						/>
					</div>
					<p className="text-xs text-stone/70">
						Created {formatFullTimestamp(campaign.createdAt)}
					</p>
				</div>

				<div className="flex-shrink-0">
					{confirmDelete ? (
						<div className="flex flex-col gap-2 items-end">
							<p className="text-xs text-oxblood">Delete this campaign?</p>
							<div className="flex gap-2">
								<FunctionButton
									variant="ghost"
									size="sm"
									onClick={() => setConfirmDelete(false)}
								>
									Cancel
								</FunctionButton>
								<FunctionButton
									variant="danger"
									size="sm"
									onClick={handleDeleteClick}
									icon={mdiDelete}
								>
									Delete
								</FunctionButton>
							</div>
						</div>
					) : (
						<FunctionButton
							variant="ghost"
							size="sm"
							onClick={handleDeleteClick}
							icon={mdiDelete}
							title="Delete campaign"
							className="text-stone hover:text-oxblood"
						>
							Delete
						</FunctionButton>
					)}
				</div>
			</div>
		</div>
	);
};

export default CampaignHeader;
