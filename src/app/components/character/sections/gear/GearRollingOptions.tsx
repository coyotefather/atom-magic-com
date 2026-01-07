'use client';
import { Checkbox, CheckboxGroup } from "@heroui/react";
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

  return (
    <div className="space-y-6">
      {/* Exotic & Enhancement Toggles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-stone">Weapons</h4>
          <Checkbox
            color="default"
            isSelected={options.includeExoticWeapons}
            isDisabled={disabled}
            onValueChange={(checked) => handleToggle('includeExoticWeapons', checked)}
          >
            Include Exotic
          </Checkbox>
          <Checkbox
            color="default"
            isSelected={options.includeWeaponEnhancements}
            isDisabled={disabled}
            onValueChange={(checked) => handleToggle('includeWeaponEnhancements', checked)}
          >
            Include Enhancements
          </Checkbox>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-stone">Armor</h4>
          <Checkbox
            color="default"
            isSelected={options.includeExoticArmor}
            isDisabled={disabled}
            onValueChange={(checked) => handleToggle('includeExoticArmor', checked)}
          >
            Include Exotic
          </Checkbox>
          <Checkbox
            color="default"
            isSelected={options.includeArmorEnhancements}
            isDisabled={disabled}
            onValueChange={(checked) => handleToggle('includeArmorEnhancements', checked)}
          >
            Include Enhancements
          </Checkbox>
        </div>
      </div>

      {/* Weapon Categories */}
      <div>
        <CheckboxGroup
          label="Weapon Categories"
          orientation="horizontal"
          color="default"
          value={options.weaponCategories}
          isDisabled={disabled}
          onValueChange={handleWeaponCategories}
          classNames={{
            label: "text-sm font-semibold text-stone",
          }}
        >
          <Checkbox value="light">Light</Checkbox>
          <Checkbox value="medium">Medium</Checkbox>
          <Checkbox value="heavy">Heavy</Checkbox>
        </CheckboxGroup>
      </div>

      {/* Weapon Types */}
      <div>
        <CheckboxGroup
          label="Weapon Types"
          orientation="horizontal"
          color="default"
          value={options.weaponTypes}
          isDisabled={disabled}
          onValueChange={handleWeaponTypes}
          classNames={{
            label: "text-sm font-semibold text-stone",
          }}
        >
          <Checkbox value="melee">Melee</Checkbox>
          <Checkbox value="ranged">Ranged</Checkbox>
        </CheckboxGroup>
      </div>

      {/* Armor Categories */}
      <div>
        <CheckboxGroup
          label="Armor Categories"
          orientation="horizontal"
          color="default"
          value={options.armorCategories}
          isDisabled={disabled}
          onValueChange={handleArmorCategories}
          classNames={{
            label: "text-sm font-semibold text-stone",
          }}
        >
          <Checkbox value="light">Light</Checkbox>
          <Checkbox value="medium">Medium</Checkbox>
          <Checkbox value="heavy">Heavy</Checkbox>
        </CheckboxGroup>
      </div>

      {/* Tiers */}
      <div>
        <CheckboxGroup
          label="Tiers"
          orientation="horizontal"
          color="default"
          value={options.tiers.map(t => t.toString())}
          isDisabled={disabled}
          onValueChange={handleTiers}
          classNames={{
            label: "text-sm font-semibold text-stone",
          }}
        >
          <Checkbox value="1">Tier 1</Checkbox>
          <Checkbox value="2">Tier 2</Checkbox>
          <Checkbox value="3">Tier 3</Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
};

export default GearRollingOptions;
