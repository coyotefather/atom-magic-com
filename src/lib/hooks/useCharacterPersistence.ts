/**
 * useCharacterPersistence.ts
 *
 * Custom hook that manages the full lifecycle of character save/load in
 * the Character Manager.
 *
 * The Character Manager supports multiple saved characters via a "roster" stored
 * in localStorage. This hook handles:
 *
 *   On mount:
 *     - Migrates any old single-character storage to the newer multi-character
 *       roster format (for users who had a character saved before multi-character
 *       support was added)
 *     - If an active character exists in the roster, loads it into Redux automatically
 *     - If there are characters but none is active, shows the roster for selection
 *     - If no characters exist, shows the roster with a "New Character" button
 *
 *   Auto-save:
 *     - Watches for changes to the Redux character state
 *     - Debounces saves (1 second) to avoid hammering localStorage on every keystroke
 *     - Skips the save if no character ID is set or if the character has no content
 *
 *   Roster interactions:
 *     - `selectCharacter(id)` loads a specific character from the roster
 *     - `createNewCharacter()` clears the editor and opens a blank character
 *     - `showCharacterRoster()` navigates back to the roster view
 *
 *   Legacy support:
 *     - `showResumePrompt` / `resumeCharacter` / `startFresh` handle the old
 *       single-character resume flow (shown only if migration didn't auto-handle it)
 *
 * Used by: src/app/components/character/Sections.tsx
 */

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

  /** The localStorage key for the character currently open in the editor. */
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);

  /** True once we've checked localStorage and resolved initial state (prevents flash of empty editor). */
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  /** True if we found a legacy single-character save that needs the user to confirm loading. */
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  /** True when the roster panel should be shown instead of the character editor. */
  const [showRoster, setShowRoster] = useState(true);

  /** Ref to the pending debounced save timeout, so it can be cancelled on re-renders. */
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /** Ref flag that prevents the auto-save from firing on the initial mount. */
  const isInitialMount = useRef(true);

  // ─── On mount: resolve initial state ────────────────────────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Run migration in case the user has an old single-character save.
      // migrateToMultiCharacter moves it into the roster format if needed.
      migrateToMultiCharacter();

      const roster = getRoster();

      if (roster.activeCharacterId) {
        // A character was previously active — load it directly into the editor
        const savedCharacter = getCharacterById(roster.activeCharacterId);
        if (savedCharacter) {
          dispatch(loadCharacter(savedCharacter));
          setCurrentCharacterId(roster.activeCharacterId);
          setHasLoadedFromStorage(true);
          setShowRoster(false);
        }
      } else if (roster.characters.length > 0) {
        // Characters exist but none is marked active — let the user pick one
        setShowRoster(true);
        setHasLoadedFromStorage(true);
      } else if (hasStoredCharacter()) {
        // Old-style single character survived migration — ask the user what to do
        setShowResumePrompt(true);
      } else {
        // No characters at all — show roster with "New Character" option
        setShowRoster(true);
        setHasLoadedFromStorage(true);
      }
    }
  }, [dispatch]);

  // ─── Legacy single-character resume ─────────────────────────────────────────

  /**
   * Loads the legacy single-character save and migrates it into the roster.
   * Called when the user confirms they want to resume their old character.
   */
  const resumeCharacter = useCallback(() => {
    const savedCharacter = loadCharacterFromStorage();
    if (savedCharacter) {
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

  /**
   * Dismisses the legacy resume prompt and shows the roster instead.
   * Called when the user wants to start fresh rather than resume an old character.
   */
  const startFresh = useCallback(() => {
    setShowResumePrompt(false);
    setShowRoster(true);
    setHasLoadedFromStorage(true);
  }, []);

  // ─── Roster interactions ─────────────────────────────────────────────────────

  /**
   * Loads a specific character from the roster into the editor.
   * Also sets it as the "active" character so it auto-loads next visit.
   */
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

  /**
   * Creates a brand new character and opens the blank editor for it.
   * Assigns a fresh ID but doesn't save until the auto-save fires.
   */
  const createNewCharacter = useCallback(() => {
    const id = createNewCharacterId();
    dispatch(clearCharacter());
    setCurrentCharacterId(id);
    setActiveCharacter(id);
    setHasLoadedFromStorage(true);
    setShowRoster(false);
  }, [dispatch]);

  /** Returns to the roster panel from the character editor. */
  const showCharacterRoster = useCallback(() => {
    setShowRoster(true);
  }, []);

  // ─── Auto-save ───────────────────────────────────────────────────────────────

  useEffect(() => {
    // Don't save on the very first render — we'd just be saving the empty initial state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // No ID means we haven't created or selected a character yet
    if (!currentCharacterId) return;

    // If we're still waiting for the resume prompt decision, don't save yet
    if (!hasLoadedFromStorage && showResumePrompt) return;

    // Don't save a completely blank character (name empty and no scores loaded)
    if (!character.name && character.scores.length === 0) return;

    // Cancel any pending save and schedule a fresh one 1 second from now.
    // This prevents saving on every individual keystroke.
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

  // ─── Return ──────────────────────────────────────────────────────────────────

  return {
    /** True if the legacy resume prompt should be shown (old single-character save found). */
    showResumePrompt,
    /** Load the legacy character and migrate it into the roster. */
    resumeCharacter,
    /** Dismiss the resume prompt and go to the roster instead. */
    startFresh,
    /** True once localStorage has been checked and initial state is resolved. */
    hasLoadedFromStorage,
    /** True when the roster panel should be shown (vs the character editor). */
    showRoster,
    /** Load a specific character from the roster by its ID. */
    selectCharacter,
    /** Clear the editor and open a blank new character. */
    createNewCharacter,
    /** Navigate back to the roster from the editor. */
    showCharacterRoster,
    /** The localStorage key for the currently open character. */
    currentCharacterId,
  };
}
