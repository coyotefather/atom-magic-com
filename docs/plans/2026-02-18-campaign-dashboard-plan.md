# Campaign Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/campaign` page where a GM can create a single campaign, link sessions from the Adventure Log into it, and track a party roster of saved characters.

**Architecture:** Option B — sessions get a `campaignId` field linking them bidirectionally to the campaign. The campaign itself is stored in `localStorage['atom-magic-campaign']`. `campaignPersistence.ts` handles all reads/writes; the UI is four focused components orchestrated by `CampaignDashboard`.

**Tech Stack:** Next.js App Router (page.tsx + 'use client' components), React hooks, localStorage, existing `sessionPersistence.ts` + `characterPersistence.ts`, MDI icons, Tailwind CSS 4, Vitest + jsdom for persistence layer tests.

---

## Task 1: Add `campaignId` to Session type

**Files:**
- Modify: `src/lib/adventure-log-data.ts`

**Step 1: Add `campaignId` to the `Session` interface**

In `src/lib/adventure-log-data.ts`, find the `Session` interface (line 44) and add one optional field:

```typescript
// A saved session
export interface Session {
	id: string;
	name: string;
	description?: string;
	entries: LogEntry[];
	createdAt: string;
	lastModified: string;
	campaignId?: string;   // links this session to a campaign (optional)
}
```

**Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no errors. The field is optional so all existing session data is compatible.

**Step 3: Commit**

```bash
git add src/lib/adventure-log-data.ts
git commit -m "feat: add optional campaignId field to Session type"
```

---

## Task 2: Campaign data types + persistence layer (TDD)

**Files:**
- Create: `src/lib/campaignPersistence.ts`
- Create: `src/lib/__tests__/campaignPersistence.test.ts`

### Step 1: Write the failing tests

Create `src/lib/__tests__/campaignPersistence.test.ts`:

```typescript
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
```

**Step 2: Run tests to verify they fail**

```bash
npm test -- src/lib/__tests__/campaignPersistence.test.ts
```

Expected: FAIL — module not found.

**Step 3: Create the implementation**

Create `src/lib/campaignPersistence.ts`:

```typescript
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
	const { campaignId: _removed, ...rest } = session as Session & { campaignId?: string };
	saveSessionById(sessionId, rest as Session);
};

export const getLinkedSessions = (campaignId: string): SessionSummary[] => {
	if (typeof window === 'undefined') return [];
	const roster = getSessionRoster();
	// Filter summaries by campaignId — need to read each full session to check
	return roster.sessions.filter((summary) => {
		const session = getSessionById(summary.id) as (Session & { campaignId?: string }) | null;
		return session?.campaignId === campaignId;
	});
};
```

**Step 4: Run tests to verify they pass**

```bash
npm test -- src/lib/__tests__/campaignPersistence.test.ts
```

Expected: all 9 tests pass.

**Step 5: Commit**

```bash
git add src/lib/campaignPersistence.ts src/lib/__tests__/campaignPersistence.test.ts
git commit -m "feat: add campaign persistence layer with tests"
```

---

## Task 3: CampaignHeader component

**Files:**
- Create: `src/app/components/campaign/CampaignHeader.tsx`

This component renders the editable campaign name, description, and delete button.

**Step 1: Create the component**

Create `src/app/components/campaign/CampaignHeader.tsx`:

```tsx
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/campaign/CampaignHeader.tsx
git commit -m "feat: add CampaignHeader component"
```

---

## Task 4: PartyRoster component

**Files:**
- Create: `src/app/components/campaign/PartyRoster.tsx`

Shows character cards for party members, with a dropdown to add characters from the character roster.

**Step 1: Create the component**

