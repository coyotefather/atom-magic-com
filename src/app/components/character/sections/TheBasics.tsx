const TheBasics = () => {
	return (
		<div>
			<p>
				Enter and choose some basic information about your character. Note that none of the choices here affect scores. These are purely for roleplaying purposes.
			</p>
			<p>
				  For more information on cultures, see <a href="https://atom-magic.com/codex/cultures" title="Cultures on Solum">Cultures on Solum</a>.
			</p>
			<div className="flex justify-between mt-4">
				<label className="block">
					<span className="block text-sm font-medium text-slate-700">Name</span>
					<input type="text" name="Name" className="peer form-input w-96 rounded-md border-2 focus:ring-gold focus:border-gold"/>
					<p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
						Please enter a name.
					</p>
				</label>
				<label className="block">
					<span className="block text-sm font-medium text-slate-700">Age</span>
					<input type="number" name="Age" className="peer form-input rounded-md border-2 focus:ring-gold focus:border-gold"/>
					<p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
						Please enter an age.
					</p>
				</label>
				<label className="block">
					<span className="block text-sm font-medium text-slate-700">Pronouns</span>
					<input type="text" name="Pronouns" className="form-input w-80 rounded-md border-2 focus:ring-gold focus:border-gold"/>
				</label>
			</div>
		</div>
	);
};

export default TheBasics;