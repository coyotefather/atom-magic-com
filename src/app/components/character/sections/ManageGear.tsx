'use client';
import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { setGear } from "@/lib/slices/characterSlice";
import SelectDetailExpanded from '@/app/components/common/SelectDetailExpanded';
import GearRollingOptions from '@/app/components/character/sections/gear/GearRollingOptions';
import RolledGearDisplay from '@/app/components/character/sections/gear/RolledGearDisplay';
import FunctionButton from '@/app/components/common/FunctionButton';
import {
	GearRollingOptions as GearRollingOptionsType,
	DEFAULT_ROLLING_OPTIONS,
	RolledGear,
	CharacterGearItem,
	rollGear,
} from '@/lib/gear-data';
import clsx from 'clsx';
import { mdiDiceMultiple } from '@mdi/js';
import { CSSTransition, SwitchTransition } from "react-transition-group";

const ManageGear = ({
		incompleteFields,
	}: {
		incompleteFields: string
	}) => {

	const detailsRef = useRef(null);
	const characterGear = useAppSelector(state => state.character.gear);
	const path = useAppSelector(state => state.character.path);
	const dispatch = useAppDispatch();

	const [rollingOptions, setRollingOptions] = useState<GearRollingOptionsType>(DEFAULT_ROLLING_OPTIONS);
	const [rolledGear, setRolledGear] = useState<RolledGear | null>(null);
	const [detailsUpdated, setDetailsUpdated] = useState(false);

	const hasValidOptions = () => {
		return (
			rollingOptions.weaponCategories.length > 0 &&
			rollingOptions.weaponTypes.length > 0 &&
			rollingOptions.armorCategories.length > 0 &&
			rollingOptions.tiers.length > 0
		);
	};

	const handleRoll = () => {
		if (!hasValidOptions()) {
			return;
		}

		const result = rollGear(rollingOptions);
		setRolledGear(result);
		setDetailsUpdated(curDetailsUpdated => !curDetailsUpdated);

		// Store simplified gear data in redux for character sheet
		const gearForState: CharacterGearItem[] = [];
		if (result.weapon) {
			gearForState.push({
				id: `weapon-${result.weapon.name}-${Date.now()}`,
				name: result.weapon.name,
				type: 'weapon',
				category: result.weapon.category,
				tier: result.weapon.tier,
				damage: result.weapon.damage,
				description: result.weapon.description,
				isExotic: result.weapon.isExotic,
				enhancement: result.weaponEnhancement ? {
					name: result.weaponEnhancement.name,
					description: result.weaponEnhancement.description,
				} : undefined,
			});
		}
		if (result.armor) {
			gearForState.push({
				id: `armor-${result.armor.name}-${Date.now()}`,
				name: result.armor.name,
				type: 'armor',
				category: result.armor.category,
				tier: result.armor.tier,
				capacity: result.armor.capacity,
				penalties: result.armor.penalties,
				description: result.armor.description,
				isExotic: result.armor.isExotic,
				enhancement: result.armorEnhancement ? {
					name: result.armorEnhancement.name,
					description: result.armorEnhancement.description,
				} : undefined,
			});
		}
		dispatch(setGear(gearForState));
	};

	const handleReroll = () => {
		handleRoll();
	};

	const handleOptionsChange = (newOptions: GearRollingOptionsType) => {
		setRollingOptions(newOptions);
	};

	return (
		<div className="grid grid-cols-2 divide-x-2 bg-white">
			<div className="flex justify-end pt-16 pb-16">
				<div className="max-w-[673px] pr-4">
					<h2 className="marcellus text-3xl border-b-2 border-solid mb-4">Roll Gear</h2>
					<p className="pb-2">
						Every character starts with a basic gear kit and rolls additional unique items. Customize your options below to filter the available weapons and armor.
					</p>

					<div className="mt-6 mb-6">
						<GearRollingOptions
							options={rollingOptions}
							onChange={handleOptionsChange}
							disabled={false}
						/>
					</div>

					<div className="m-auto mt-4">
						<div className={clsx(
							"inline-flex gap-2",
							{"border-2 rounded-full border-danger": incompleteFields && incompleteFields !== "init" && !rolledGear},
						)}>
							<FunctionButton
								isDisabled={!hasValidOptions()}
								buttonFunction={handleRoll}
								buttonIcon={mdiDiceMultiple}
								iconOnly={false}
								variant="secondary">
								{rolledGear ? 'Roll Again' : 'Roll Gear'}
							</FunctionButton>
						</div>
						{!hasValidOptions() && (
							<div className="text-tiny text-danger mt-2">
								Please select at least one option from each category.
							</div>
						)}
						<div className={clsx(
							"text-tiny text-danger mt-2",
							{"hidden": !incompleteFields || incompleteFields === "init" || rolledGear},
							{"display-block": incompleteFields && incompleteFields !== "init" && !rolledGear},
						)}>Please roll gear for your character.</div>
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
								{rolledGear ? (
									<SelectDetailExpanded
										imagePath=""
										name="Gear"
										description=""
										disabled={false}>
										<RolledGearDisplay rolledGear={rolledGear} />
									</SelectDetailExpanded>
								) : (
									<SelectDetailExpanded
										imagePath=""
										name="Roll Gear"
										description="Configure your options and click Roll Gear to get your starting equipment."
										disabled={true}>
										<div></div>
									</SelectDetailExpanded>
								)}
							</div>
						</CSSTransition>
					</SwitchTransition>
				</div>
			</div>
		</div>
	);
};

export default ManageGear;
