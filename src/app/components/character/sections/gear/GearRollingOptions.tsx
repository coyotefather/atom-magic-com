'use client';
import { Checkbox, CheckboxGroup, Label } from "@heroui/react";
import {
  GearRollingOptions as GearRollingOptionsType,
  WeaponCategory,
  WeaponType,
  ArmorCategory,
  Tier,
} from '@/lib/gear-data';

interface GearRollingOptionsProps {
  options: GearRollingOptionsType;
  onChange: (options: GearRollingOptionsType) => void;
  disabled?: boolean;
}

const GearRollingOptions = ({ options, onChange, disabled = false }: GearRollingOptionsProps) => {
  const handleToggle = (key: keyof GearRollingOptionsType, value: boolean) => {
    onChange({ ...options, [key]: value });
  };

  const handleWeaponCategories = (values: string[]) => {
    onChange({ ...options, weaponCategories: values as WeaponCategory[] });
  };

  const handleWeaponTypes = (values: string[]) => {
    onChange({ ...options, weaponTypes: values as WeaponType[] });
  };

  const handleArmorCategories = (values: string[]) => {
    onChange({ ...options, armorCategories: values as ArmorCategory[] });
  };

  const handleTiers = (values: string[]) => {
    onChange({ ...options, tiers: values.map(v => parseInt(v)) as Tier[] });
  };

  const CheckboxItem = ({ value, label, isSelected, isDisabled: itemDisabled, onChange }: {
    value?: string;
    label: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    onChange?: (checked: boolean) => void;
  }) => (
    <Checkbox
      value={value}
      isSelected={isSelected}
      isDisabled={itemDisabled}
      onChange={onChange}
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label>{label}</Label>
      </Checkbox.Content>
    </Checkbox>
  );

  return (
    <div className="space-y-4">
      {/* Exotic & Enhancement Toggles */}
      <div className="grid grid-cols-2 gap-4 p-4 border border-stone bg-parchment/50">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-stone marcellus">Weapons</h4>
          <CheckboxItem
            label="Include Exotic"
            isSelected={options.includeExoticWeapons}
            isDisabled={disabled}
            onChange={(checked) => handleToggle('includeExoticWeapons', checked)}
          />
          <CheckboxItem
            label="Include Enhancements"
            isSelected={options.includeWeaponEnhancements}
            isDisabled={disabled}
            onChange={(checked) => handleToggle('includeWeaponEnhancements', checked)}
          />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-stone marcellus">Armor</h4>
          <CheckboxItem
            label="Include Exotic"
            isSelected={options.includeExoticArmor}
            isDisabled={disabled}
            onChange={(checked) => handleToggle('includeExoticArmor', checked)}
          />
          <CheckboxItem
            label="Include Enhancements"
            isSelected={options.includeArmorEnhancements}
            isDisabled={disabled}
            onChange={(checked) => handleToggle('includeArmorEnhancements', checked)}
          />
        </div>
      </div>

      {/* Weapon Categories */}
      <div className="p-4 border border-stone bg-parchment/50">
        <CheckboxGroup
          className="flex flex-row flex-wrap gap-4"
          value={options.weaponCategories}
          isDisabled={disabled}
          onChange={handleWeaponCategories}
        >
          <Label className="text-sm font-semibold text-stone">Weapon Categories</Label>
          <CheckboxItem value="light" label="Light" />
          <CheckboxItem value="medium" label="Medium" />
          <CheckboxItem value="heavy" label="Heavy" />
        </CheckboxGroup>
      </div>

      {/* Weapon Types */}
      <div className="p-4 border border-stone bg-parchment/50">
        <CheckboxGroup
          className="flex flex-row flex-wrap gap-4"
          value={options.weaponTypes}
          isDisabled={disabled}
          onChange={handleWeaponTypes}
        >
          <Label className="text-sm font-semibold text-stone">Weapon Types</Label>
          <CheckboxItem value="melee" label="Melee" />
          <CheckboxItem value="ranged" label="Ranged" />
        </CheckboxGroup>
      </div>

      {/* Armor Categories */}
      <div className="p-4 border border-stone bg-parchment/50">
        <CheckboxGroup
          className="flex flex-row flex-wrap gap-4"
          value={options.armorCategories}
          isDisabled={disabled}
          onChange={handleArmorCategories}
        >
          <Label className="text-sm font-semibold text-stone">Armor Categories</Label>
          <CheckboxItem value="light" label="Light" />
          <CheckboxItem value="medium" label="Medium" />
          <CheckboxItem value="heavy" label="Heavy" />
        </CheckboxGroup>
      </div>

      {/* Tiers */}
      <div className="p-4 border border-stone bg-parchment/50">
        <CheckboxGroup
          className="flex flex-row flex-wrap gap-4"
          value={options.tiers.map(t => t.toString())}
          isDisabled={disabled}
          onChange={handleTiers}
        >
          <Label className="text-sm font-semibold text-stone">Tiers</Label>
          <CheckboxItem value="1" label="Tier 1" />
          <CheckboxItem value="2" label="Tier 2" />
          <CheckboxItem value="3" label="Tier 3" />
        </CheckboxGroup>
      </div>
    </div>
  );
};

export default GearRollingOptions;
