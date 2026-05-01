/**
 * ThemeToggle.tsx
 *
 * A small icon button that switches the site between light and dark mode.
 * The current theme is read from and written to ThemeContext
 * (`src/lib/ThemeContext.tsx`), which persists the preference to localStorage
 * and applies a `dark` CSS class to the document root.
 *
 * The button shows a moon icon when the site is in light mode (click to go
 * dark) and a sun icon when in dark mode (click to go light). The
 * aria-label updates accordingly so screen readers announce the action
 * correctly.
 *
 * No border is rendered — the button uses only padding and icon color,
 * turning gold on hover, so it sits unobtrusively in the site header.
 *
 * Used by:
 *   - Global site header (alongside the Nav component)
 */

'use client';

import { useTheme } from '@/lib/ThemeContext';
import Icon from '@mdi/react';
import { mdiWeatherSunny, mdiWeatherNight } from '@mdi/js';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className="p-2 border-0 text-stone-dark hover:text-gold transition-colors"
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
			title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			<Icon
				path={theme === 'light' ? mdiWeatherNight : mdiWeatherSunny}
				size={1}
			/>
		</button>
	);
};

export default ThemeToggle;
