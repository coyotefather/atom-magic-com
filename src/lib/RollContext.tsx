'use client';

/**
 * RollContext.tsx
 *
 * React Context that lets the Dice Roller component broadcast its results to
 * other parts of the UI that care about dice rolls.
 *
 * Background:
 *   The Dice Roller is a standalone tool, but some other UI elements — like
 *   creature stat cards in the Encounter Builder — allow the user to click on
 *   a stat to roll that dice expression. When a roll completes in the Dice Roller,
 *   any subscribed component can react to it (e.g., show an animation, log it
 *   to the Adventure Log, or highlight the relevant stat).
 *
 * Architecture:
 *   This context acts as a simple event bus:
 *
 *     Dice Roller  ──broadcastRoll()──►  RollContext  ──subscribers──►  Any component
 *
 *   - The Dice Roller calls `broadcastRoll(result)` when a roll finishes.
 *   - Any component can subscribe via `onRollCaptured(callback)` to receive rolls.
 *   - `latestRoll` stores the most recent result for components that only need
 *     the latest value rather than a full subscription.
 *
 * Why an event bus instead of just sharing latestRoll?
 *   A simple `latestRoll` state would miss multiple rapid rolls (each `setState`
 *   would overwrite the previous one before any subscriber reads it). The
 *   subscriber pattern via a `useRef<Set>` ensures all subscribers see every
 *   roll, regardless of how quickly they arrive.
 *
 * Two hook variants:
 *   - `useRollContext()` — for components that REQUIRE the provider (throws if absent)
 *   - `useOptionalRollContext()` — for components that WORK WITHOUT the provider
 *     (e.g., the Dice Roller itself, which functions as a standalone tool on the
 *     /tools page where the provider may not be present)
 *
 * RollProvider is mounted in the root layout so it's available site-wide.
 *
 * Consumed by:
 *   - src/app/components/dice/DiceRoller.tsx (calls broadcastRoll)
 *   - src/app/components/adventure-log/AdventureLog.tsx (subscribes to log rolls)
 *   - Creature stat click handlers (trigger rolls from outside the Dice Roller UI)
 */

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

/** The standard die sizes available in the Dice Roller. */
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

/**
 * The result of a single dice roll event.
 *
 * A single roll can involve multiple dice of the same type plus a modifier.
 * For example, rolling 2d6+3 would have numDice=2, dieType='d6', modifier=3,
 * rolls=[4, 2], total=9.
 */
export interface RollResult {
	/** Unique ID for this roll event — used as a React list key if rolls are displayed in a list. */
	id: string;
	/** Which die was rolled (e.g., 'd6', 'd20'). */
	dieType: DieType;
	/** How many of that die were rolled. */
	numDice: number;
	/** Flat modifier added to the total (can be negative). */
	modifier: number;
	/** Individual die results, one per die rolled. */
	rolls: number[];
	/** Sum of all dice results plus the modifier. */
	total: number;
	/** When the roll happened — used for ordering in the Adventure Log. */
	timestamp: Date;
}

export interface RollContextType {
	/** The most recently broadcast roll. Null if no roll has happened yet this session. */
	latestRoll: RollResult | null;

	/**
	 * Subscribe to receive a callback every time a roll is broadcast.
	 * Returns an unsubscribe function — call it in a useEffect cleanup.
	 *
	 * @example
	 *   useEffect(() => {
	 *     return onRollCaptured(roll => console.log('Roll:', roll.total));
	 *   }, [onRollCaptured]);
	 */
	onRollCaptured: (callback: (roll: RollResult) => void) => () => void;

	/**
	 * Called by the Dice Roller when a roll completes.
	 * Updates `latestRoll` and notifies all active subscribers.
	 */
	broadcastRoll: (roll: RollResult) => void;

	/** Clears the latest roll (e.g., after a subscriber has processed it). */
	clearLatestRoll: () => void;
}

const RollContext = createContext<RollContextType | undefined>(undefined);

/**
 * Mount at the root layout level to make roll broadcasting available
 * throughout the app. The Dice Roller and Adventure Log both need this.
 */
export function RollProvider({ children }: { children: ReactNode }) {
	const [latestRoll, setLatestRoll] = useState<RollResult | null>(null);

	/**
	 * The subscriber Set lives in a ref (not state) so that adding/removing
	 * subscribers doesn't trigger a re-render of the provider and its entire
	 * child tree. Refs are mutable and always hold the current Set without
	 * causing React to re-render.
	 */
	const subscribers = useRef<Set<(roll: RollResult) => void>>(new Set());

	const broadcastRoll = useCallback((roll: RollResult) => {
		setLatestRoll(roll);
		// Notify all currently-subscribed components
		subscribers.current.forEach(callback => callback(roll));
	}, []);

	const onRollCaptured = useCallback((callback: (roll: RollResult) => void) => {
		subscribers.current.add(callback);
		// Return a cleanup function that removes this specific subscription
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
 * Hook for components that REQUIRE the RollContext to function.
 * Throws a descriptive error if used outside a RollProvider, making
 * misconfigured component trees easier to debug.
 */
export function useRollContext(): RollContextType {
	const context = useContext(RollContext);
	if (context === undefined) {
		throw new Error('useRollContext must be used within a RollProvider');
	}
	return context;
}

/**
 * Hook for components that OPTIONALLY use the RollContext.
 *
 * Returns null if no RollProvider is in the tree, rather than throwing.
 * Use this for the Dice Roller itself, which should work as a standalone
 * tool even on pages where roll broadcasting isn't needed.
 *
 * @example
 *   const rollContext = useOptionalRollContext();
 *   // If null, skip broadcasting; if non-null, call broadcastRoll(result)
 */
export function useOptionalRollContext(): RollContextType | null {
	return useContext(RollContext) ?? null;
}
