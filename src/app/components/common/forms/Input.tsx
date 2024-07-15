const Input = ({
		name,
		width = "auto",
		type = "text",
		required = false,
	}: {
		name: String,
		width: String,
		type: String,
		required: Boolean,
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
		<label className="block">
			<span className="block text-sm font-medium text-slate-700">{name}</span>
			<input type={type} name={name} className={`peer form-input w-${width} rounded-md border-2 focus:ring-gold focus:border-gold`}/>
			{requiredElement}
		</label>
	);
};

export default Input;