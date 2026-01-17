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
