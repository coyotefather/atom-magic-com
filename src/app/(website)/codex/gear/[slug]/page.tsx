/**
 * page.tsx — Legacy Gear Codex (/codex/gear/[slug])
 *
 * Legacy route from the Sanity CMS era. Always returns 404. Safe to delete
 * when the route is formally removed — no real content is served here.
 */
import { notFound } from "next/navigation";

type QueryParams = Promise<{ slug: string }>

export default async function Page({ params }: { params: QueryParams }) {
	await params;
	// Legacy Sanity gear page — not in use
	return notFound();
}