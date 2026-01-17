'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'atom-magic-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>('light');
	const [mounted, setMounted] = useState(false);

	// Load theme from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored === 'dark' || stored === 'light') {
			setThemeState(stored);
		} else {
			// Check system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			setThemeState(prefersDark ? 'dark' : 'light');
		}
		setMounted(true);
	}, []);

	// Apply theme class to document
	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}

		// Persist to localStorage
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setThemeState(prev => prev === 'light' ? 'dark' : 'light');
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	// Prevent flash of wrong theme
	if (!mounted) {
		return null;
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
