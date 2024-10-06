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