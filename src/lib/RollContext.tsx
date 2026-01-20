'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface RollResult {
	id: string;
	dieType: DieType;
	numDice: number;
	modifier: number;
	rolls: number[];
	total: number;
	timestamp: Date;
}

export interface RollContextType {
	// Latest roll (for checking)
	latestRoll: RollResult | null;

	// Subscribe to receive roll notifications
	onRollCaptured: (callback: (roll: RollResult) => void) => () => void;

	// Dice Roller calls this when a roll completes
	broadcastRoll: (roll: RollResult) => void;

	// Clear latest roll (after captured)
	clearLatestRoll: () => void;
}

const RollContext = createContext<RollContextType | undefined>(undefined);

export function RollProvider({ children }: { children: ReactNode }) {
	const [latestRoll, setLatestRoll] = useState<RollResult | null>(null);
	const subscribers = useRef<Set<(roll: RollResult) => void>>(new Set());

	const broadcastRoll = useCallback((roll: RollResult) => {
		setLatestRoll(roll);
		// Notify all subscribers
		subscribers.current.forEach(callback => callback(roll));
	}, []);

	const onRollCaptured = useCallback((callback: (roll: RollResult) => void) => {
		subscribers.current.add(callback);
		// Return unsubscribe function
		return () => {
			subscribers.current.delete(callback);
		};
	}, []);

	const clearLatestRoll = useCallback(() => {
		setLatestRoll(null);
	}, []);

	return (
		<RollContext.Provider value={{ latestRoll, onRollCaptured, broadcastRoll, clearLatestRoll }}>
			{children}
		</RollContext.Provider>
	);
}

/**
 * Hook for components that require RollContext (throws if not in provider)
 */
export function useRollContext(): RollContextType {
	const context = useContext(RollContext);
	if (context === undefined) {
		throw new Error('useRollContext must be used within a RollProvider');
	}
	return context;
}

/**
 * Hook for components that optionally use RollContext (returns null if not in provider)
 * This is useful for the Dice Roller which should work even without the provider
 */
export function useOptionalRollContext(): RollContextType | null {
	return useContext(RollContext) ?? null;
}
