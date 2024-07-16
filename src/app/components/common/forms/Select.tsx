const Select = ({
		name,
		width,
		required,
		options,
	}: {
		name: String,
		width: String,
		required: Boolean,
		options: {
			name: String,
			value: String
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
		<label className={`block w-${width}`}>
			<span className="block text-sm font-medium text-slate-700">{name}</span>
			<select name={name} className={`peer form-select w-${width} rounded-md border-2 focus:ring-gold focus:border-gold`}>
				{options.map((option) => (
					<option key={`${option.name}-${option.value}`} value={option.value}>{option.name}</option>
				))}
			</select>
			{requiredElement}
		</label>
	);
};

export default Select;