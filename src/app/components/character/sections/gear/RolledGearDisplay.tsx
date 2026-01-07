'use client';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { Accordion, AccordionItem } from "@heroui/react";
import { Chip } from "@heroui/react";
import Icon from '@mdi/react';
import { mdiChevronLeftCircle, mdiSword, mdiShield, mdiStar } from '@mdi/js';
import clsx from 'clsx';
import { RolledGear, Weapon, Armor, Enhancement } from '@/lib/gear-data';

interface RolledGearDisplayProps {
  rolledGear: RolledGear;
}

const WeaponDisplay = ({ weapon, enhancement }: { weapon: Weapon; enhancement?: Enhancement }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon path={mdiSword} size={1} className="text-stone" />
        <h4 className="marcellus text-lg font-semibold">{weapon.name}</h4>
      </div>
      <div className="flex gap-2 mb-2">
        <Chip
          size="sm"
          classNames={{
            base: "bg-stone",
            content: "capitalize text-white",
          }}
        >
          {weapon.category}
        </Chip>
        <Chip
          size="sm"
          classNames={{
            base: "bg-stone",
            content: "capitalize text-white",
          }}
        >
          {weapon.type}
        </Chip>
        <Chip
          size="sm"
          classNames={{
            base: "bg-brightgold",
            content: "text-black",
          }}
        >
          Tier {weapon.tier}
        </Chip>
        {weapon.isExotic && (
          <Chip
            size="sm"
            startContent={<Icon path={mdiStar} size={0.5} />}
            classNames={{
              base: "bg-oxblood",
              content: "text-white",
            }}
          >
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
          <div className="flex items-center gap-1 text-sm font-semibold text-gold">
            <Icon path={mdiStar} size={0.5} />
            Enhancement: {enhancement.name}
          </div>
          <div className="text-sm">{enhancement.description}</div>
        </div>
      )}
    </div>
  );
};

const ArmorDisplay = ({ armor, enhancement }: { armor: Armor; enhancement?: Enhancement }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon path={mdiShield} size={1} className="text-stone" />
        <h4 className="marcellus text-lg font-semibold">{armor.name}</h4>
      </div>
      <div className="flex gap-2 mb-2">
        <Chip
          size="sm"
          classNames={{
            base: "bg-stone",
            content: "capitalize text-white",
          }}
        >
          {armor.category}
        </Chip>
        <Chip
          size="sm"
          classNames={{
            base: "bg-brightgold",
            content: "text-black",
          }}
        >
          Tier {armor.tier}
        </Chip>
        {armor.isExotic && (
          <Chip
            size="sm"
            startContent={<Icon path={mdiStar} size={0.5} />}
            classNames={{
              base: "bg-oxblood",
              content: "text-white",
            }}
          >
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
          <div className="flex items-center gap-1 text-sm font-semibold text-gold">
            <Icon path={mdiStar} size={0.5} />
            Enhancement: {enhancement.name}
          </div>
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