Create `src/app/components/campaign/PartyRoster.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiAccountGroup, mdiPlus, mdiClose } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { getRoster, CharacterSummary } from '@/lib/characterPersistence';

interface PartyRosterProps {
	partyCharacterIds: string[];
	onAdd: (characterId: string) => void;
	onRemove: (characterId: string) => void;
}

const PartyRoster = ({ partyCharacterIds, onAdd, onRemove }: PartyRosterProps) => {
	const [allCharacters, setAllCharacters] = useState<CharacterSummary[]>([]);

	useEffect(() => {
		const roster = getRoster();
		setAllCharacters(roster.characters);
	}, []);

	const partyMembers = allCharacters.filter(c => partyCharacterIds.includes(c.id));
	const availableToAdd = allCharacters.filter(c => !partyCharacterIds.includes(c.id));

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Icon path={mdiAccountGroup} size={1} className="text-laurel" />
				<h2 className="marcellus text-xl text-black">Party Roster</h2>
			</div>

			{partyMembers.length === 0 ? (
				<p className="text-sm text-stone py-2">
					No party members added yet.
				</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{partyMembers.map(character => (
						<div
							key={character.id}
							className="bg-white border-2 border-stone p-3 flex items-start justify-between gap-2"
						>
							<div className="flex-1 min-w-0">
								<p className="marcellus text-base text-black truncate">
									{character.name || 'Unnamed'}
								</p>
								{(character.culture || character.path) && (
									<p className="text-xs text-stone mt-0.5 truncate">
										{[character.culture, character.path].filter(Boolean).join(' · ')}
									</p>
								)}
								<div className="flex gap-3 mt-1.5 text-xs text-stone">
									<span>Phys {character.physicalShield}</span>
									<span>Psyc {character.psychicShield}</span>
									{character.armorCapacity > 0 && (
										<span>Armor {character.armorCapacity}</span>
									)}
								</div>
							</div>
							<FunctionButton
								variant="ghost"
								size="sm"
								onClick={() => onRemove(character.id)}
								icon={mdiClose}
								title="Remove from party"
								className="text-stone hover:text-oxblood flex-shrink-0"
							/>
						</div>
					))}
				</div>
			)}

			{availableToAdd.length > 0 && (
				<div className="flex items-center gap-3">
					<select
						id="add-character-select"
						className="flex-1 px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
						defaultValue=""
						onChange={e => {
							if (e.target.value) {
								onAdd(e.target.value);
								e.target.value = '';
							}
						}}
					>
						<option value="" disabled>Add a character to the party...</option>
						{availableToAdd.map(c => (
							<option key={c.id} value={c.id}>
								{c.name || 'Unnamed'}
								{c.culture ? ` (${c.culture})` : ''}
							</option>
						))}
					</select>
					<Icon path={mdiPlus} size={0.8} className="text-stone flex-shrink-0" />
				</div>
			)}

			{allCharacters.length === 0 && (
				<p className="text-xs text-stone/70">
					No saved characters found. Create characters in the{' '}
					<a href="/character" className="text-bronze hover:underline">
						Character Manager
					</a>
					.
				</p>
			)}
		</div>
	);
};

export default PartyRoster;
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/campaign/PartyRoster.tsx
git commit -m "feat: add PartyRoster component"
```

---

## Task 5: SessionLinker component

**Files:**
- Create: `src/app/components/campaign/SessionLinker.tsx`

Shows a dropdown of unlinked sessions, a link button, and linked sessions as cards with key events expanded inline.

**Step 1: Create the component**

Create `src/app/components/campaign/SessionLinker.tsx`:

