'use client';

import { useCreatureData } from '@/app/components/creatures/CreatureDataContext';
import EncounterBuilder from '@/app/components/encounters/EncounterBuilder';

export default function EncounterBuilderWrapper() {
	const { creatures, filters } = useCreatureData();
	return <EncounterBuilder creatures={creatures} filters={filters} />;
}
