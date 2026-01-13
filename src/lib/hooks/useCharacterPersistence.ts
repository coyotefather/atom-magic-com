'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { loadCharacter, saveCharacter } from '@/lib/slices/characterSlice';
import { loadCharacterFromStorage, hasStoredCharacter } from '@/lib/characterPersistence';

export function useCharacterPersistence() {
	const dispatch = useAppDispatch();
	const character = useAppSelector(state => state.character);
	const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
	const [showResumePrompt, setShowResumePrompt] = useState(false);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialMount = useRef(true);

	// Check for saved character on mount
	useEffect(() => {
		if (typeof window !== 'undefined' && hasStoredCharacter()) {
			const savedCharacter = loadCharacterFromStorage();
			if (savedCharacter && savedCharacter.name) {
				setShowResumePrompt(true);
			}
		}
	}, []);

	// Load saved character
	const resumeCharacter = useCallback(() => {
		const savedCharacter = loadCharacterFromStorage();
		if (savedCharacter) {
			dispatch(loadCharacter(savedCharacter));
			setHasLoadedFromStorage(true);
		}
		setShowResumePrompt(false);
	}, [dispatch]);

	// Start fresh (dismiss the prompt)
	const startFresh = useCallback(() => {
		setShowResumePrompt(false);
		setHasLoadedFromStorage(true);
	}, []);

	// Auto-save on character changes (debounced)
	useEffect(() => {
		// Skip initial mount to avoid saving empty state
		if (isInitialMount.current) {
			isInitialMount.current = false;
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
			dispatch(saveCharacter());
		}, 1000);

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [character, dispatch, hasLoadedFromStorage, showResumePrompt]);

	return {
		showResumePrompt,
		resumeCharacter,
		startFresh,
		hasLoadedFromStorage,
	};
}
