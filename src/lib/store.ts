import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'
import characterReducer from "@/lib/slices/characterSlice";
import voragoReducer from "@/lib/slices/voragoSlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			character: characterReducer,
			vorago: voragoReducer,
		}
	})
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = ThunkAction<void, RootState, unknown, Action>