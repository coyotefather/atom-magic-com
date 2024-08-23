// ./src/components/Entries.tsx

import { ENTRIES_QUERYResult } from "../../../../sanity.types";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import {Card, CardHeader, CardBody} from "@nextui-org/card";
import Icon from '@mdi/react';
import { mdiFileDocument } from '@mdi/js';

const Entries = ({ entries }: { entries: ENTRIES_QUERYResult }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Entries</h3>
		<div className="flex flex-row gap-4">
			{entries.map((e) => (
					<Card shadow="sm" className="bg-sunset-gradient max-w-xs w-[300px] h-[300px]" key={e._id}>
						<CardHeader className="bg-black absolute z-10 top-0">
							<Icon
								className="text-gold align-center mr-2"
								path={mdiFileDocument}
								size={2} />
							<a
								href={`/codex/entries/${e?.slug?.current}`}
								className="text-gold hover:text-brightgold hover:font-bold"
								>
								{e?.title}
							</a>
						</CardHeader>
						{e.mainImage?.asset?._ref ? (
							<Image
								alt={e.mainImage?.alt || ""}
								className="z-0 w-full h-full object-cover object-top"
								src={urlFor(e.mainImage?.asset?._ref).quality(90).format('png').url()}
								width={300}
								height={300}
							  />
						) : <Image
							alt="Atom Magic Circle"
							className="z-0 w-full h-full object-cover object-top opacity-50"
							src="/atom-magic-circle-black.png"
							width={300}
							height={300}
						  /> }
					<CardBody className="bg-black text-white text-sm absolute z-10 bottom-0">
						{e.blurb ? <PortableText value={e.blurb} /> : null}
					</CardBody>
				</Card>
			))}
		</div>
	</section>
  );
}

export default Entries;