```tsx
'use client';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiLink, mdiLinkOff, mdiStar, mdiChevronDown, mdiChevronUp, mdiScroll } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { SessionSummary, Session, formatFullTimestamp } from '@/lib/adventure-log-data';
import { getSessionById } from '@/lib/sessionPersistence';
import { getNoteCategoryLabel } from '@/lib/adventure-log-data';

interface SessionLinkerProps {
	linkedSessions: SessionSummary[];
	unlinkedSessions: SessionSummary[];
	onLink: (sessionId: string) => void;
	onUnlink: (sessionId: string) => void;
}

const SessionLinker = ({
	linkedSessions,
	unlinkedSessions,
	onLink,
	onUnlink,
}: SessionLinkerProps) => {
	const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

	const toggleExpand = (id: string) => {
		setExpandedSessionId(prev => prev === id ? null : id);
	};

	const getKeyEvents = (sessionId: string) => {
		const session = getSessionById(sessionId) as Session | null;
		if (!session) return [];
		return session.entries.filter(e => e.isKeyEvent);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<Icon path={mdiScroll} size={1} className="text-laurel" />
				<h2 className="marcellus text-xl text-black">Sessions</h2>
			</div>

			{/* Link a new session */}
			{unlinkedSessions.length > 0 && (
				<div className="flex items-center gap-3">
					<select
						className="flex-1 px-3 py-2 border-2 border-stone bg-white text-sm focus:border-bronze focus:outline-none"
						defaultValue=""
						onChange={e => {
							if (e.target.value) {
								onLink(e.target.value);
								e.target.value = '';
							}
						}}
					>
						<option value="" disabled>Link a session to this campaign...</option>
						{unlinkedSessions.map(s => (
							<option key={s.id} value={s.id}>
								{s.name || 'Unnamed Session'} — {formatFullTimestamp(s.lastModified)}
							</option>
						))}
					</select>
					<Icon path={mdiLink} size={0.8} className="text-stone flex-shrink-0" />
				</div>
			)}

			{unlinkedSessions.length === 0 && linkedSessions.length === 0 && (
				<p className="text-sm text-stone py-2">
					No sessions found. Create sessions in the{' '}
					<a href="/adventure-log" className="text-bronze hover:underline">
						Adventure Log
					</a>
					.
				</p>
			)}

			{/* Linked sessions */}
			{linkedSessions.length === 0 && unlinkedSessions.length > 0 && (
				<p className="text-sm text-stone py-2">
					No sessions linked yet. Select a session above to link it.
				</p>
			)}

			<div className="space-y-3">
				{linkedSessions.map(summary => {
					const isExpanded = expandedSessionId === summary.id;
					const keyEvents = isExpanded ? getKeyEvents(summary.id) : [];

					return (
						<div key={summary.id} className="bg-white border-2 border-stone">
							{/* Session card header */}
							<div className="p-4 flex items-start justify-between gap-3">
								<div className="flex-1 min-w-0">
									<h3 className="marcellus text-base text-black">
										{summary.name || 'Unnamed Session'}
									</h3>
									<div className="flex items-center gap-4 mt-1 text-xs text-stone">
										<span>
											{summary.entryCount} entr{summary.entryCount !== 1 ? 'ies' : 'y'}
										</span>
										{summary.keyEventCount > 0 && (
											<span className="flex items-center gap-1 text-gold">
												<Icon path={mdiStar} size={0.5} />
												{summary.keyEventCount} key
											</span>
										)}
										<span>{formatFullTimestamp(summary.lastModified)}</span>
									</div>
								</div>
								<div className="flex items-center gap-2 flex-shrink-0">
									{summary.keyEventCount > 0 && (
										<FunctionButton
											variant="ghost"
											size="sm"
											onClick={() => toggleExpand(summary.id)}
											icon={isExpanded ? mdiChevronUp : mdiChevronDown}
											title={isExpanded ? 'Collapse key events' : 'Show key events'}
										/>
									)}
									<FunctionButton
										variant="ghost"
										size="sm"
										onClick={() => onUnlink(summary.id)}
										icon={mdiLinkOff}
										title="Unlink from campaign"
										className="text-stone hover:text-oxblood"
									/>
								</div>
							</div>

							{/* Key events (expanded) */}
							{isExpanded && keyEvents.length > 0 && (
								<div className="border-t-2 border-stone/30 px-4 pb-4 pt-3 space-y-2">
									<p className="text-xs text-stone uppercase tracking-wider mb-2">Key Events</p>
									{keyEvents.map(entry => {
										let text = '';
										if (entry.type === 'action') {
											text = entry.characterName
												? `${entry.characterName}: ${entry.description}`
												: entry.description;
										} else if (entry.type === 'note') {
											const cat = entry.category ? `[${getNoteCategoryLabel(entry.category).toUpperCase()}] ` : '';
											text = `${cat}${entry.content}`;
										} else if (entry.type === 'roll' && entry.context) {
											text = `${entry.characterName || 'Unknown'} rolled ${entry.total} on ${entry.context}`;
										}

										return text ? (
											<div key={entry.id} className="flex items-start gap-2 text-sm">
												<Icon path={mdiStar} size={0.5} className="text-gold mt-0.5 flex-shrink-0" />
												<span className="text-stone">{text}</span>
											</div>
										) : null;
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default SessionLinker;
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/campaign/SessionLinker.tsx
git commit -m "feat: add SessionLinker component"
```

