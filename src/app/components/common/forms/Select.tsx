const Select = ({
		name,
		widthClass,
		required,
		options,
	}: {
		name: string,
		widthClass: string,
		required: boolean,
		options: {
			name: string,
			value: string
		}[]
	}) => {
	let requiredElement = (<></>);
	if(required) {
		requiredElement = (
			<p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
				This field is required.
			</p>
		);
	}
	return (
		<label className={`block ${widthClass}`}>
			<span className="block text-sm font-medium text-slate-700">{name}</span>
			<select name={name} className={`peer form-select ${widthClass} rounded-md border-2 focus:ring-gold focus:border-gold`}>
				{options.map((option) => (
					<option key={`${option.name}-${option.value}`} value={option.value}>{option.name}</option>
				))}
			</select>
			{requiredElement}
		</label>
	);
};

export default Select;