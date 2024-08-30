import {Card, CardHeader, CardFooter} from "@nextui-org/card";
import Icon from '@mdi/react';
import { mdiFileDocument, mdiFolderText } from '@mdi/js';
import Image from "next/image";
import clsx from 'clsx';

const CustomCard = ({
		type,
		title,
		description,
		url,
		imagePath,
		showImage,
	}: {
		type: string,
		title: string,
		description: string,
		url: string,
		imagePath: string,
		showImage: boolean
	}) => {

	let imgSrc = imagePath ? imagePath : "/atom-magic-circle-black.png";
	let iconPath = type === "category" ? mdiFolderText : mdiFileDocument;
	let iconSize = type === "category" ? 2 : 1;
	let background = Math.floor(Math.random() * 10);

	return (
		<a
		href={url}
		className="transition duration-200 ease-in hover:brightness-125 hover:drop-shadow-lg block w-full no-underline hover:no-underline"
		>
			<Card shadow="sm" className={clsx(
				"w-full",
				{'bg-sunset-gradient': background === 0 && showImage},
				{'bg-pale-blue': background === 1 && showImage},
				{'bg-adobe': background === 2 && showImage},
				{'bg-olive-green': background === 3 && showImage},
				{'bg-dark-olive-green': background === 4 && showImage},
				{'bg-goldenrod': background === 5 && showImage},
				{'bg-sunset-blue': background === 6 && showImage},
				{'bg-sunset-red': background === 7 && showImage},
				{'bg-gold': background === 8 && showImage},
				{'bg-brightgold': background === 9 && showImage},
				{'h-[300px]': showImage},
				{'h-[200px] bg-sunset-gradient': !showImage},
			)}>
				<CardHeader
					className={clsx(
						"bg-black items-start absolute z-10 top-0"
					)}>
						<h2 className={clsx(
							"marcellus mt-0 mb-0 w-full flex flex-row items-center justify-start text-gold no-underline hover:no-underline",
							{'text-3xl': type === 'category'},
							{'text-xl': type !== 'category'},
						)}>
								<Icon
									className="text-gold align-center mr-2"
									path={iconPath}
									size={iconSize} />
								{title}
						</h2>
				</CardHeader>
					<Image
						className={clsx(
							"z-0 w-full h-full object-cover",
							{'opacity-50 m-auto blur-md': !imagePath},
							{'hidden': !showImage}
						)}
						src={imgSrc}
						width={150}
						height={150}
						alt=""
					/>
				<CardFooter
					className="bg-black text-white text-md flex-col !items-start absolute z-10 bottom-0 min-h-28">
					{description}
				</CardFooter>
			</Card>
		</a>
	);
};

export default CustomCard;