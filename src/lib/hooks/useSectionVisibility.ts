import { useState, useEffect, useCallback } from 'react';

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

interface UseSectionVisibilityReturn extends SectionVisibility, SectionVisibilitySetters {
  showAllSections: () => void;
  hideAllSections: () => void;
}

/**
 * Custom hook to manage character creation section visibility
 *
 * @param autoExpandOnLoad - If true, automatically expands all sections when character has progress
 * @param characterLoaded - Whether the character data has been loaded
 * @param characterHasProgress - Whether the character has any saved progress
 */
export function useSectionVisibility(
  autoExpandOnLoad: boolean = true,
  characterLoaded: boolean = false,
  characterHasProgress: boolean = false
): UseSectionVisibilityReturn {
  const [showChooseCulture, setShowChooseCulture] = useState(false);
  const [showChoosePath, setShowChoosePath] = useState(false);
  const [showChoosePatronage, setShowChoosePatronage] = useState(false);
  const [showChooseDisciplinesAndTechniques, setShowDisciplinesAndTechniques] = useState(false);
  const [showAdjustScoresAndScores, setShowAdjustScoresAndScores] = useState(false);
  const [showManageGear, setShowManageGear] = useState(false);
  const [showManageWealth, setShowManageWealth] = useState(false);
  const [showChooseAnimalCompanion, setShowChooseAnimalCompanion] = useState(false);
  const [showWrapUp, setShowWrapUp] = useState(false);

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

  // Expand sections when a character is loaded from storage
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
    // Setters
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
