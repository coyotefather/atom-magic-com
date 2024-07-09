import Link from 'next/link';

const Button = ({href, variant, text}) => {
	let buttonColor = "bg-gold hover:bg-brightgold";
	if(variant == "secondary") { buttonColor = "bg-black hover:bg-brightgold text-white" }
	return (
		<Link href={href}>
		  <button
			className={`${buttonColor} bg-gold hover:bg-brightgold p-2 rounded-md`}>
			{text}</button>
		</Link>
	);
};

export default Button;