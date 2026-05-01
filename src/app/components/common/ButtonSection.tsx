/**
 * ButtonSection.tsx
 *
 * A full-width two-column content block pairing a heading + body content on
 * the left with a single action button centered on the right. Supports a
 * `dark` variant that applies a black background with white text.
 *
 * This is a presentational layout component — it wraps arbitrary children
 * alongside a labeled call-to-action. The button is rendered as a
 * FunctionButton with the `primary` variant.
 *
 * Props:
 *   - variant: string       — pass "dark" for black bg / white text; any
 *                             other value leaves the background unstyled
 *   - name: string          — section heading text
 *   - buttonText: string    — label rendered inside the button
 *   - buttonIcon: string    — MDI icon path displayed inside the button
 *   - buttonFunction: Function — onClick handler invoked when the button is pressed
 *   - children: ReactNode   — body content placed below the heading
 *
 * Used by:
 *   - Homepage and other marketing pages that need a text block + CTA pairing
 */

'use client';
import clsx from 'clsx';
import FunctionButton from '@/app/components/common/FunctionButton';

const ButtonSection = ({
		variant,
		name = "",
		buttonText = "",
		buttonIcon = "",
		buttonFunction = () => { return true; },
		children
	}: {
		variant: string,
		name: string,
		buttonText: string,
		buttonIcon: string,
		buttonFunction: Function,
		children: React.ReactNode
	}) => {
	return (
		<div className={clsx(
			'pt-16 pb-16',
			{
				'bg-black text-white': variant === 'dark',
			},
		)}>
			<div className="container">
				<div className="grid grid-flow-col grid-cols-2">
					<div>
						<h2 className="marcellus text-3xl border-b-2 border-white border-solid mb-4">{name}</h2>
						{children}
					</div>
					<div className="m-auto">
						<FunctionButton
							onClick={() => buttonFunction()}
							icon={buttonIcon}
							variant="primary"
						>
							{buttonText}
						</FunctionButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ButtonSection;