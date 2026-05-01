/**
 * hooks.ts
 *
 * Typed wrappers around the standard React-Redux hooks.
 *
 * The plain `useDispatch`, `useSelector`, and `useStore` hooks from react-redux
 * are not type-aware by default — they return generic types that don't know
 * about this app's specific store shape or action types.
 *
 * These three wrappers bind the app's concrete types (AppDispatch, RootState,
 * AppStore) to the hooks so that:
 *   - `useAppDispatch()` returns a dispatch function that knows about all of the
 *     app's thunks and actions (including async thunks from Redux Toolkit)
 *   - `useAppSelector(state => state.character)` gives full autocomplete and type
 *     safety on the state shape — TypeScript will catch typos like `state.charactre`
 *   - `useAppStore()` returns the full typed store instance (useful when you need
 *     `getState()` or `subscribe()` directly — rare, but used by StoreProvider)
 *
 * IMPORTANT: Import these hooks from this file everywhere in the app, NOT the
 * plain react-redux versions. Using the plain versions loses all type safety.
 *
 * These are used in every component that reads from or dispatches to Redux state.
 * Examples of callers:
 *   - src/app/components/character/Sections.tsx (reads character state)
 *   - src/app/components/vorago/VoragoBoard.tsx (reads vorago state, dispatches moves)
 *   - src/lib/hooks/useCharacterPersistence.ts (dispatches loadCharacter)
 */

import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

/** Typed version of useDispatch. Returns a dispatch function that accepts any action or thunk defined in this app. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/** Typed version of useSelector. Passes the full RootState type so selectors get autocomplete and type checking. */
export const useAppSelector = useSelector.withTypes<RootState>()

/** Typed version of useStore. Returns the full store instance with all three slices typed. */
export const useAppStore = useStore.withTypes<AppStore>()
