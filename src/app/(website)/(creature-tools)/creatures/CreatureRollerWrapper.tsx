'use client';

import { useCreatureData } from '@/app/components/creatures/CreatureDataContext';
import CreatureRoller from '@/app/components/creatures/CreatureRoller';

export default function CreatureRollerWrapper() {
	const { creatures, filters } = useCreatureData();
	return <CreatureRoller creatures={creatures} filters={filters} />;
}