---

## Task 6: CampaignDashboard orchestrator

**Files:**
- Create: `src/app/components/campaign/CampaignDashboard.tsx`

The main client component. Loads campaign + sessions on mount, manages all state, delegates to child components.

**Step 1: Create the component**

Create `src/app/components/campaign/CampaignDashboard.tsx`:

```tsx
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/campaign/CampaignDashboard.tsx
git commit -m "feat: add CampaignDashboard orchestrator"
```

---

## Task 7: `/campaign` page route

**Files:**
- Create: `src/app/(website)/campaign/page.tsx`

Follows the same pattern as `/adventure-log/page.tsx`.

**Step 1: Create the page**

Create `src/app/(website)/campaign/page.tsx`:

```tsx
import { Metadata } from 'next';
import PageHero from '@/app/components/common/PageHero';
import { mdiMapMarkerMultiple } from '@mdi/js';
import dynamic from 'next/dynamic';

const CampaignDashboard = dynamic(
	() => import('@/app/components/campaign/CampaignDashboard'),
	{ ssr: false }
);

export const metadata: Metadata = {
	title: 'Campaign Dashboard | Atom Magic',
	description:
		'Link adventure log sessions into a campaign, track your party roster, and review key events across sessions.',
};

const Page = () => {
	return (
		<main className="min-h-screen bg-parchment">
			<PageHero
				title="Campaign Dashboard"
				description="Link sessions, track your party, and review key moments across your campaign."
				icon={mdiMapMarkerMultiple}
				accentColor="laurel"
			/>
			<section className="container px-6 md:px-8 py-12">
				<CampaignDashboard />
			</section>
		</main>
	);
};

export default Page;
```

Note: `dynamic` with `ssr: false` is used because `CampaignDashboard` reads `localStorage` on mount. This avoids SSR hydration mismatches. The `'use client'` directive in `CampaignDashboard` handles client-side rendering.

