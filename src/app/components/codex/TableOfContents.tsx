import Markdown from 'react-markdown'

const TableOfContents = ({
	toc
}: {
	toc: string | null | undefined
}) => {
	return (
		<div className="bg-black text-white w-full border-b-1 border-white">
			<div className="border-b-1 border-white w-full">
				Contents
			</div>
			<div className="text-white">
				<Markdown>
					{toc}
				</Markdown>
			</div>
		</div>
	);
}

export default TableOfContents;