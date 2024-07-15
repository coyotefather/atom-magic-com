const TheBasics = () => {
	return (
		<div>
			<p>
				Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
			</p>
			<p>
				  For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
			</p>
			<div className="flex">
				<label className="block">
					<span className="block text-sm font-medium text-slate-700">Name</span>
					<input type="text" name="First Name" className="peer form-input rounded-md text-red-500 border-2 focus:ring-gold focus:border-gold"/>
					<p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
						Please enter a name.
					</p>
				</label>
			</div>
		</div>
	);
};

export default TheBasics;