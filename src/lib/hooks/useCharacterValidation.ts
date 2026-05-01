/**
 * useCharacterValidation.ts
 *
 * Custom hook that tracks which required character creation sections are
 * incomplete and whether the character as a whole is ready to be finalized.
 *
 * The Character Manager has a "Wrap Up" section at the end that the user
 * can only complete if all required fields are filled in. This hook provides
 * per-section completion state to drive:
 *   - Red "incomplete" indicators on each section header
 *   - The overall `isComplete` flag that enables the Wrap Up section
 *
 * How validation works:
 *   Each field has a state string that can be:
 *     "init"   — The field hasn't been touched yet; no error is shown
 *     ""       — The field is filled in; no error is shown
 *     "Name"   — The field is empty AND the user has clicked to check; show error
 *
 *   The `clickCheck` flag is set to true when the user tries to advance past
 *   an incomplete section or clicks Wrap Up without finishing. Once set, all
 *   empty fields immediately show their error messages.
 *
 * Used by: src/app/components/character/Sections.tsx
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';

/** Per-section completion messages. An empty string means complete; "init" means not yet checked. */
interface ValidationState {
  basicsIncomplete: string;
  cultureIncomplete: string;
  pathIncomplete: string;
  patronageIncomplete: string;
  disciplinesIncomplete: string;
  gearIncomplete: string;
  wealthIncomplete: string;
  animalCompanionIncomplete: string;
}

/** The full return type of the hook — validation state plus control functions. */
interface ValidationResult extends ValidationState {
  /** Triggers all validation error messages to show. Call when user tries to submit incomplete character. */
  setClickCheck: (value: boolean) => void;
  /** True once error messages should be visible (user has attempted to finalize an incomplete character). */
  clickCheck: boolean;
  /** True when all required fields have been filled in. */
  isComplete: boolean;
}

export function useCharacterValidation(): ValidationResult {
  const character = useAppSelector(state => state.character);

  /**
   * Once set to true, all empty required fields show their error labels.
   * Set by the parent component when the user tries to finalize.
   */
  const [clickCheck, setClickCheck] = useState(false);

  // Each section has its own state so its section header can independently
  // show an error indicator without affecting other sections.
  const [basicsIncomplete, setBasicsIncomplete] = useState("init");
  const [cultureIncomplete, setCultureIncomplete] = useState("init");
  const [pathIncomplete, setPathIncomplete] = useState("init");
  const [patronageIncomplete, setPatronageIncomplete] = useState("init");
  const [disciplinesIncomplete, setDisciplinesIncomplete] = useState("init");
  const [gearIncomplete, setGearIncomplete] = useState("init");
  const [wealthIncomplete, setWealthIncomplete] = useState("init");
  const [animalCompanionIncomplete, setAnimalCompanionIncomplete] = useState("init");

  /**
   * Returns the validation state string for a single field.
   *
   * @param isEmpty - True if the field has no value
   * @param clickCheck - True if the user has tried to submit
   * @param errorMessage - The label to show when the field is invalid (e.g. "Culture")
   * @returns "init" (not yet touched), "" (valid), or the error message (invalid + submitted)
   */
  const computeValidation = (
    isEmpty: boolean,
    clickCheck: boolean,
    errorMessage: string
  ): string => {
    if (isEmpty && clickCheck) return errorMessage;
    if (isEmpty && !clickCheck) return "init";
    return "";
  };

  // Each useEffect watches the relevant field and the clickCheck flag.
  // When either changes, the field's completion state is recalculated.

  useEffect(() => {
    setBasicsIncomplete(computeValidation(character.name === "", clickCheck, "Name"));
  }, [character.name, clickCheck]);

  useEffect(() => {
    setCultureIncomplete(computeValidation(character.culture === "", clickCheck, "Culture"));
  }, [character.culture, clickCheck]);

  useEffect(() => {
    setPathIncomplete(computeValidation(character.path === "", clickCheck, "Path"));
  }, [character.path, clickCheck]);

  useEffect(() => {
    setPatronageIncomplete(computeValidation(character.patronage === "", clickCheck, "Patronage"));
  }, [character.patronage, clickCheck]);

  useEffect(() => {
    setDisciplinesIncomplete(computeValidation(character.disciplines.length === 0, clickCheck, "Disciplines and Techniques"));
  }, [character.disciplines, clickCheck]);

  useEffect(() => {
    setGearIncomplete(computeValidation(character.gear.length === 0, clickCheck, "Gear"));
  }, [character.gear, clickCheck]);

  // Wealth is considered set if the character has at least some silver coins
  useEffect(() => {
    setWealthIncomplete(computeValidation(character.wealth.silver === 0, clickCheck, "Wealth"));
  }, [character.wealth, clickCheck]);

  // Animal companion is optional in the game but tracked here for the progress indicator
  useEffect(() => {
    setAnimalCompanionIncomplete(computeValidation(character.animalCompanion.id === "", clickCheck, "Animal Companion"));
  }, [character.animalCompanion, clickCheck]);

  /**
   * True when all required fields are filled in.
   * Animal companion is NOT in this list — it is optional.
   * This flag enables the Wrap Up section and the final save button.
   */
  const isComplete = useMemo(() => {
    return (
      character.name !== "" &&
      character.culture !== "" &&
      character.path !== "" &&
      character.patronage !== "" &&
      character.disciplines.length > 0 &&
      character.gear.length > 0 &&
      character.wealth.silver > 0
    );
  }, [character]);

  return {
    basicsIncomplete,
    cultureIncomplete,
    pathIncomplete,
    patronageIncomplete,
    disciplinesIncomplete,
    gearIncomplete,
    wealthIncomplete,
    animalCompanionIncomplete,
    clickCheck,
    setClickCheck,
    isComplete,
  };
}
