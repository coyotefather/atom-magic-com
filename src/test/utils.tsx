import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import voragoReducer from '@/lib/slices/voragoSlice';
import characterReducer from '@/lib/slices/characterSlice';
import customCreatureReducer from '@/lib/slices/customCreatureSlice';
import type { AppStore, RootState } from '@/lib/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	preloadedState?: Partial<RootState>;
	store?: AppStore;
}

function setupStore(preloadedState?: Partial<RootState>): AppStore {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return configureStore({
		reducer: {
			character: characterReducer,
			vorago: voragoReducer,
			customCreature: customCreatureReducer,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preloadedState: preloadedState as any,
	}) as AppStore;
}

export function renderWithProviders(
	ui: React.ReactElement,
	{ preloadedState, store, ...renderOptions }: ExtendedRenderOptions = {}
) {
	const resolvedStore = store ?? setupStore(preloadedState);

	function Wrapper({ children }: PropsWithChildren) {
		return <Provider store={resolvedStore}>{children}</Provider>;
	}

	return { store: resolvedStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