**Step 2: Run dev server and verify the page loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000/campaign`. Expected: page renders with the PageHero and the empty-state prompt.

**Step 3: Commit**

```bash
git add src/app/(website)/campaign/page.tsx
git commit -m "feat: add /campaign page route"
```

---

## Task 8: Campaign badge in Adventure Log SessionRoster

**Files:**
- Modify: `src/app/components/adventure-log/SessionRoster.tsx`

Sessions linked to a campaign show a small badge. The `SessionSummary` type doesn't carry `campaignId`, so we need to update it or pass the info separately. The simplest approach: update `SessionSummary` to include `campaignId?` — it's already read from the full session when saving.

**Step 1: Add `campaignId` to `SessionSummary` type**

In `src/lib/adventure-log-data.ts`, update `SessionSummary`:

```typescript
export interface SessionSummary {
	id: string;
	name: string;
	entryCount: number;
	keyEventCount: number;
	lastModified: string;
	campaignId?: string;   // present if session is linked to a campaign
}
```

**Step 2: Update `saveSessionById` to include `campaignId` in summary**

In `src/lib/sessionPersistence.ts`, find the `summary` object inside `saveSessionById` (around line 81) and add `campaignId`:

```typescript
const summary: SessionSummary = {
	id: session.id,
	name: session.name,
	entryCount: session.entries.length,
	keyEventCount: countKeyEvents(session.entries),
	lastModified: session.lastModified,
	campaignId: (session as Session & { campaignId?: string }).campaignId,
};
```

**Step 3: Add campaign badge to SessionRoster**

In `src/app/components/adventure-log/SessionRoster.tsx`, add the `mdiMapMarkerMultiple` import and a badge in the session card:

Add to imports at top:
```tsx
import { mdiPlus, mdiDelete, mdiStar, mdiMapMarkerMultiple } from '@mdi/js';
```

In the session card's info row (after the key events count span), add:
```tsx
{session.campaignId && (
    <span className="flex items-center gap-1 text-laurel">
        <Icon path={mdiMapMarkerMultiple} size={0.5} />
        Campaign
    </span>
)}
```

Place this inside the `<div className="flex items-center gap-3 mt-1 text-xs text-stone">` block, after the key event span.

**Step 4: Verify TypeScript and run tests**

```bash
npx tsc --noEmit
npm test
```

Expected: no errors, all tests pass.

**Step 5: Commit**

```bash
git add src/lib/adventure-log-data.ts src/lib/sessionPersistence.ts src/app/components/adventure-log/SessionRoster.tsx
git commit -m "feat: show campaign badge on linked sessions in Adventure Log"
```

---

## Task 9: Add Campaign Dashboard to the Tools page

**Files:**
- Modify: `src/app/(website)/tools/page.tsx`

**Step 1: Add the import and entry**

In `src/app/(website)/tools/page.tsx`, add `mdiMapMarkerMultiple` to the icon imports:

```tsx
import { mdiDice6, mdiBookOpenPageVariant, mdiDiceMultiple, mdiTreasureChest, mdiAccountCog, mdiArrowRight, mdiSwordCross, mdiBookOpenPageVariantOutline, mdiTools, mdiPaw, mdiMapMarkerMultiple } from '@mdi/js';
```

Then add the Campaign Dashboard entry to the `tools` array, after the Adventure Log entry:

```typescript
{
    name: 'Campaign Dashboard',
    description: 'Link adventure log sessions into a campaign, track your party roster, and review key events across sessions.',
    href: '/campaign',
    icon: mdiMapMarkerMultiple,
    color: 'laurel',
},
```

**Step 2: Verify the page**

```bash
npm run dev
```

Navigate to `http://localhost:3000/tools`. Expected: Campaign Dashboard card appears with laurel color scheme.

**Step 3: Commit**

```bash
git add src/app/(website)/tools/page.tsx
git commit -m "feat: add Campaign Dashboard to Tools page"
```

---

## Task 10: Full run verification

**Step 1: Run all tests**

```bash
npm test
```

Expected: all tests pass including the new `campaignPersistence` tests.

**Step 2: Build**

```bash
npm run build -- --webpack
```

Expected: successful build with no TypeScript errors.

**Step 3: Manual verification checklist**

With `npm run dev` running, verify:

- [ ] `/campaign` — empty state renders, "Create Campaign" button works
- [ ] Create campaign — name and description are editable and persist across refresh
- [ ] Add a character to party — character card appears, remove works
- [ ] Link a session — session appears in linked list, unlink works
- [ ] Key events toggle — sessions with key events show expand button; events render correctly
- [ ] Delete campaign — confirmation prompt appears, second click deletes, returns to empty state
- [ ] `/adventure-log` — sessions linked to the campaign show the "Campaign" badge
- [ ] `/tools` — Campaign Dashboard card appears and links to `/campaign`
- [ ] Refresh `/campaign` — campaign, party, and linked sessions persist correctly

**Step 4: Final commit (if any loose changes)**

```bash
git status
# commit any remaining changes
```
