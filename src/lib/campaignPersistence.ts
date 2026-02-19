import {
	Session,
	SessionSummary,
} from './adventure-log-data';
import {
	getSessionRoster,
	getSessionById,
	saveSessionById,
} from './sessionPersistence';

export interface Campaign {
	id: string;
	name: string;
	description?: string;
	partyCharacterIds: string[];
	createdAt: string;
	lastModified: string;
}

const CAMPAIGN_KEY = 'atom-magic-campaign';

export const getCampaign = (): Campaign | null => {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(CAMPAIGN_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as Campaign;
	} catch (err) {
		console.error('Failed to load campaign:', err);
		return null;
	}
};

export const saveCampaign = (campaign: Campaign): void => {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
	} catch (err) {
		console.error('Failed to save campaign:', err);
	}
};

export const deleteCampaign = (): void => {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(CAMPAIGN_KEY);
	} catch (err) {
		console.error('Failed to delete campaign:', err);
	}
};

export const linkSessionToCampaign = (sessionId: string, campaignId: string): void => {
	if (typeof window === 'undefined') return;
	const session = getSessionById(sessionId);
	if (!session) return;
	const updated = { ...session, campaignId };
	saveSessionById(sessionId, updated);
};

export const unlinkSessionFromCampaign = (sessionId: string): void => {
	if (typeof window === 'undefined') return;
	const session = getSessionById(sessionId);
	if (!session) return;
	const { campaignId: _removed, ...rest } = session;
	saveSessionById(sessionId, rest as Session);
};

export const getLinkedSessions = (campaignId: string): SessionSummary[] => {
	if (typeof window === 'undefined') return [];
	const roster = getSessionRoster();
	return roster.sessions.filter((summary) => summary.campaignId === campaignId);
};
