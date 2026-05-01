'use client';

/**
 * ThemeContext.tsx
 *
 * React Context and provider for the app-wide light/dark theme toggle.
 *
 * How theming works in this app:
 *   - The theme is stored as a CSS class (`dark`) on the `<html>` element.
 *   - Tailwind CSS 4 uses the `dark:` variant to apply dark-mode styles
 *     whenever the `dark` class is present on the root element.
 *   - The CSS variable `--theme-bg`, `--theme-text`, and `--theme-border`
 *     in globals.css flip their values based on this class.
 *
 * Initialization order:
 *   1. On mount, check `localStorage` for a previously saved preference.
 *   2. If no saved preference, fall back to the OS/browser system preference
 *      (via `window.matchMedia('(prefers-color-scheme: dark')`).
 *   3. Apply the resolved theme class to `document.documentElement`.
 *   4. After mounting, persist every theme change back to localStorage.
 *
 * Flash prevention:
 *   The provider renders `null` before it has mounted and read localStorage.
 *   This prevents a "flash of wrong theme" where the page briefly shows the
 *   wrong colors on initial load.
 *
 * ThemeProvider is mounted in the root layout (src/app/layout.tsx) so every
 * page in the app has access to the theme context.
 *
 * Consumed by:
 *   - The theme toggle button in the site Header
 *   - Any component that needs to read the current theme (e.g., to adjust
 *     chart colors or icon styles based on dark vs. light mode)
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/** The two possible theme values. */
type Theme = 'light' | 'dark';

interface ThemeContextType {
	/** The currently active theme. */
	theme: Theme;
	/** Flip between light and dark. */
	toggleTheme: () => void;
	/** Set to a specific theme without toggling. */
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** The localStorage key used to persist the user's theme preference across sessions. */
const STORAGE_KEY = 'atom-magic-theme';

/**
 * Mount this at the root of the app (e.g., in layout.tsx) to provide theme
 * state to all descendant components.
 *
 * Reads localStorage on mount, falls back to system preference, and persists
 * future changes. Renders nothing until the theme is resolved to avoid a
 * flash of the wrong theme on first load.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>('light');

	/**
	 * `mounted` tracks whether we've read from localStorage yet.
	 * We render null until this is true to prevent the wrong theme
	 * from briefly flashing on initial load.
	 */
	const [mounted, setMounted] = useState(false);

	// On mount, read the stored preference or fall back to system preference.
	// This runs only once (empty dependency array) and only in the browser.
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === 'dark' || stored === 'light') {
			setThemeState(stored);
		} else {
			// No stored preference — respect the OS/browser setting
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			setThemeState(prefersDark ? 'dark' : 'light');
		}
		setMounted(true);
	}, []);

	// Whenever the theme changes (and after we've mounted), apply the CSS class
	// to the root element and persist the new preference to localStorage.
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		// Persist so the preference survives page refreshes and new sessions
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setThemeState(prev => prev === 'light' ? 'dark' : 'light');
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	// Don't render until we know the correct theme — avoids a flash of wrong colors
	if (!mounted) {
		return null;
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

/**
 * Hook to read and change the current theme.
 *
 * Must be called from a component that is a descendant of `<ThemeProvider>`.
 * Throws an error if used outside the provider to prevent silent failures.
 *
 * @example
 *   const { theme, toggleTheme } = useTheme();
 *   // theme === 'light' | 'dark'
 *   // toggleTheme() switches between them
 */
export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
