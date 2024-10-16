'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setDisciplines, setTechniques } from "@/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import {
	DISCIPLINES_QUERYResult,
} from "../../../../../sanity.types";
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {Checkbox} from "@nextui-org/checkbox";

interface Technique {
	_id: string;
	title: string | null;
	latin: string | null;
	cooldown: number | null;
	description: string | null;
};

const ManageGear = ({
		incompleteFields,
		disciplines,
	}: {
		incompleteFields: string
		disciplines: DISCIPLINES_QUERYResult
	}) => {

	const detailsRef = useRef(null);
	const characterDisciplines = useAppSelector(state => state.character.disciplines);
	const characterTechniques = useAppSelector(state => state.character.techniques);
	const path = useAppSelector(state => state.character.path);
	const dispatch = useAppDispatch();
	const [disciplinesAndTechniques, setDisciplinesAndTechniques] = useState(<></>);
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose Disciplines and Techniques"
			description="Select dsciplines and techniques with the checkboxes to the left."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);

	const setCheckboxes = () => {
		let element = (
			<div>
				{disciplines.map(d => (
					<div
						key={d._id}
						className="mb-2">
						<Checkbox
							color="default"
							className="mb-1"
							isDisabled={characterDisciplines.length >= 2 && !characterDisciplines.includes(d._id)}
							onChange={(event) => handleDisciplineCheck(
								{
									value: d._id,
									eventState: event.target.checked,
						 		}
							)}>
							{d.title}
						</Checkbox>
						<div className={clsx(
							'ml-8 mb-1 flex flex-col gap-2 w-full',
							{'hidden': !characterDisciplines.includes(d._id)},
						)}>
							{characterDisciplines.includes(d._id) && d.techniques && d.techniques.map( (t) => (
								<Checkbox
									key={t._id}
									isDisabled={characterTechniques.length >= 4 && !characterTechniques.includes(t._id)}
									color="default"
									className="items-start w-full"

									onChange={(event) => handleTechniqueCheck(
									{
										value: t._id,
										eventState: event.target.checked,
									})}>
									<div>
										<div>{t.title}</div>
										<div className="text-sm w-full">
											<div>
												Cooldown: {t.cooldown} rounds.
											</div>
											<div>
												{t.description}
											</div>
										</div>
									</div>
								</Checkbox>
							))}
						</div>
					</div>
				))}
			</div>);
		setDisciplinesAndTechniques(element);
	};

	useEffect(() => {
		// set list of techniques on component render
		setCheckboxes();
	},[characterDisciplines, characterTechniques]);

	const handleDisciplineCheck = ({
			value,
			eventState
		}:{
			value:string,
			eventState: boolean
		}) => {

		let checkedDisciplines:string[] = [];
		checkedDisciplines.push(...characterDisciplines);
		let checkedTechniques:string[] = [];
		checkedTechniques.push(...characterTechniques);
		if(!eventState) {
			const index = checkedDisciplines.indexOf(value);
			if(index != -1) {
				checkedDisciplines.splice(index, 1);
			}
			// get techniques of discipline and remove from selectedTechniques
			let discFound = disciplines.find( (d) => d._id === value );
			discFound && discFound.techniques && discFound.techniques.forEach( t => {
				let tIndex = checkedTechniques.indexOf(t._id);
				if(tIndex != -1) {
					checkedTechniques.splice(tIndex, 1);
				}
			});
			dispatch(setTechniques(checkedTechniques));
		} else {
			checkedDisciplines.push(value);
		}
		dispatch(setDisciplines(checkedDisciplines));
		setCheckboxes();
	};

	const handleTechniqueCheck = ({
			value,
			eventState
		}:{
			value:string,
			eventState: boolean
		}) => {

		let checkedTechniques:string[] = [];
		checkedTechniques.push(...characterTechniques);
		if(!eventState) {
			const index = checkedTechniques.indexOf(value);
			if(index != -1) {
				checkedTechniques.splice(index, 1);
			}
		} else {
			checkedTechniques.push(value);
		}
		dispatch(setTechniques(checkedTechniques));
	};

	useEffect(() => {
		let content = (<></>);
		if(characterDisciplines) {
			let chosen:DISCIPLINES_QUERYResult = [];
			characterDisciplines.forEach( needle => {
				let discFound = disciplines.find( (d) => d._id === needle );
				let disc;
				if(discFound) {
					disc = Object.assign({}, discFound);
				} else {
					disc = undefined;
				}
				if(disc) {
					let discTechs = disc.techniques;
					disc.techniques = [];
					if(discTechs) {
						discTechs.forEach( t => {
							if(characterTechniques.includes(t._id) && disc.techniques != null) {
								disc.techniques.push(t);
							}
						})
					}
					chosen.push(disc);
				}
			});
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			content = (
				<div>
					{chosen.map( d => (
						<div
							key={d._id}
							className="mb-2">
							<h3 className="marcellus text-xl mb-1">{d.title}</h3>
							<div>
								{d.techniques && d.techniques.map( t => (
									<div
										key={t._id}
										className="text-sm mb-1">
										<div className="font-semibold">{t.title}</div>
										<div className="text-sm w-full">
											<div>
												Cooldown: {t.cooldown} rounds.
											</div>
											<div>
												{t.description}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			);
			setDetails(
				<SelectDetailExpanded
					imagePath=""
					name="Disciplines and Techniques"
					description={characterDisciplines.length === 0 ? "Select dsciplines and techniques with the checkboxes to the left." : ""}
					disabled={characterDisciplines.length === 0 ? true : false}>
					{content}
				</SelectDetailExpanded>);
		}
	},[characterDisciplines, characterTechniques]);


	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Choose Disciplines and Techniques</h2>
					<p className="pb-2">
						Every path has access to a different set of disciplines, and within those techniques. You may choose two disciplines when creating a character, and one technique from each of those disciplines.
					</p>
					<div className="m-auto mt-4">
						<div className={clsx(
							"inline-block flex gap-4",
							{"border-2 rounded-full border-danger": incompleteFields && incompleteFields !== "init"},
						)}>
							{disciplinesAndTechniques}
						</div>
						<div className={clsx(
							"text-tiny text-danger mt-2",
							{"hidden": !incompleteFields || incompleteFields === "init"},
							{"display-block": incompleteFields && incompleteFields !== "init"},
						)}>Please choose disciplines and techniques.</div>
					</div>
				</div>
			</div>
			<div className="pt-16 pb-16">
				<div className="max-w-[673px] pl-4">
					<SwitchTransition mode="out-in">
						<CSSTransition
							key={detailsUpdated ? "x" : "y"}
							nodeRef={detailsRef}
							timeout={300}
							classNames='fade-grow'
							>
							<div ref={detailsRef}>
								{details}
							</div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default ManageGear;