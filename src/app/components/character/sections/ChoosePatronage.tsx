/**
 * ChoosePatronage.tsx
 *
 * The fourth wizard section where the player optionally selects a Cardinal patron for
 * their character. Cardinals are powerful cosmic entities in the Atom Magic setting
 * (e.g., Anathema, Aura, Arcadia). Pledging patronage does not modify base scores
 * directly but grants the character access to special effects that apply during play.
 *
 * Although marked as "required" in the HeroUI Select (so validation will flag it if
 * skipped), the section is effectively optional in lore — the validation message
 * prompts completion to keep the roster data consistent.
 *
 * Layout is the standard split two-column panel:
 *   Left: Explanatory text, a HeroUI Select dropdown listing all patronages from
 *         Payload CMS. Shows a validation error ("Please select a patronage.") if
 *         the user tries to advance without making a selection.
 *   Right: An animated `SelectDetailExpanded` panel showing the selected patron's
 *          full title and epithet (e.g., "Anathema, The Destroyer"), description,
 *          and a HeroUI Table of their patronage effects. Each effect row shows the
 *          effect name (linked to its Codex entry if available) and a `<RichText>`
 *          description.
 *
 * When a patronage is selected:
 *   1. `setPatronage(id)` is dispatched to Redux.
 *   2. `updateDetailsForPatronage()` re-renders the right panel.
 *
 * The details panel re-renders reactively when `character.patronage` changes from
 * an external source (e.g., loading a saved character from the roster).
 *
 * Props:
 *   - patronages: NormedPatronage[] — all patronage options from Payload CMS
 *   - incompleteFields: validation error string
 *
 * Used by:
 *   - Sections.tsx (fourth wizard section, unlocked after ChoosePath)
 */
'use client';
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import ExternalLink from '@/app/components/common/ExternalLink';
import { CARDINALS } from '@/lib/global-data';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setPatronage } from "@/lib/slices/characterSlice";
import { Select, Label, ListBox, FieldError, Table } from "@heroui/react";
import { useState, useRef, useEffect, useCallback } from 'react';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import type { NormedPatronage } from '@/lib/character-types';
import { RichText } from '@/app/components/common/RichText';

const ChoosePatronage = ({
		incompleteFields,
		patronages,
	}: {
		incompleteFields: string,
		patronages: NormedPatronage[]
	}) => {
	const detailsRef = useRef(null);
	const dispatch = useAppDispatch();
	const currentPatronage = useAppSelector(state => state.character.patronage);
	const [detailsUpdated, setDetailsUpdated] = useState(false);
	const [details, setDetails] = useState(
		<SelectDetailExpanded
			imagePath=""
			name="Choose a Patron"
			description="Select a patron from the dropdown."
			disabled={true}>
			<div></div>
		</SelectDetailExpanded>
	);

	// Update details panel for a given patronage ID
	const updateDetailsForPatronage = useCallback((patronageId: string) => {
		if (!patronageId) return;

		const cardinal = patronages.find((c) => c._id === patronageId);
		if (cardinal != undefined && cardinal.effects) {
			const patronageEffects = (
				<Table>
					<Table.ScrollContainer>
						<Table.Content aria-label={`${cardinal.title} Patronage Effects`} className="mt-8">
							<Table.Header>
								{["Name","Description"].map((tc) => (
									<Table.Column key={tc} id={tc} className="bg-transparent border-b-2 pl-0">
										{tc}
									</Table.Column>
								))}
							</Table.Header>
							<Table.Body>
								{(cardinal.effects).map((effect, index) => (
									<Table.Row key={`effect-${index}`} id={`effect-${index}`}>
										<Table.Cell className="align-top w-1/3 pl-0">
											{effect.entry && typeof effect.entry !== 'number' && effect.entry.slug ? <ExternalLink
											href={`https://atom-magic.com/codex/entries/${effect.entry.slug}`} name={effect.title ? effect.title :""} />:effect.title}
										</Table.Cell>
										<Table.Cell className="pl-0 prose prose-sm">
											<RichText content={effect?.description} />
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Content>
					</Table.ScrollContainer>
				</Table>
			);
			setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);
			setDetails(
				<SelectDetailExpanded
					imagePath={""}
					name={`${cardinal.title}, ${cardinal.epithet}`}
					description={cardinal.description ? cardinal.description : ""}
					disabled={false}>
					{patronageEffects}
				</SelectDetailExpanded>
			);
		}
	}, [patronages]);

	// Update details when currentPatronage changes (e.g., when loading a character)
	useEffect(() => {
		if (currentPatronage) {
			updateDetailsForPatronage(currentPatronage);
		}
	}, [currentPatronage, updateDetailsForPatronage]);

	const handleSelectChange = (val: React.Key | null) => {
		if (val) {
			dispatch(setPatronage(String(val)));
			updateDetailsForPatronage(String(val));
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2 bg-white">
			<div className="flex justify-center md:justify-end py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pr-4">
					<h2 className="marcellus text-3xl w-full border-b-2 border-solid mb-4">Choose a Patronage</h2>
					<p className="pb-2 w-full">
						Optionally choose a patronage from a Cardinal. This doesn&apos;t directly affect your base or calculated scores but can affect actions you take.
					</p>
					<p className="pb-2 w-full">
						For more information, see <ExternalLink href="https://atom-magic.com/codex/Cardinal_Forces" name="Cardinal Forces" />.
					</p>
					<div className="m-auto w-full">
						<Select
							isRequired
							isInvalid={!!(incompleteFields && incompleteFields !== "init")}
							value={currentPatronage ?? ""}
							onChange={handleSelectChange}
							placeholder="Select a Patron"
							className="w-96 mt-8"
						>
							<Label>Patronage</Label>
							<Select.Trigger>
								<Select.Value />
								<Select.Indicator />
							</Select.Trigger>
							{!!(incompleteFields && incompleteFields !== "init") && (
								<FieldError>Please select a patronage.</FieldError>
							)}
							<Select.Popover>
								<ListBox>
									{patronages.map((patron) => (
										<ListBox.Item key={patron._id} id={patron._id} textValue={patron.title ?? ""}>
											{patron.title}
											<ListBox.ItemIndicator />
										</ListBox.Item>
									))}
								</ListBox>
							</Select.Popover>
						</Select>
					</div>
				</div>
			</div>
			<div className="py-8 md:py-16 px-4 md:px-0">
				<div className="max-w-[673px] md:pl-4">
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

export default ChoosePatronage;