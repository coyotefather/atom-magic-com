import NextImage from "next/image";

export default function LoadingPage() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
		<div className="container">
			<div className="w-[100px] h-[100px] justify-center mx-auto mt-16">
				<NextImage
					className="bg-white animate-spin rounded-full m-auto absolute top-0 bottom-0 right-0 left-0"
					width={100}
					height={100}
					src="/atom-magic-circle-black.png"
					alt="Atom Magic Loading" />
			</div>
		</div>
	);
}