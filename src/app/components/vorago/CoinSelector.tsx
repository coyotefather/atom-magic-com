'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useCoin } from '@/lib/slices/voragoSlice';

const CoinSelector = () => {
  const dispatch = useAppDispatch();
  const { availableCoins, disabledCoins, turn, hasUsedCoin } = useAppSelector(state => state.vorago);

  const playerDisabledCoins = disabledCoins[`player${turn}` as 'player1' | 'player2'];

  if (hasUsedCoin) {
	return (
	  <div className="text-center text-gray-500">
		You've already used a coin this turn
	  </div>
	);
  }

  return (
	<div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
	  {availableCoins.map(coin => {
		const isDisabled = playerDisabledCoins.includes(coin.title);

		return (
		  <button
			key={coin.title}
			onClick={() => !isDisabled && dispatch(useCoin(coin.title))}
			disabled={isDisabled}
			className={`
			  p-4 border-2 rounded-lg transition-all
			  ${isDisabled
				? 'opacity-50 cursor-not-allowed bg-gray-200'
				: 'hover:bg-gold hover:text-black cursor-pointer'
			  }
			`}
		  >
			<h3 className="font-bold marcellus">{coin.title}</h3>
			<p className="text-sm italic">{coin.subtitle}</p>
			<p className="text-xs mt-2">{coin.description}</p>
		  </button>
		);
	  })}
	</div>
  );
};

export default CoinSelector;