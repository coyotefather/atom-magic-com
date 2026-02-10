import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
	store?: AppStore;
}

export function renderWithProviders(
	ui: ReactElement,
	{ store = makeStore(), ...renderOptions }: ExtendedRenderOptions = {}
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	return {
		store,
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}

export * from '@testing-library/react';
export { renderWithProviders as render };
