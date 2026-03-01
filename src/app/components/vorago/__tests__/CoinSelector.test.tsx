import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CoinSelector from '@/app/components/vorago/CoinSelector';
import { renderWithProviders } from '@/test/utils';
import { COINS } from '@/lib/slices/voragoSlice';
import { initialState } from '@/lib/slices/voragoConstants';

// CoinSVG renders inline SVG which is fine in jsdom, but mock it to keep
// test output clean and avoid any canvas/SVG edge cases.
vi.mock('@/app/components/vorago/CoinSVGs', () => ({
	default: ({ aspect }: { aspect: string }) => <span data-testid={`coin-svg-${aspect}`} />,
}));

describe('CoinSelector', () => {
	it('renders all available coins in the listbox', () => {
		renderWithProviders(<CoinSelector />);
		const listbox = screen.getByRole('listbox', { name: 'Available coin abilities' });
		const options = listbox.querySelectorAll('[role="option"]');
		expect(options).toHaveLength(COINS.length);
	});

	it('renders a cooldown coin as disabled', () => {
		renderWithProviders(<CoinSelector />, {
			preloadedState: {
				vorago: {
					...initialState,
					disabledCoins: { player1: ['Anathema'], player2: [] },
				},
			},
		});
		const btn = screen.getByRole('option', { name: /Anathema.*on cooldown/i });
		expect(btn).toBeDisabled();
	});

	it('renders an inapplicable coin as disabled', () => {
		// Aura requires walls or bridges — none exist in the initial state
		renderWithProviders(<CoinSelector />);
		const btn = screen.getByRole('option', { name: /Aura.*not applicable/i });
		expect(btn).toBeDisabled();
	});

	it('clicking an available coin sets it as selectedCoin in state', async () => {
		// Anathema (lockRing) is applicable when no rings are locked (initial state)
		const { store } = renderWithProviders(<CoinSelector />);
		const btn = screen.getByRole('option', { name: /^Anathema/i });
		await userEvent.click(btn);
		expect(store.getState().vorago.selectedCoin).toBe('Anathema');
	});
});
