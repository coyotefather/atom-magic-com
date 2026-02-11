'use client';

import { MAP_REGIONS, BIOME_LEGEND, REGION_BIOMES } from '@/lib/map-data';
import FunctionButton from '@/app/components/common/FunctionButton';
import LinkButton from '@/app/components/common/LinkButton';
import { mdiClose, mdiForest } from '@mdi/js';
import Icon from '@mdi/react';

interface RegionFocusPanelProps {
	regionId: string;
	onClose: () => void;
}

const regionLookup = new Map(MAP_REGIONS.map((r) => [r.id, r]));
const biomeLookup = new Map(REGION_BIOMES.map((b) => [b.regionId, b]));

const RegionFocusPanel = ({ regionId, onClose }: RegionFocusPanelProps) => {
	const region = regionLookup.get(regionId);
	const biomeData = biomeLookup.get(regionId);

	if (!region) return null;

	return (
		<div className="solum-focus-panel absolute top-4 right-4 z-[1000] w-full max-w-72 bg-white border-2 border-stone shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b-2 border-stone/30">
				<h3 className="marcellus text-lg font-semibold text-black">{region.name}</h3>
				<FunctionButton
					variant="ghost"
					icon={mdiClose}
					onClick={onClose}
					isIconOnly
					size="sm"
				/>
			</div>

			{/* Biome breakdown */}
			{biomeData && biomeData.biomes.length > 0 && (
				<div className="p-4 border-b-2 border-stone/30">
					<div className="flex items-center gap-1.5 mb-3">
						<Icon path={mdiForest} size={0.625} className="text-laurel" />
						<span className="marcellus text-xs uppercase tracking-wider text-stone-dark font-semibold">
							Biome Composition
						</span>
					</div>
					<div className="space-y-2">
						{biomeData.biomes.map((b) => {
							const biome = BIOME_LEGEND.find((bl) => bl.id === b.biomeId);
							if (!biome) return null;
							return (
								<div key={b.biomeId} className="flex items-center gap-2">
									<div
										className="w-3 h-3 flex-shrink-0 border border-stone/30"
										style={{ backgroundColor: biome.color }}
									/>
									<span className="notoserif text-sm text-black flex-1">{biome.name}</span>
									<span className="notoserif text-sm text-stone-dark">{b.percentage}%</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="p-4 flex flex-col gap-2">
				{region.codexSlug && (
					<LinkButton href={`/codex/entries/${region.codexSlug}`} variant="secondary">
						View in Codex
					</LinkButton>
				)}
			</div>
		</div>
	);
};

export default RegionFocusPanel;
