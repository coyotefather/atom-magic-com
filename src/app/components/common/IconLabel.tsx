/**
 * IconLabel.tsx
 *
 * A small layout utility that pairs an MDI icon with text in a consistent,
 * flex-aligned row. It exists to eliminate the repetitive
 * `flex items-center gap-* text-*` boilerplate that would otherwise be
 * copy-pasted across dozens of stat displays, labels, and metadata lines.
 *
 * Three content modes:
 *   1. Icon + value only       — pass `children`, omit `label`
 *   2. Icon + label + value    — pass both; label renders bold with a colon separator
 *   3. Icon only               — omit both (useful when icon conveys meaning alone)
 *
 * Four size presets control both the icon size and the companion text size:
 *   - "xs" — 0.5 icon, text-xs
 *   - "sm" — 0.625 icon, text-sm (default)
 *   - "md" — 0.75 icon, text-base
 *   - "lg" — 1.0 icon, text-lg
 *
 * The wrapper element defaults to `div` (block) but can be changed to `span`
 * for inline use inside paragraphs or table cells.
 *
 * Props: see IconLabelProps interface in the file.
 *
 * Used by:
 *   - Character sheet stat rows (scores, shields, armor)
 *   - Creature stat blocks
 *   - Gear and enhancement detail displays
 */

import Icon from '@mdi/react';

type Size = 'xs' | 'sm' | 'md' | 'lg';

interface IconLabelProps {
  /** MDI icon path */
  icon: string;
  /** Primary text (label or value) */
  children?: React.ReactNode;
  /** Optional prefix label (displays before children as "Label: ") */
  label?: string;
  /** Icon color class (e.g., "text-oxblood", "text-gold") */
  iconColor?: string;
  /** Text color class (defaults to inherit) */
  textColor?: string;
  /** Size preset affecting icon size and text */
  size?: Size;
  /** Custom gap between icon and text (Tailwind gap class) */
  gap?: 'gap-1' | 'gap-2' | 'gap-3';
  /** Additional className for the container */
  className?: string;
  /** Render as different element (span for inline, div for block) */
  as?: 'div' | 'span';
}

const sizeConfig: Record<Size, { icon: number; text: string }> = {
  xs: { icon: 0.5, text: 'text-xs' },
  sm: { icon: 0.625, text: 'text-sm' },
  md: { icon: 0.75, text: 'text-base' },
  lg: { icon: 1, text: 'text-lg' },
};

/**
 * Consistent icon + label/value display component
 *
 * @example
 * // Simple icon + value
 * <IconLabel icon={mdiHeart} iconColor="text-oxblood">10</IconLabel>
 *
 * @example
 * // Icon + label prefix + value
 * <IconLabel icon={mdiStar} label="Enhancement">{enhancement.name}</IconLabel>
 *
 * @example
 * // Large icon + title
 * <IconLabel icon={mdiSword} size="lg" iconColor="text-stone">Weapon Name</IconLabel>
 */
const IconLabel = ({
  icon,
  children,
  label,
  iconColor,
  textColor,
  size = 'sm',
  gap = 'gap-1',
  className = '',
  as: Component = 'div',
}: IconLabelProps) => {
  const { icon: iconSize, text: textSize } = sizeConfig[size];

  return (
    <Component className={`flex items-center ${gap} ${textSize} ${textColor || ''} ${className}`}>
      <Icon path={icon} size={iconSize} className={iconColor} />
      {label && <span className="font-semibold">{label}:</span>}
      {children && <span>{children}</span>}
    </Component>
  );
};

export default IconLabel;
