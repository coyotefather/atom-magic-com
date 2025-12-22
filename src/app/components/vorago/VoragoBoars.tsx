'use client';

import { useAppSelector } from '@/lib/hooks';

const VoragoBoard = () => {
  const { cells, degrees, stones, selectedStone } = useAppSelector(state => state.vorago);

  return (
	<div className="relative w-[600px] h-[600px] mx-auto">
	  {/* Rings will go here */}
	  <svg viewBox="0 0 600 600" className="w-full h-full">
		{/* Center goal */}
		<circle
		  cx="300"
		  cy="300"
		  r="40"
		  fill="var(--color-gold)"
		  stroke="var(--color-black)"
		  strokeWidth="2"
		/>

		{/* Rings - we'll implement these properly in Phase 3 */}
		{[5, 4, 3, 2, 1].map((ring, idx) => (
		  <g key={ring} transform={`rotate(${degrees[idx]} 300 300)`}>
			<circle
			  cx="300"
			  cy="300"
			  r={60 + (ring * 40)}
			  fill="none"
			  stroke="var(--color-black)"
			  strokeWidth="2"
			/>
		  </g>
		))}
	  </svg>
	</div>
  );
};

export default VoragoBoard;