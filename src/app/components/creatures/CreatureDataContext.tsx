'use client';

import { createContext, useContext, ReactNode } from 'react';
import type {
	CREATURES_QUERY_RESULT,
	CREATURE_FILTERS_QUERY_RESULT,
} from '../../../../sanity.types';

interface CreatureDataContextType {
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
}

const CreatureDataContext = createContext<CreatureDataContextType | null>(null);

export function CreatureDataProvider({
	children,
	creatures,
	filters,
}: {
	children: ReactNode;
	creatures: CREATURES_QUERY_RESULT;
	filters: CREATURE_FILTERS_QUERY_RESULT;
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
