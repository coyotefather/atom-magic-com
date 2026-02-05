'use client';

import { useCreatureData } from '@/app/components/creatures/CreatureDataContext';
import CreatureManager from '@/app/components/creatures/CreatureManager';

export default function CreatureManagerWrapper() {
	const { creatures, filters } = useCreatureData();
	return <CreatureManager creatures={creatures} filters={filters} />;
}
