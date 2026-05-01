/**
 * store.ts
 *
 * Configures the Redux store for the Atom Magic app and exports the
 * TypeScript types needed to use it throughout the codebase.
 *
 * The app has three Redux slices:
 *   - `character`      — State for the Character Manager (the character being built/edited)
 *   - `vorago`         — State for the Vorago board game (board, stones, coins, turn info)
 *   - `customCreature` — State for the Creature Manager editor (the creature being built/edited)
 *
 * Why `makeStore` is a factory function (not a direct `configureStore` export):
 *   Next.js can create multiple server-side instances per request. Exporting a single
 *   store would share state across requests. The factory pattern ensures each request
 *   (and each client session) gets its own isolated store.
 *   The factory is called by StoreProvider.tsx which wraps the app in the Redux Provider.
 *
 * The exported types (RootState, AppDispatch, AppThunk) are used throughout the app
 * for typed hooks and thunk definitions. Import them from here, not from individual slices.
 */

import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'
import characterReducer from "@/lib/slices/characterSlice";
import voragoReducer from "@/lib/slices/voragoSlice";
import customCreatureReducer from "@/lib/slices/customCreatureSlice";

/**
 * Factory that creates a new Redux store instance.
 * Called once per app session by StoreProvider.tsx.
 */
export const makeStore = () => {
  return configureStore({
    reducer: {
      character: characterReducer,
      vorago: voragoReducer,
      customCreature: customCreatureReducer,
    }
  })
}

/** The type of the store instance returned by makeStore. */
export type AppStore = ReturnType<typeof makeStore>

/** The shape of the entire Redux state tree. Use this when writing selectors. */
export type RootState = ReturnType<AppStore['getState']>

/** The typed dispatch function. Use via `useAppDispatch()` hook (from lib/hooks.ts). */
export type AppDispatch = AppStore['dispatch']

/** Type for async thunks that return void. Use when defining createAsyncThunk actions. */
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
