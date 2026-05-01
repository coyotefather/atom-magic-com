/**
 * RolledGearDisplay.tsx
 *
 * A card-style display component that renders the result of a gear roll in a
 * human-readable format. This is what appears in the right panel of ManageGear after
 * the player clicks "Roll Gear" (inside the `SelectDetailExpanded` wrapper).
 *
 * It renders two sub-components defined in this file:
 *   - `WeaponDisplay`: shows the weapon name, category/type/tier chips (exotic badge
 *     if applicable), damage value, description, and any weapon enhancement in a
 *     gold-bordered inset box.
 *   - `ArmorDisplay`: shows the armor name, category/tier chips (exotic badge if
 *     applicable), capacity, penalties, description, and any armor enhancement.
 *
 * Both sub-components use the `IconLabel` common component for the header row
 * (sword icon for weapons, shield icon for armor).
 *
 * If neither weapon nor armor is present in the `RolledGear` object (e.g., the
 * filters were too restrictive), a fallback message is shown.
 *
 * The `RolledGear` type from `gear-data.ts` contains optional `weapon`, `armor`,
 * `weaponEnhancement`, and `armorEnhancement` fields — this component handles all
 * combinations (weapon only, armor only, both, with or without enhancements).
 *
 * Props:
 *   - rolledGear: RolledGear — the result object from `rollGear()` in gear-data.ts
 *
 * Used by:
 *   - ManageGear.tsx (rendered in the right panel after a successful gear roll)
 */
'use client';
import { Chip } from "@heroui/react";
import Icon from '@mdi/react';
import { mdiChevronLeftCircle, mdiSword, mdiShield, mdiStar } from '@mdi/js';
import IconLabel from '@/app/components/common/IconLabel';
import clsx from 'clsx';
import { RolledGear, Weapon, Armor, Enhancement } from '@/lib/gear-data';

interface RolledGearDisplayProps {
  rolledGear: RolledGear;
}

const WeaponDisplay = ({ weapon, enhancement }: { weapon: Weapon; enhancement?: Enhancement }) => {
  return (
    <div className="mb-6">
      <IconLabel icon={mdiSword} size="lg" iconColor="text-stone" gap="gap-2" className="mb-2">
        <span className="marcellus font-semibold">{weapon.name}</span>
      </IconLabel>
      <div className="flex gap-2 mb-2">
        <Chip size="sm" className="bg-stone capitalize text-white">{weapon.category}</Chip>
        <Chip size="sm" className="bg-stone capitalize text-white">{weapon.type}</Chip>
        <Chip size="sm" className="bg-brightgold text-black">Tier {weapon.tier}</Chip>
        {weapon.isExotic && (
          <Chip size="sm" className="bg-oxblood text-white">
            <Icon path={mdiStar} size={0.6} />
            Exotic
          </Chip>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold">Damage:</span> {weapon.damage}
        </div>
      </div>
      {weapon.description && (
        <div className="mt-2 text-sm text-gray-600 italic">
          {weapon.description}
        </div>
      )}
      {enhancement && (
        <div className="mt-3 p-2 bg-parchment border border-brightgold">
          <IconLabel icon={mdiStar} iconColor="text-gold" label="Enhancement" className="font-semibold text-gold">
            {enhancement.name}
          </IconLabel>
          <div className="text-sm">{enhancement.description}</div>
        </div>
      )}
    </div>
  );
};

const ArmorDisplay = ({ armor, enhancement }: { armor: Armor; enhancement?: Enhancement }) => {
  return (
    <div className="mb-6">
      <IconLabel icon={mdiShield} size="lg" iconColor="text-stone" gap="gap-2" className="mb-2">
        <span className="marcellus font-semibold">{armor.name}</span>
      </IconLabel>
      <div className="flex gap-2 mb-2">
        <Chip size="sm" className="bg-stone capitalize text-white">{armor.category}</Chip>
        <Chip size="sm" className="bg-brightgold text-black">Tier {armor.tier}</Chip>
        {armor.isExotic && (
          <Chip size="sm" className="bg-oxblood text-white">
            <Icon path={mdiStar} size={0.6} />
            Exotic
          </Chip>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold">Capacity:</span> {armor.capacity}
        </div>
        <div>
          <span className="font-semibold">Penalties:</span> {armor.penalties}
        </div>
      </div>
      {armor.description && (
        <div className="mt-2 text-sm text-gray-600 italic">
          {armor.description}
        </div>
      )}
      {enhancement && (
        <div className="mt-3 p-2 bg-parchment border border-brightgold">
          <IconLabel icon={mdiStar} iconColor="text-gold" label="Enhancement" className="font-semibold text-gold">
            {enhancement.name}
          </IconLabel>
          <div className="text-sm">{enhancement.description}</div>
        </div>
      )}
    </div>
  );
};

const RolledGearDisplay = ({ rolledGear }: RolledGearDisplayProps) => {
  const { weapon, armor, weaponEnhancement, armorEnhancement } = rolledGear;

  if (!weapon && !armor) {
    return (
      <div className="text-gray-500 italic">
        No gear matches your selected filters. Try adjusting your options.
      </div>
    );
  }

  return (
    <div>
      {weapon && (
        <WeaponDisplay weapon={weapon} enhancement={weaponEnhancement} />
      )}
      {armor && (
        <ArmorDisplay armor={armor} enhancement={armorEnhancement} />
      )}
    </div>
  );
};

export default RolledGearDisplay;
