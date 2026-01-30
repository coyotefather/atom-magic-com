'use client';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setDisciplines, setTechniques } from "@/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import {
	DISCIPLINES_QUERY_RESULT,
} from "../../../../../sanity.types";
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Checkbox } from "@heroui/react";

interface ChooseDisciplinesAndTechniquesProps {
	incompleteFields: string;
	disciplines: DISCIPLINES_QUERY_RESULT;
}

const ChooseDisciplinesAndTechniques = ({
	incompleteFields,
	disciplines,
}: ChooseDisciplinesAndTechniquesProps) => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();

	// Redux selectors
	const characterDisciplines = useAppSelector(state => state.character.disciplines);
	const characterTechniques = useAppSelector(state => state.character.techniques);
	const path = useAppSelector(state => state.character.path);

	// Track previous path for clearing selections on path change
	const prevPathRef = useRef(path);
	const isInitialMount = useRef(true);

	// Memoize filtered disciplines based on selected path
	const disciplinesForPath = useMemo(() => {
		if (!path) return [];
		return disciplines.filter(d =>
			d.paths?.some(p => p._id === path)
		);
	}, [disciplines, path]);

	// Memoize chosen disciplines with their selected techniques for display
	const chosenDisciplinesWithTechniques = useMemo(() => {
		return characterDisciplines.map(discId => {
			const disc = disciplines.find(d => d._id === discId);
			if (!disc) return null;

			const selectedTechniques = disc.techniques?.filter(t =>
				characterTechniques.includes(t._id)
			) || [];

			return {
				...disc,
				techniques: selectedTechniques
			};
		}).filter(Boolean) as DISCIPLINES_QUERY_RESULT;
	}, [characterDisciplines, characterTechniques, disciplines]);

	// Memoized handlers
	const handleDisciplineCheck = useCallback((disciplineId: string, isChecked: boolean) => {
		if (isChecked) {
			// Add discipline (max 2)
			if (characterDisciplines.length < 2) {
				dispatch(setDisciplines([...characterDisciplines, disciplineId]));
			}
		} else {
			// Remove discipline and its techniques
			const disc = disciplines.find(d => d._id === disciplineId);
			const techIdsToRemove = disc?.techniques?.map(t => t._id) || [];

			dispatch(setDisciplines(characterDisciplines.filter(id => id !== disciplineId)));
			dispatch(setTechniques(characterTechniques.filter(id => !techIdsToRemove.includes(id))));
		}
	}, [characterDisciplines, characterTechniques, disciplines, dispatch]);

	const handleTechniqueCheck = useCallback((techniqueId: string, isChecked: boolean) => {
		if (isChecked) {
			// Add technique (max 4)
			if (characterTechniques.length < 4) {
				dispatch(setTechniques([...characterTechniques, techniqueId]));
			}
		} else {
			dispatch(setTechniques(characterTechniques.filter(id => id !== techniqueId)));
		}
	}, [characterTechniques, dispatch]);

	// Clear disciplines when path changes (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			prevPathRef.current = path;
			return;
		}

		if (prevPathRef.current !== path) {
			dispatch(setTechniques([]));
			dispatch(setDisciplines([]));
			prevPathRef.current = path;
		}
	}, [path, dispatch]);

	// Generate a key for animation transitions
	const detailsKey = `${characterDisciplines.join('-')}-${characterTechniques.join('-')}`;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			{/* Left side - Selection checkboxes */}
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">
						Choose Disciplines and Techniques
					</h2>
					<p className="pb-2">
						Every path has access to a different set of disciplines, and within those techniques.
						You may choose two disciplines when creating a character, and one technique from each
						of those disciplines.
					</p>
					<div className="m-auto mt-4">
						<div className={clsx(
							"inline-block flex gap-4",
							{ "border-2 rounded-full border-danger": incompleteFields && incompleteFields !== "init" },
						)}>
							{!path ? (
								<div>
									Please first choose a path above before selecting disciplines and techniques.
								</div>
							) : (
								<div>
									{disciplinesForPath.map(d => (
										<div key={d._id} className="mb-2">
											<Checkbox
												color="default"
												className="mb-1"
												isSelected={characterDisciplines.includes(d._id)}
												isDisabled={characterDisciplines.length >= 2 && !characterDisciplines.includes(d._id)}
												onChange={(e) => handleDisciplineCheck(d._id, e.target.checked)}
											>
												{d.title}
											</Checkbox>
											<div className={clsx(
												'ml-8 mb-1 flex flex-col gap-2 w-full',
												{ 'hidden': !characterDisciplines.includes(d._id) },
											)}>
												{characterDisciplines.includes(d._id) && d.techniques?.map(t => (
													<Checkbox
														key={t._id}
														isSelected={characterTechniques.includes(t._id)}
														isDisabled={characterTechniques.length >= 4 && !characterTechniques.includes(t._id)}
														color="default"
														className="items-start w-full"
														onChange={(e) => handleTechniqueCheck(t._id, e.target.checked)}
													>
														<div>
															<div>{t.title}</div>
															{t.latin && (
																<div className="lapideum text-xxs text-stone uppercase mb-1">
																	{t.latin}
																</div>
															)}
															<div className="text-sm w-full">
																<div>{t.description}</div>
															</div>
														</div>
													</Checkbox>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
						<div className={clsx(
							"text-tiny text-danger mt-2",
							{ "hidden": !incompleteFields || incompleteFields === "init" },
							{ "display-block": incompleteFields && incompleteFields !== "init" },
						)}>
							Please choose disciplines and techniques.
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Selection details */}
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
							key={detailsKey}
							nodeRef={detailsRef}
							timeout={300}
							classNames='fade-grow'
						>
							<div ref={detailsRef}>
								<SelectDetailExpanded
									imagePath=""
									name="Disciplines and Techniques"
									description={characterDisciplines.length === 0
										? "Select disciplines and techniques with the checkboxes to the left."
										: ""}
									disabled={characterDisciplines.length === 0}
								>
									<div>
										{chosenDisciplinesWithTechniques.map(d => (
											<div key={d._id} className="mb-2">
												<h3 className="marcellus text-xl mb-1">{d.title}</h3>
												<div>
													{d.techniques?.map(t => (
														<div key={t._id} className="text-sm mb-1">
															<div className="font-semibold">{t.title}</div>
															{t.latin && (
																<div className="lapideum text-xxs text-stone uppercase mb-2">
																	{t.latin}
																</div>
															)}
															<div className="text-sm w-full">
																<div>{t.description}</div>
															</div>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</SelectDetailExpanded>
							</div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default ChooseDisciplinesAndTechniques;
