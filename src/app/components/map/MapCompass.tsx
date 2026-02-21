/** Compass rose + title block, fixed in the map's top-left corner. */
const MapCompass = () => {
	return (
		<div
			style={{
				position: 'absolute',
				top: '12px',
				left: '12px',
				zIndex: 1000,
				padding: '10px 12px',
				background: 'rgba(245, 240, 225, 0.85)',
				border: '1px solid rgba(107, 91, 62, 0.4)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '6px',
				pointerEvents: 'none',
				userSelect: 'none',
			}}
		>
			{/* 8-pointed compass star */}
			<svg width={48} height={48} viewBox="0 0 48 48" fill="none">
				{/* Cardinal points — N is taller/more prominent */}
				<polygon points="24,2 27,18 24,22 21,18" fill="#6B5B3E" />
				<polygon points="24,46 21,30 24,26 27,30" fill="#6B5B3E" opacity={0.6} />
				<polygon points="2,24 18,21 22,24 18,27" fill="#6B5B3E" opacity={0.6} />
				<polygon points="46,24 30,27 26,24 30,21" fill="#6B5B3E" opacity={0.6} />
				{/* Intercardinal points — smaller */}
				<polygon points="24,24 11,11 15,24" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 37,11 33,24" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 11,37 24,33" fill="#6B5B3E" opacity={0.35} />
				<polygon points="24,24 37,37 24,33" fill="#6B5B3E" opacity={0.35} />
				{/* N label above north point */}
				<text
					x={24}
					y={9}
					textAnchor="middle"
					fill="#6B5B3E"
					fontSize={7}
					fontFamily="Marcellus, Georgia, serif"
					fontWeight="bold"
				>
					N
				</text>
			</svg>
			{/* Map title */}
			<div
				style={{
					fontFamily: 'Marcellus, Georgia, serif',
					fontSize: '14px',
					letterSpacing: '0.2em',
					color: '#3A2E10',
					textTransform: 'uppercase',
					lineHeight: 1,
				}}
			>
				SOLUM
			</div>
			{/* Subtitle */}
			<div
				style={{
					fontFamily: 'Georgia, serif',
					fontSize: '9px',
					letterSpacing: '0.1em',
					color: '#6B5B3E',
					lineHeight: 1,
				}}
			>
				350 POST RUINAM
			</div>
		</div>
	);
};

export default MapCompass;
