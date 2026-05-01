/**
 * FunctionButton.tsx
 *
 * The primary interactive button component for all click-handler actions in
 * the project. Use this whenever the button executes a JavaScript function
 * (as opposed to navigating — use LinkButton for navigation).
 *
 * Supports seven visual variants to cover every common UI pattern:
 *   - "primary"   — gold fill, black text; the main call-to-action style
 *   - "secondary" — gold outline, transparent fill; secondary actions
 *   - "danger"    — oxblood fill, white text; destructive actions (delete, remove)
 *   - "ghost"     — no border/background; understated text buttons or icon buttons
 *   - "chip"      — small bordered pill for toggleable filter chips
 *   - "tab"       — bordered tab-style toggle for switching between modes/views
 *   - "toggle"    — compact icon-only toggle (e.g. lock/unlock ring in Vorago)
 *
 * The `chip`, `tab`, `ghost`, and `toggle` variants support an `isActive` prop
 * that switches between active and inactive color styles without remounting.
 *
 * "primary", "secondary", and "danger" use HeroUI's Button under the hood
 * (for accessible press handling). The remaining variants render as plain
 * <button> elements with Tailwind classes only.
 *
 * All variants share Marcellus font, uppercase tracking, and sharp corners
 * (`radius="none"` equivalent via Tailwind — no rounded classes applied).
 *
 * Three size presets: "sm", "md" (default), "lg" — control padding, font
 * size, and icon size together.
 *
 * Props: see FunctionButtonProps interface in the file for the full list.
 *
 * Used by:
 *   - Character Manager wizard (Continue, Roll, Reset, section controls)
 *   - Vorago game UI (coin actions, ring controls)
 *   - Creature Manager (save, delete, clone buttons)
 *   - ErrorDialog, Section, and other common components
 */

'use client';
import { Button } from "@heroui/react";
import clsx from 'clsx';
import Icon from '@mdi/react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'chip' | 'tab' | 'toggle';
type Size = 'sm' | 'md' | 'lg';

interface FunctionButtonProps {
  /** Click handler (event parameter optional for stopPropagation etc.) */
  onClick?: (e?: React.MouseEvent) => void;
  /** MDI icon path (optional) */
  icon?: string;
  /** Visual style variant */
  variant?: Variant;
  /** Button size */
  size?: Size;
  /** Icon-only mode (no text) */
  isIconOnly?: boolean;
  /** Disabled state */
  isDisabled?: boolean;
  /** Active/selected state (for toggles, chips) */
  isActive?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Title/tooltip */
  title?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
}

const sizeConfig: Record<Size, { padding: string; text: string; iconSize: number }> = {
  sm: { padding: 'px-3 py-1.5', text: 'text-sm', iconSize: 0.625 },
  md: { padding: 'px-6 py-3', text: 'text-sm', iconSize: 0.75 },
  lg: { padding: 'px-8 py-4', text: 'text-sm', iconSize: 0.875 },
};

const variantConfig: Record<Variant, { base: string; active: string; inactive: string }> = {
  primary: {
    base: 'bg-gold text-black hover:bg-brightgold border-0',
    active: '',
    inactive: '',
  },
  secondary: {
    base: 'border-2 border-gold text-gold bg-transparent hover:bg-gold/10',
    active: '',
    inactive: '',
  },
  danger: {
    base: 'bg-oxblood text-white hover:bg-oxblood-dark border-0',
    active: '',
    inactive: '',
  },
  ghost: {
    base: 'bg-transparent border-0 hover:text-gold transition-colors',
    active: 'text-gold',
    inactive: 'text-stone dark:text-stone-light',
  },
  chip: {
    base: 'border transition-colors',
    active: 'bg-bronze text-white border-bronze',
    inactive: 'bg-white dark:bg-black/20 text-stone border-stone hover:border-bronze hover:text-bronze dark:text-stone-light dark:border-stone-dark',
  },
  tab: {
    base: 'border-2 transition-all marcellus uppercase tracking-wider',
    active: 'bg-gold text-white border-gold',
    inactive: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light dark:hover:border-stone-light',
  },
  toggle: {
    base: 'p-2 border-2 transition-colors',
    active: 'border-gold bg-gold/10 text-gold',
    inactive: 'border-stone/30 text-stone hover:border-stone dark:border-stone-dark dark:text-stone-light',
  },
};

