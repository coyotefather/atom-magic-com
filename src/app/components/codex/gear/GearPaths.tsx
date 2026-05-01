/**
 * GearPaths.tsx
 *
 * Renders the character paths (Theurgist, Iconoclast, Autodidact) that a
 * legacy codex gear item is available to. Used by the legacy Gear.tsx component.
 *
 * Used by:
 *   - `src/app/components/codex/gear/Gear.tsx` (legacy gear codex page)
 */
const GearPaths = ({
		paths
	}:{
		paths: {
			_id: string,
			title: string | null,
		  }[] | null
	}) => {
	return (
		<div>
			{paths && paths.map( (p, index) => (
				<div className="capitalize" key={`p-${index}`}>
					{p.title}
				</div>
			))}
		</div>
	);
};

export default GearPaths;