'use client';
import { Slug } from "../../../../sanity.types";
import {Button} from "@nextui-org/react";
import Markdown from 'react-markdown'

export type EntryById = {
  title: string | null;
  entryBody: string | null;
  slug: Slug | null;
} | null;

const RandomEntry = ({
		entry
	}:{
		entry: EntryById
	}) => {

	const { title, entryBody, slug } = entry || {};

	let text = entryBody ? entryBody.substring(0, 300) : "not found";
	if(entryBody && entryBody.length > 300) {
		text += "...";
	}

	return (
		<div className="p-8 pr-48">
			<h2 className="marcellus text-3xl mb-4">Today&apos;s Codex Entry: {title ? title : "not found"}</h2>
			<div className="not-prose">
				<Markdown>
					{text}
				</Markdown>
			</div>
			<a className="block my-8" href={`/codex/entries/${slug?.current}`}>
				<Button
					className="bg-sunset-gradient font-extrabold uppercase tracking-widest p-2 pl-4 pr-4 border-black border-2"
				 	size="lg"
					radius="full"
					variant="bordered"
					isIconOnly={false}
					type="submit">
					Read More
				</Button>
			</a>
		</div>
	);
}

export default RandomEntry;