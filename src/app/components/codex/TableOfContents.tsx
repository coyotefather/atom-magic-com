import { RichText } from '@/app/components/common/RichText';

const TableOfContents = ({
	toc
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toc: any | null | undefined
}) => {
	return (
		<div className="bg-black text-white w-full border-b-1 border-white">
			<div className="border-b-1 border-white w-full">
				Contents
			</div>
			<div className="text-white">
				<RichText content={toc} />
			</div>
		</div>
	);
}

export default TableOfContents;
