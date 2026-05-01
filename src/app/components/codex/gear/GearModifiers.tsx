/**
 * GearModifiers.tsx
 *
 * Renders the subscore modifiers for a legacy codex gear item — e.g.,
 * "+5 Agility", "+10 Reflex". Used by the legacy Gear.tsx codex component.
 *
 * Each modifier has a subscore reference (with parent score) and a numeric
 * value. Positive values display as "+N", negative as "-N".
 *
 * Used by:
 *   - `src/app/components/codex/gear/Gear.tsx` (legacy gear codex page)
 */
const GearModifiers = ({
		modifiers
	}:{
		modifiers: Array<{
			modifierSubscore: {
			  _id: string;
			  title: string | null;
			  score: {
				_id: string;
				title: string | null;
			  } | null;
			} | null;
			modifierValue: number | null;
		  }> | null
	}) => {

	return (
		<div>
			{modifiers && modifiers.map( (m, index) => (
				<div key={`m-${index}`}>
					{m.modifierSubscore && m.modifierSubscore.title ? m.modifierSubscore.title : "Modifier"}&nbsp;
					{m.modifierValue && m.modifierValue > 0 ? "+" : ""}
					{m.modifierValue ? m.modifierValue : 0}</div>
			))}
		</div>
	);
};

export default GearModifiers;