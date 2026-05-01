/**
 * CampaignDashboard.tsx
 *
 * Main orchestrator for the Campaign feature. A campaign is the top-level
 * container for a long-running game — it groups a party of characters and
 * links to their Adventure Log sessions.
 *
 * State is persisted in localStorage via `campaignPersistence.ts`. Only one
 * campaign is stored at a time (single-campaign design). On mount, loads the
 * existing campaign or offers a "Create Campaign" flow.
 *
 * Sub-components:
 * - CampaignHeader: campaign name/description editor with delete
 * - PartyRoster: add/remove characters to the campaign party
 * - SessionLinker: link/unlink Adventure Log sessions to the campaign
 *
 * Used by:
 *   - `src/app/components/campaign/CampaignClientContainer.tsx`
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import CampaignHeader from './CampaignHeader';
import PartyRoster from './PartyRoster';
import SessionLinker from './SessionLinker';
import {
	Campaign,
	getCampaign,
	saveCampaign,
	deleteCampaign,
	linkSessionToCampaign,
	unlinkSessionFromCampaign,
	getLinkedSessions,
} from '@/lib/campaignPersistence';
import { getSessionRoster } from '@/lib/sessionPersistence';
import { SessionSummary } from '@/lib/adventure-log-data';

const CampaignDashboard = () => {
	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [linkedSessions, setLinkedSessions] = useState<SessionSummary[]>([]);
	const [allSessions, setAllSessions] = useState<SessionSummary[]>([]);

	// Load from localStorage on mount
	useEffect(() => {
		const saved = getCampaign();
		setCampaign(saved);
		const roster = getSessionRoster();
		setAllSessions(roster.sessions);
		if (saved) {
			setLinkedSessions(getLinkedSessions(saved.id));
		}
	}, []);

	const unlinkedSessions = allSessions.filter(
		s => !linkedSessions.some(l => l.id === s.id)
	);

	// --- Campaign CRUD ---

	const handleCreate = () => {
		const now = new Date().toISOString();
		const newCampaign: Campaign = {
			id: crypto.randomUUID(),
			name: 'New Campaign',
			partyCharacterIds: [],
			createdAt: now,
			lastModified: now,
		};
		saveCampaign(newCampaign);
		setCampaign(newCampaign);
	};

	const updateCampaign = useCallback((updates: Partial<Campaign>) => {
		setCampaign(prev => {
			if (!prev) return prev;
			const updated = { ...prev, ...updates, lastModified: new Date().toISOString() };
			saveCampaign(updated);
			return updated;
		});
	}, []);

	const handleDelete = () => {
		// Unlink all sessions before deleting
		linkedSessions.forEach(s => unlinkSessionFromCampaign(s.id));
		deleteCampaign();
		setCampaign(null);
		setLinkedSessions([]);
	};

	// --- Party roster ---

	const handleAddCharacter = (characterId: string) => {
		if (!campaign) return;
		if (campaign.partyCharacterIds.includes(characterId)) return;
		updateCampaign({ partyCharacterIds: [...campaign.partyCharacterIds, characterId] });
	};

	const handleRemoveCharacter = (characterId: string) => {
		if (!campaign) return;
		updateCampaign({
			partyCharacterIds: campaign.partyCharacterIds.filter(id => id !== characterId),
		});
	};

	// --- Session linking ---

	const handleLinkSession = (sessionId: string) => {
		if (!campaign) return;
		if (linkedSessions.some(s => s.id === sessionId)) return;
		linkSessionToCampaign(sessionId, campaign.id);
		// Move session from unlinked to linked in local state
		const session = allSessions.find(s => s.id === sessionId);
		if (session) {
			setLinkedSessions(prev => [...prev, session]);
		}
	};

	const handleUnlinkSession = (sessionId: string) => {
		unlinkSessionFromCampaign(sessionId);
		setLinkedSessions(prev => prev.filter(s => s.id !== sessionId));
	};

	// --- Render ---

	if (!campaign) {
		return (
			<div className="bg-parchment border-2 border-stone p-12 text-center max-w-md mx-auto">
				<Icon path={mdiPlus} size={3} className="mx-auto text-stone/30 mb-4" />
				<p className="text-stone mb-6">
					No campaign set up yet. Create one to start linking sessions and tracking your party.
				</p>
				<button
					onClick={handleCreate}
					className="px-6 py-3 bg-laurel text-white marcellus uppercase tracking-wider hover:bg-gold transition-colors"
				>
					Create Campaign
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<CampaignHeader
				campaign={campaign}
				onNameChange={name => updateCampaign({ name })}
				onDescriptionChange={description => updateCampaign({ description })}
				onDelete={handleDelete}
			/>

			<div className="bg-parchment border-2 border-stone p-6">
				<PartyRoster
					partyCharacterIds={campaign.partyCharacterIds}
					onAdd={handleAddCharacter}
					onRemove={handleRemoveCharacter}
				/>
			</div>

			<div className="bg-parchment border-2 border-stone p-6">
				<SessionLinker
					linkedSessions={linkedSessions}
					unlinkedSessions={unlinkedSessions}
					onLink={handleLinkSession}
					onUnlink={handleUnlinkSession}
				/>
			</div>
		</div>
	);
};

export default CampaignDashboard;
