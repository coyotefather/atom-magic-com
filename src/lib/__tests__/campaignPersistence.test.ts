import {
	getCampaign,
	saveCampaign,
	deleteCampaign,
	linkSessionToCampaign,
	unlinkSessionFromCampaign,
	getLinkedSessions,
	type Campaign,
} from '@/lib/campaignPersistence';
import { saveSessionById, getSessionRoster } from '@/lib/sessionPersistence';
import { createNewSession } from '@/lib/adventure-log-data';

const CAMPAIGN_KEY = 'atom-magic-campaign';

function makeCampaign(overrides?: Partial<Campaign>): Campaign {
	return {
		id: 'campaign-1',
		name: 'The Iron Throne Campaign',
		partyCharacterIds: [],
		createdAt: '2026-02-18T10:00:00.000Z',
		lastModified: '2026-02-18T10:00:00.000Z',
		...overrides,
	};
}

beforeEach(() => {
	localStorage.clear();
});

describe('getCampaign', () => {
	it('returns null when no campaign is saved', () => {
		expect(getCampaign()).toBeNull();
	});

	it('returns the saved campaign', () => {
		const campaign = makeCampaign();
		localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
		expect(getCampaign()).toEqual(campaign);
	});
});

describe('saveCampaign', () => {
	it('persists the campaign to localStorage', () => {
		const campaign = makeCampaign();
		saveCampaign(campaign);
		const raw = localStorage.getItem(CAMPAIGN_KEY);
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!)).toMatchObject({ id: 'campaign-1', name: 'The Iron Throne Campaign' });
	});
});

describe('deleteCampaign', () => {
	it('removes the campaign from localStorage', () => {
		saveCampaign(makeCampaign());
		deleteCampaign();
		expect(localStorage.getItem(CAMPAIGN_KEY)).toBeNull();
	});

	it('does nothing when no campaign exists', () => {
		expect(() => deleteCampaign()).not.toThrow();
	});
});

describe('linkSessionToCampaign', () => {
	it('sets campaignId on the session', () => {
		const session = createNewSession('Test Session');
		session.id = 'session-abc';
		saveSessionById(session.id, session);

		linkSessionToCampaign('session-abc', 'campaign-1');

		// Re-read the session from localStorage
		const raw = localStorage.getItem('atom-magic-session-session-abc');
		const saved = JSON.parse(raw!);
		expect(saved.campaignId).toBe('campaign-1');
	});

	it('does nothing if session does not exist', () => {
		expect(() => linkSessionToCampaign('nonexistent', 'campaign-1')).not.toThrow();
	});
});

describe('unlinkSessionFromCampaign', () => {
	it('clears campaignId from a linked session', () => {
		const session = createNewSession('Test Session');
		session.id = 'session-xyz';
		(session as any).campaignId = 'campaign-1';
		saveSessionById(session.id, session);

		unlinkSessionFromCampaign('session-xyz');

		const raw = localStorage.getItem('atom-magic-session-session-xyz');
		const saved = JSON.parse(raw!);
		expect(saved.campaignId).toBeUndefined();
	});
});

describe('getLinkedSessions', () => {
	it('returns empty array when no sessions are linked', () => {
		expect(getLinkedSessions('campaign-1')).toEqual([]);
	});

	it('returns only sessions linked to the given campaignId', () => {
		const s1 = createNewSession('Session One');
		s1.id = 'session-1';
		saveSessionById(s1.id, s1);
		linkSessionToCampaign('session-1', 'campaign-1');

		const s2 = createNewSession('Session Two');
		s2.id = 'session-2';
		saveSessionById(s2.id, s2);
		// s2 is NOT linked

		const linked = getLinkedSessions('campaign-1');
		expect(linked).toHaveLength(1);
		expect(linked[0].id).toBe('session-1');
	});
});
