'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';

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

interface ValidationResult extends ValidationState {
	setClickCheck: (value: boolean) => void;
	clickCheck: boolean;
	isComplete: boolean;
}

/**
 * Custom hook to manage character form validation state
 * Extracts the repetitive validation logic from Sections.tsx
 */
export function useCharacterValidation(): ValidationResult {
	const character = useAppSelector(state => state.character);
	const [clickCheck, setClickCheck] = useState(false);

	const [basicsIncomplete, setBasicsIncomplete] = useState("init");
	const [cultureIncomplete, setCultureIncomplete] = useState("init");
	const [pathIncomplete, setPathIncomplete] = useState("init");
	const [patronageIncomplete, setPatronageIncomplete] = useState("init");
	const [disciplinesIncomplete, setDisciplinesIncomplete] = useState("init");
	const [gearIncomplete, setGearIncomplete] = useState("init");
	const [wealthIncomplete, setWealthIncomplete] = useState("init");
	const [animalCompanionIncomplete, setAnimalCompanionIncomplete] = useState("init");

	// Helper to compute validation state
	const computeValidation = (
		isEmpty: boolean,
		clickCheck: boolean,
		errorMessage: string
	): string => {
		if (isEmpty && clickCheck) return errorMessage;
		if (isEmpty && !clickCheck) return "init";
		return "";
	};

	useEffect(() => {
		setBasicsIncomplete(computeValidation(
			character.name === "",
			clickCheck,
			"Name"
		));
	}, [character.name, clickCheck]);

	useEffect(() => {
		setCultureIncomplete(computeValidation(
			character.culture === "",
			clickCheck,
			"Culture"
		));
	}, [character.culture, clickCheck]);

	useEffect(() => {
		setPathIncomplete(computeValidation(
			character.path === "",
			clickCheck,
			"Path"
		));
	}, [character.path, clickCheck]);

	useEffect(() => {
		setPatronageIncomplete(computeValidation(
			character.patronage === "",
			clickCheck,
			"Patronage"
		));
	}, [character.patronage, clickCheck]);

	useEffect(() => {
		setDisciplinesIncomplete(computeValidation(
			character.disciplines.length === 0,
			clickCheck,
			"Disciplines and Techniques"
		));
	}, [character.disciplines, clickCheck]);

	useEffect(() => {
		setGearIncomplete(computeValidation(
			character.gear.length === 0,
			clickCheck,
			"Gear"
		));
	}, [character.gear, clickCheck]);

	useEffect(() => {
		setWealthIncomplete(computeValidation(
			character.wealth.silver === 0,
			clickCheck,
			"Wealth"
		));
	}, [character.wealth, clickCheck]);

	useEffect(() => {
		setAnimalCompanionIncomplete(computeValidation(
			character.animalCompanion.id === "",
			clickCheck,
			"Animal Companion"
		));
	}, [character.animalCompanion, clickCheck]);

	// Check if all required fields are complete
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
