import { notFound } from "next/navigation";

type QueryParams = Promise<{ slug: string }>

export default async function Page({ params }: { params: QueryParams }) {
	await params;
	// Legacy Sanity gear page — not in use
	return notFound();
}