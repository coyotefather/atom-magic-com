'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { NormedCreature, CreatureFilters } from '@/lib/creature-types';

interface CreatureDataContextType {
	creatures: NormedCreature[];
	filters: CreatureFilters;
}

const CreatureDataContext = createContext<CreatureDataContextType | null>(null);

export function CreatureDataProvider({
	children,
	creatures,
	filters,
}: {
	children: ReactNode;
	creatures: NormedCreature[];
	filters: CreatureFilters;
}) {
	return (
		<CreatureDataContext.Provider value={{ creatures, filters }}>
			{children}
		</CreatureDataContext.Provider>
	);
}

export function useCreatureData(): CreatureDataContextType {
	const context = useContext(CreatureDataContext);
	if (!context) {
		throw new Error('useCreatureData must be used within a CreatureDataProvider');
	}
	return context;
}
