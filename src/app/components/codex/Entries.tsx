// ./src/components/Entries.tsx

import { ENTRIES_QUERYResult } from "../../../../sanity.types";
import { PortableText } from "@portabletext/react";
import {Card, CardHeader, CardBody} from "@nextui-org/card";
import Icon from '@mdi/react';
import { mdiFileDocument } from '@mdi/js';

const Entries = ({ entries }: { entries: ENTRIES_QUERYResult }) => {
  return (
	<section className="container">
		<h3 className="marcellus text-2xl font-bold">Entries</h3>
		<div className="flex flex-row gap-4">
			{entries.map((e) => (
					<Card shadow="sm" className="bg-sunset-gradient max-w-xs w-[300px] h-[200px]" key={e._id}>
						<CardHeader className="bg-black">
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
					<CardBody className="bg-black text-white text-sm">
						{e.blurb ? <PortableText value={e.blurb} /> : null}
					</CardBody>
				</Card>
			))}
		</div>
	</section>
  );
}

export default Entries;