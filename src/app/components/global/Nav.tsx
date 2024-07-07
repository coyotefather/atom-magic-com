import Link from "next/link";

const Nav = ({...props}) => {
	return (
		<div {...props}>
		  <Link className="p-5" href="/">Home</Link>
		  <Link className="p-5" href="https://atom-magic.com/codex">Codex</Link>
		  <Link className="p-5" href="/character">Character Manager</Link>
		  <Link className="p-5" href="/vorago">Vorago</Link>
		</div>
	);
};

export default Nav;