/**
 * Unified button component for click handlers
 *
 * @example
 * // Primary CTA
 * <FunctionButton onClick={handleSave} icon={mdiContentSave}>Save</FunctionButton>
 *
 * @example
 * // Danger action
 * <FunctionButton variant="danger" onClick={handleDelete}>Delete</FunctionButton>
 *
 * @example
 * // Ghost text button
 * <FunctionButton variant="ghost" onClick={handleClear} size="sm">Clear All</FunctionButton>
 *
 * @example
 * // Filter chip with active state
 * <FunctionButton variant="chip" size="sm" isActive={isSelected} onClick={toggle}>
 *   Forest
 * </FunctionButton>
 *
 * @example
 * // Tab toggle (mode selection)
 * <FunctionButton variant="tab" isActive={mode === 'easy'} onClick={() => setMode('easy')}>
 *   Easy Mode
 * </FunctionButton>
 *
 * @example
 * // Icon toggle (lock/unlock)
 * <FunctionButton
 *   variant="toggle"
 *   isActive={isLocked}
 *   icon={isLocked ? mdiLock : mdiLockOpen}
 *   onClick={() => setIsLocked(!isLocked)}
 *   title={isLocked ? 'Unlock' : 'Lock'}
 * />
 */
const FunctionButton = ({
  onClick = () => {},
  icon,
  variant = 'primary',
  size = 'md',
  isIconOnly = false,
  isDisabled = false,
  isActive = false,
  fullWidth = false,
  children,
  className = '',
  title,
  type = 'button',
}: FunctionButtonProps) => {
  const { padding, text, iconSize } = sizeConfig[size];
  const { base, active, inactive } = variantConfig[variant];

  // For variants with active states, apply active/inactive styles
  const hasActiveState = variant === 'ghost' || variant === 'chip' || variant === 'tab' || variant === 'toggle';
  const stateStyles = hasActiveState ? (isActive ? active : inactive) : '';

  // Ghost buttons don't use HeroUI styling, render as plain button
  if (variant === 'ghost') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        title={title}
        className={clsx(
          text,
          base,
          stateStyles,
          { 'opacity-50 cursor-not-allowed': isDisabled },
          { 'w-full': fullWidth },
          className
        )}
      >
        {icon && <Icon path={icon} size={iconSize} className={children ? 'mr-1.5 inline-block' : ''} />}
        {children}
      </button>
    );
  }

  // Chip variant - simple styled button without HeroUI
  if (variant === 'chip') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        title={title}
        className={clsx(
          padding,
          text,
          base,
          stateStyles,
          { 'opacity-50 cursor-not-allowed': isDisabled },
          { 'w-full': fullWidth },
          className
        )}
      >
        {icon && <Icon path={icon} size={iconSize} className={children ? 'mr-1.5 inline-block' : ''} />}
        {children}
      </button>
    );
  }

  // Tab variant - mode toggle buttons
  if (variant === 'tab') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        title={title}
        className={clsx(
          padding,
          text,
          base,
          stateStyles,
          { 'opacity-50 cursor-not-allowed': isDisabled },
          { 'w-full': fullWidth },
          className
        )}
      >
        {icon && <Icon path={icon} size={iconSize} className={children ? 'mr-1.5 inline-block' : ''} />}
        {children}
      </button>
    );
  }

  // Toggle variant - icon-only toggle buttons (lock/unlock)
  if (variant === 'toggle') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        title={title}
        className={clsx(
          base,
          stateStyles,
          { 'opacity-50 cursor-not-allowed': isDisabled },
          className
        )}
      >
        {icon && <Icon path={icon} size={iconSize} />}
        {children}
      </button>
    );
  }

  // Primary, secondary, danger - use HeroUI Button
  const iconElement = icon ? <Icon path={icon} size={iconSize} /> : undefined;

  return (
    <Button
      type={type}
      isDisabled={isDisabled}
      onPress={() => onClick?.()}
      isIconOnly={isIconOnly}
      aria-label={title}
      className={clsx(
        'marcellus uppercase tracking-widest font-bold transition-colors',
        padding,
        text,
        base,
        { 'opacity-50 cursor-not-allowed': isDisabled },
        { 'w-full': fullWidth },
        className
      )}
    >
      {isIconOnly ? iconElement : <>{iconElement}{children}</>}
    </Button>
  );
};

export default FunctionButton;

// Legacy prop support - can be removed after migration
export type { FunctionButtonProps };
