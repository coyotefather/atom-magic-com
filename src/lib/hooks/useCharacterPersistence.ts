'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { loadCharacter, clearCharacter } from '@/lib/slices/characterSlice';
import {
	loadCharacterFromStorage,
	hasStoredCharacter,
	getRoster,
	getCharacterById,
	saveCharacterById,
	setActiveCharacter,
	createNewCharacterId,
	migrateToMultiCharacter,
} from '@/lib/characterPersistence';

export function useCharacterPersistence() {
	const dispatch = useAppDispatch();
	const character = useAppSelector(state => state.character);
	const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const [showResumePrompt, setShowResumePrompt] = useState(false);
	const [showRoster, setShowRoster] = useState(true);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialMount = useRef(true);

	// Check for saved characters on mount and migrate if needed
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Migrate from old single-character storage if needed
			const migratedId = migrateToMultiCharacter();

			const roster = getRoster();

			// If there's an active character, load it
			if (roster.activeCharacterId) {
				const savedCharacter = getCharacterById(roster.activeCharacterId);
				if (savedCharacter) {
					dispatch(loadCharacter(savedCharacter));
					setCurrentCharacterId(roster.activeCharacterId);
					setHasLoadedFromStorage(true);
					setShowRoster(false);
				}
			} else if (roster.characters.length > 0) {
				// Has characters but none active - show roster
				setShowRoster(true);
				setHasLoadedFromStorage(true);
			} else if (hasStoredCharacter()) {
				// Old-style single character (should have been migrated, but fallback)
				setShowResumePrompt(true);
			} else {
				// No characters at all - still show roster (for new character button)
				setShowRoster(true);
				setHasLoadedFromStorage(true);
			}
		}
	}, [dispatch]);

	// Load saved character (legacy single-character)
	const resumeCharacter = useCallback(() => {
		const savedCharacter = loadCharacterFromStorage();
		if (savedCharacter) {
			// Migrate to multi-character system
			const id = createNewCharacterId();
			saveCharacterById(id, savedCharacter);
			dispatch(loadCharacter(savedCharacter));
			setCurrentCharacterId(id);
			setActiveCharacter(id);
			setHasLoadedFromStorage(true);
			setShowRoster(false);
		}
		setShowResumePrompt(false);
	}, [dispatch]);

	// Start fresh (dismiss the prompt)
	const startFresh = useCallback(() => {
		setShowResumePrompt(false);
		setShowRoster(true);
		setHasLoadedFromStorage(true);
	}, []);

	// Select a character from roster
	const selectCharacter = useCallback((id: string) => {
		const savedCharacter = getCharacterById(id);
		if (savedCharacter) {
			dispatch(loadCharacter(savedCharacter));
			setCurrentCharacterId(id);
			setActiveCharacter(id);
			setHasLoadedFromStorage(true);
			setShowRoster(false);
		}
	}, [dispatch]);

	// Create new character
	const createNewCharacter = useCallback(() => {
		const id = createNewCharacterId();
		dispatch(clearCharacter());
		setCurrentCharacterId(id);
		setActiveCharacter(id);
		setHasLoadedFromStorage(true);
		setShowRoster(false);
	}, [dispatch]);

	// Switch back to roster view
	const showCharacterRoster = useCallback(() => {
		setShowRoster(true);
	}, []);

	// Auto-save on character changes (debounced)
	useEffect(() => {
		// Skip initial mount to avoid saving empty state
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Skip if no character ID set
		if (!currentCharacterId) {
			return;
		}

		// Skip if we haven't decided whether to load from storage yet
		if (!hasLoadedFromStorage && showResumePrompt) {
			return;
		}

		// Only save if character has meaningful data
		if (!character.name && character.scores.length === 0) {
			return;
		}

		// Debounce saves to avoid excessive writes
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			if (currentCharacterId) {
				saveCharacterById(currentCharacterId, character);
			}
		}, 1000);

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [character, currentCharacterId, hasLoadedFromStorage, showResumePrompt]);

	return {
		showResumePrompt,
		resumeCharacter,
		startFresh,
		hasLoadedFromStorage,
		showRoster,
		selectCharacter,
		createNewCharacter,
		showCharacterRoster,
		currentCharacterId,
	};
}
