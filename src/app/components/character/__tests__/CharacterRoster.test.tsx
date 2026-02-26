import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CharacterRoster from '@/app/components/character/CharacterRoster';
import { renderWithProviders } from '@/test/utils';
import type { CharacterSummary } from '@/lib/characterPersistence';

const ROSTER_KEY = 'atom-magic-roster';
const CHAR_KEY = 'atom-magic-character-test-1';

const mockSummary: CharacterSummary = {
	id: 'test-1',
	name: 'Varro',
	culture: 'Spiranos',
	path: 'Theurgist',
	patronage: 'None',
	physicalShield: 5,
	psychicShield: 5,
	armorCapacity: 0,
	disciplineCount: 2,
	techniqueCount: 3,
	isComplete: true,
	lastModified: new Date().toISOString(),
};

const minimalCharacter = {
	name: 'Varro', age: '', pronouns: '', description: '',
	culture: '', path: '', patronage: '',
	scores: [], additionalScores: [], disciplines: [], techniques: [],
	gear: [], wealth: { silver: 0, gold: 0, lead: 0, uranium: 0 },
	animalCompanion: { id: '', name: '', details: '' },
};

beforeEach(() => {
	localStorage.clear();
});

describe('CharacterRoster', () => {
	it('renders characters from localStorage', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));

		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={vi.fn()} />
		);

		// getRoster() is synchronous so the loading flash is imperceptible in jsdom;
		// just assert the character is present after render.
		await waitFor(() => expect(screen.getByText('Varro')).toBeInTheDocument());
	});

	it('calls onCharacterSelected with the character id when Edit is clicked', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));
		localStorage.setItem(CHAR_KEY, JSON.stringify(minimalCharacter));

		const onSelected = vi.fn();
		renderWithProviders(
			<CharacterRoster onCharacterSelected={onSelected} onNewCharacter={vi.fn()} />
		);

		await waitFor(() => screen.getByText('Varro'));
		await userEvent.click(screen.getByRole('button', { name: /edit/i }));
		expect(onSelected).toHaveBeenCalledWith('test-1');
	});

	it('removes a character after delete → confirm', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [mockSummary],
		}));

		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={vi.fn()} />
		);

		await waitFor(() => screen.getByText('Varro'));
		await userEvent.click(screen.getByTitle('Delete character'));
		await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
		await waitFor(() => expect(screen.queryByText('Varro')).not.toBeInTheDocument());
	});

	it('calls onNewCharacter when New Character button is clicked', async () => {
		localStorage.setItem(ROSTER_KEY, JSON.stringify({
			activeCharacterId: null,
			characters: [],
		}));

		const onNew = vi.fn();
		renderWithProviders(
			<CharacterRoster onCharacterSelected={vi.fn()} onNewCharacter={onNew} />
		);

		await waitFor(() => screen.getByText('New Character'));
		await userEvent.click(screen.getByRole('button', { name: /new character/i }));
		expect(onNew).toHaveBeenCalled();
	});
});
