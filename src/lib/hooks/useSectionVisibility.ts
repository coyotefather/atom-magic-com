/**
 * useSectionVisibility.ts
 *
 * Custom hook that manages which sections are expanded or collapsed in
 * the Character Manager's creation wizard.
 *
 * The character creation form is divided into 9 collapsible sections
 * (Culture, Path, Patronage, Scores, Disciplines, Gear, Wealth, Animal Companion,
 * Wrap Up). Each section can be independently shown or hidden. By default all
 * sections start hidden; the user reveals them one at a time as they progress.
 *
 * Special behavior:
 *   When `autoExpandOnLoad` is true and a character with existing progress is
 *   loaded from localStorage, all sections expand at once so the user can see
 *   and edit their full character without clicking through every step.
 *
 * @param autoExpandOnLoad - If true, all sections expand when a progress character loads
 * @param characterLoaded - Whether character data has been loaded from storage into Redux
 * @param characterHasProgress - Whether the loaded character has any saved content
 *
 * Used by: src/app/components/character/Sections.tsx
 */

import { useState, useEffect, useCallback } from 'react';

/** Boolean visibility flags for each of the 9 character creation sections. */
interface SectionVisibility {
  showChooseCulture: boolean;
  showChoosePath: boolean;
  showChoosePatronage: boolean;
  showChooseDisciplinesAndTechniques: boolean;
  showAdjustScoresAndScores: boolean;
  showManageGear: boolean;
  showManageWealth: boolean;
  showChooseAnimalCompanion: boolean;
  showWrapUp: boolean;
}

/** Individual setter functions for each section (used by section toggle buttons). */
interface SectionVisibilitySetters {
  setShowChooseCulture: (show: boolean) => void;
  setShowChoosePath: (show: boolean) => void;
  setShowChoosePatronage: (show: boolean) => void;
  setShowDisciplinesAndTechniques: (show: boolean) => void;
  setShowAdjustScoresAndScores: (show: boolean) => void;
  setShowManageGear: (show: boolean) => void;
  setShowManageWealth: (show: boolean) => void;
  setShowChooseAnimalCompanion: (show: boolean) => void;
  setShowWrapUp: (show: boolean) => void;
}

/** The full return type — visibility state, setters, and bulk actions. */
interface UseSectionVisibilityReturn extends SectionVisibility, SectionVisibilitySetters {
  /** Expands all 9 sections at once. Used when loading a saved character. */
  showAllSections: () => void;
  /** Collapses all 9 sections at once. */
  hideAllSections: () => void;
}

export function useSectionVisibility(
  autoExpandOnLoad: boolean = true,
  characterLoaded: boolean = false,
  characterHasProgress: boolean = false
): UseSectionVisibilityReturn {
  // All sections start collapsed — the user reveals them as they work through creation
  const [showChooseCulture, setShowChooseCulture] = useState(false);
  const [showChoosePath, setShowChoosePath] = useState(false);
  const [showChoosePatronage, setShowChoosePatronage] = useState(false);
  const [showChooseDisciplinesAndTechniques, setShowDisciplinesAndTechniques] = useState(false);
  const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
  const [showManageGear, setShowManageGear] = useState(false);
  const [showManageWealth, setShowManageWealth] = useState(false);
  const [showChooseAnimalCompanion, setShowChooseAnimalCompanion] = useState(false);
  const [showWrapUp, setShowWrapUp] = useState(false);

  /** Opens all 9 sections simultaneously. Wrapped in useCallback for stable reference. */
  const showAllSections = useCallback(() => {
    setShowChooseCulture(true);
    setShowChoosePath(true);
    setShowChoosePatronage(true);
    setShowAdjustScoresAndScores(true);
    setShowDisciplinesAndTechniques(true);
    setShowManageGear(true);
    setShowManageWealth(true);
    setShowChooseAnimalCompanion(true);
    setShowWrapUp(true);
  }, []);

  /** Collapses all 9 sections simultaneously. */
  const hideAllSections = useCallback(() => {
    setShowChooseCulture(false);
    setShowChoosePath(false);
    setShowChoosePatronage(false);
    setShowAdjustScoresAndScores(false);
    setShowDisciplinesAndTechniques(false);
    setShowManageGear(false);
    setShowManageWealth(false);
    setShowChooseAnimalCompanion(false);
    setShowWrapUp(false);
  }, []);

  // When a character with progress is loaded from storage, open all sections so
  // the user immediately sees their full character rather than a collapsed form
  useEffect(() => {
    if (autoExpandOnLoad && characterLoaded && characterHasProgress) {
      showAllSections();
    }
  }, [autoExpandOnLoad, characterLoaded, characterHasProgress, showAllSections]);

  return {
    // Visibility state
    showChooseCulture,
    showChoosePath,
    showChoosePatronage,
    showChooseDisciplinesAndTechniques,
    showAdjustScoresAndScores,
    showManageGear,
    showManageWealth,
    showChooseAnimalCompanion,
    showWrapUp,
    // Individual setters
    setShowChooseCulture,
    setShowChoosePath,
    setShowChoosePatronage,
    setShowDisciplinesAndTechniques,
    setShowAdjustScoresAndScores,
    setShowManageGear,
    setShowManageWealth,
    setShowChooseAnimalCompanion,
    setShowWrapUp,
    // Bulk actions
    showAllSections,
    hideAllSections,
  };
}
