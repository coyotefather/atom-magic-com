import {Card, CardHeader, CardFooter} from "@heroui/card";
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
				"w-full notoserif",
				{'sunset-gradient': background === 0 && type !== 'category'},
				{'bg-pale-blue': background === 1 && type !== 'category'},
				{'bg-adobe': background === 2 && type !== 'category'},
				{'bg-olive-green': background === 3 && type !== 'category'},
				{'bg-dark-olive-green': background === 4 && type !== 'category'},
				{'bg-goldenrod': background === 5 && type !== 'category'},
				{'bg-sunset-blue': background === 6 && type !== 'category'},
				{'bg-sunset-red': background === 7 && type !== 'category'},
				{'bg-gold': background === 8 && type !== 'category'},
				{'bg-brightgold': background === 9 && type !== 'category'},
				{'sunset-gradient': type === 'category'},
				{'h-[300px]': showImage},
				{'h-[200px]': !showImage},
			)}>
				<CardHeader
					className="bg-black items-start absolute z-10 top-0 border-b-2 border-gold">
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
							{'hidden': !showImage}
						)}
						src={imgSrc}
						width={150}
						height={150}
						alt=""
					/>
				<CardFooter
					className="bg-black not-prose font-normal text-white text-md flex-col items-start! absolute z-10 bottom-0 min-h-28">
					{description}
				</CardFooter>
			</Card>
		</a>
	);
};

export default CustomCard;