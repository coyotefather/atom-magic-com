// Vorago Coin SVG Components
// Simplified atom symbol design with gold or silver gradient based on Cardinal Force aspect

import React from 'react';

interface CoinSVGProps {
  aspect: 'um' | 'os' | 'umos';
  className?: string;
}

export const CoinSVGs: React.FC<CoinSVGProps> = ({ aspect, className = '' }) => {
  // Aura is gold (Umos), all others follow the original: Um/Os are silver
  const isGold = aspect === 'umos';

  const gradientId = isGold ? 'coin-gold' : 'coin-silver';

  return (
	<svg
	  xmlns="http://www.w3.org/2000/svg"
	  viewBox="0 0 1000 1000"
	  className={className}
	>
	  <defs>
		{isGold ? (
		  // Gold gradient for Umos (Aura)
		  <>
			<radialGradient id="coin-gold-outer" cx="500" cy="500" r="495">
			  <stop offset="0%" stopColor="#fffbcc"/>
			  <stop offset="10%" stopColor="#faf1ba"/>
			  <stop offset="30%" stopColor="#efd98e"/>
			  <stop offset="40%" stopColor="#eed688"/>
			  <stop offset="70%" stopColor="#ebbb10"/>
			  <stop offset="100%" stopColor="#c3922e"/>
			</radialGradient>
			<radialGradient id="coin-gold-inner" cx="500" cy="500" r="480" xlinkHref="#coin-gold-outer"/>
			<radialGradient id="coin-gold-center" cx="500" cy="500" r="195" xlinkHref="#coin-gold-outer"/>
		  </>
		) : (
		  // Silver gradient for Um/Os
		  <>
			<radialGradient id="coin-silver-outer" cx="500" cy="500" r="495">
			  <stop offset="0%" stopColor="#fff"/>
			  <stop offset="20%" stopColor="#f0f0f0"/>
			  <stop offset="50%" stopColor="#d8d8d8"/>
			  <stop offset="60%" stopColor="#ced0d0"/>
			  <stop offset="80%" stopColor="#b4bdba"/>
			  <stop offset="100%" stopColor="#9baaa6"/>
			</radialGradient>
			<radialGradient id="coin-silver-inner" cx="500" cy="500" r="480" xlinkHref="#coin-silver-outer"/>
			<radialGradient id="coin-silver-center" cx="500" cy="500" r="195" xlinkHref="#coin-silver-outer"/>
		  </>
		)}
	  </defs>

	  {/* Outer circle */}
	  <circle
		cx="500" cy="500" r="495"
		fill={`url(#${gradientId}-outer)`}
	  />

	  {/* Inner circle with stroke */}
	  <circle
		cx="500" cy="500" r="480"
		fill={`url(#${gradientId}-inner)`}
		stroke="#000"
		strokeWidth="10"
	  />

	  {/* Middle circle ring */}
	  <circle
		cx="500" cy="500" r="300"
		fill="none"
		stroke="#000"
		strokeWidth="5"
	  />

	  {/* Atom symbol lines - geometric pattern */}
	  <g stroke="#000" strokeWidth="5" fill="none">
		{/* Diagonal crosses */}
		<line x1="226.9" y1="613.1" x2="773.1" y2="386.9"/>
		<line x1="386.9" y1="226.9" x2="613.1" y2="773.1"/>
		<line x1="386.9" y1="773.1" x2="613.1" y2="226.9"/>
		<line x1="226.9" y1="386.9" x2="773.1" y2="613.1"/>

		{/* Horizontal and vertical */}
		<line x1="204.3" y1="500" x2="795.7" y2="500"/>
		<line x1="500" y1="204.3" x2="500" y2="795.7"/>

		{/* Additional diagonals */}
		<line x1="290.9" y1="709.1" x2="709.1" y2="290.9"/>
		<line x1="290.9" y1="290.9" x2="709.1" y2="709.1"/>

		{/* More complex pattern lines */}
		<line x1="254.2" y1="664.3" x2="745.8" y2="335.7"/>
		<line x1="335.7" y1="254.2" x2="664.3" y2="745.8"/>
		<line x1="442.3" y1="790" x2="557.7" y2="210"/>
		<line x1="210" y1="442.3" x2="790" y2="557.7"/>
		<line x1="210" y1="557.7" x2="790" y2="442.3"/>
		<line x1="442.3" y1="210" x2="557.7" y2="790"/>
		<line x1="335.7" y1="745.8" x2="664.3" y2="254.2"/>
		<line x1="254.2" y1="335.7" x2="745.8" y2="664.3"/>
	  </g>

	  {/* Center circle */}
	  <circle
		cx="500" cy="500" r="195"
		fill={`url(#${gradientId}-center)`}
		stroke="#000"
		strokeWidth="5"
	  />

	  {/* Center flower/atom symbol */}
	  <path
		d="M516.6,502.4c5.7,.2,10.6-1.7,10.6-1.7,0,0-4.1-3.7-9.6-5.3,5.3-2.1,9-5.8,9-5.8,0,0-5.3-1.7-10.9-1,4-4,5.9-8.9,5.9-8.9,0,0-5.9,.6-10.9,3.8,2.1-5.5,1.8-11.2,1.8-11.2,0,0-5.4,3.2-8.5,8.5-.4-6.1-3.4-11.3-3.4-11.3,0,0-3,4.6-3.8,10.3-2.9-4.9-7.1-8-7.1-8,0,0-.9,5.5,.7,10.9-4.6-3.3-9.7-4.5-9.7-4.5,0,0,1.4,5.3,5,9.7-5.5-1.2-10.7-.2-10.7-.2,0,0,3.4,4.3,8.5,6.9-5.5,1.1-9.9,4.1-9.9,4.1,0,0,4.9,2.6,10.6,2.9-4.6,3.3-7.3,7.8-7.3,7.8,0,0,5.5,.4,10.8-1.6-2.9,4.9-3.6,10.1-3.6,10.1,0,0,5.2-1.9,9.2-5.9-.7,5.6,.8,10.7,.8,10.7,0,0,4-3.8,6.1-9.1,1.6,5.4,5,9.5,5,9.5,0,0,2.1-5.1,1.9-10.8,3.7,4.3,8.4,6.6,8.4,6.6,0,0,0-5.5-2.6-10.6,5.1,2.5,10.3,2.7,10.3,2.7,0,0-2.3-5-6.6-8.7Z"
		fill="none"
		stroke="#000"
		strokeWidth="5"
	  />
	</svg>
  );
};

// Helper function to get aspect for a coin name
export const getCoinAspect = (coinTitle: string): 'um' | 'os' | 'umos' => {
  // Aura is the only Umos (gold)
  if (coinTitle === 'Aura') return 'umos';

  // Um Cardinals (silver)
  const umCoins = ['Mnemonic', 'Cadence', 'Magna', 'Gamma', 'Anathema', 'Sovereign'];
  if (umCoins.includes(coinTitle)) return 'um';

  // Os Cardinals (silver)
  return 'os';
};

export default CoinSVGs;