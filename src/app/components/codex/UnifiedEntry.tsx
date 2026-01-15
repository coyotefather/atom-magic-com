'use client';
import Image from 'next/image';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkExtendedTable } from 'remark-extended-table';
import { remarkDefinitionList } from 'remark-definition-list';
import remarkHeadingId from 'remark-heading-id';
import { urlFor } from '@/sanity/lib/image';
import { UNIFIED_ENTRY_QUERY_RESULT } from '../../../../sanity.types';
import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import TableOfContents from '@/app/components/codex/TableOfContents';
import Icon from '@mdi/react';
import {
	mdiArrowLeft,
	mdiSword,
	mdiShield,
	mdiShieldOutline,
	mdiClockOutline,
	mdiHeart,
} from '@mdi/js';

// Helper to display score value or n/a if null/undefined
const displayScore = (value: number | null | undefined): string => {
	return value != null ? String(value) : 'n/a';
};

// Type guards for different document types
function isCreature(
	entry: UNIFIED_ENTRY_QUERY_RESULT
): entry is Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'creature' }> {
	return entry?._type === 'creature';
}

function isDiscipline(
	entry: UNIFIED_ENTRY_QUERY_RESULT
): entry is Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'discipline' }> {
	return entry?._type === 'discipline';
}

function isTechnique(
	entry: UNIFIED_ENTRY_QUERY_RESULT
): entry is Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'technique' }> {
	return entry?._type === 'technique';
}

function isPath(
	entry: UNIFIED_ENTRY_QUERY_RESULT
): entry is Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'path' }> {
	return entry?._type === 'path';
}

function isEntry(
	entry: UNIFIED_ENTRY_QUERY_RESULT
): entry is Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'entry' }> {
	return entry?._type === 'entry';
}

export function UnifiedEntry({
	entry,
}: {
	entry: UNIFIED_ENTRY_QUERY_RESULT;
}) {
	if (!entry) return null;

	const { title, mainImage, entryBody, toc, category } = entry;

	// Build breadcrumb trail
	let parents = [{ title: 'Home', url: '/' }];

	if (category) {
		if (category.parent) {
			if (category.parent.parent) {
				if (category.parent.parent.parent) {
					parents.push({
						title: '' + category.parent.parent.parent.title,
						url:
							'/codex/categories/' +
							category.parent.parent.parent?.slug?.current,
					});
				}
				parents.push({
					title: '' + category.parent.parent.title,
					url: '/codex/categories/' + category.parent.parent?.slug?.current,
				});
			}
			parents.push({
				title: '' + category.parent.title,
				url: '/codex/categories/' + category.parent?.slug?.current,
			});
		}
		parents.push({
			title: '' + category.title,
			url: '/codex/categories/' + category?.slug?.current,
		});
	}

	return (
		<article className="notoserif bg-white">
			{/* Breadcrumb bar */}
			<div className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-4">
					<Breadcrumbs currentPage={title ?? ''} parents={parents} />
				</div>
			</div>

			{/* Main content area */}
			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Sidebar */}
					<aside className="md:order-first order-last">
						<div className="border-2 border-stone bg-parchment sticky top-4">
							{/* Gold accent line */}
							<div className="h-1 bg-gold" />

							{/* Image */}
							{mainImage?.asset && (
								<div className="border-b-2 border-stone">
									<Image
										className="w-full h-48 object-cover"
										src={urlFor(mainImage).width(400).height(300).url()}
										width={400}
										height={300}
										alt={mainImage.alt || title || ''}
									/>
								</div>
							)}

							{/* Content */}
							<div className="p-4">
								{/* Table of Contents */}
								{toc && (
									<div className="mb-4">
										<TableOfContents toc={toc} />
									</div>
								)}

								{/* Type-specific sidebar content */}
								{isCreature(entry) && <CreatureSidebar entry={entry} />}
								{isDiscipline(entry) && <DisciplineSidebar entry={entry} />}
								{isTechnique(entry) && <TechniqueSidebar entry={entry} />}
								{isPath(entry) && <PathSidebar entry={entry} />}
								{isEntry(entry) && <EntrySidebar entry={entry} />}
							</div>
						</div>
					</aside>

					{/* Main content */}
					<section className="md:col-span-2">
						<h1 className="marcellus text-3xl md:text-4xl text-black mb-6 pb-4 border-b-2 border-gold">
							{title}
						</h1>

						{/* Type-specific header content */}
						{isCreature(entry) && <CreatureHeader entry={entry} />}
						{isDiscipline(entry) && <DisciplineHeader entry={entry} />}
						{isTechnique(entry) && <TechniqueHeader entry={entry} />}
						{isPath(entry) && <PathHeader entry={entry} />}

						{/* Main body content */}
						{entryBody && (
							<div className="prose prose-stone prose-lg max-w-none first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:marcellus">
								<Markdown
									remarkPlugins={[
										remarkGfm,
										remarkExtendedTable,
										remarkDefinitionList,
										[remarkHeadingId, { defaults: true, uniqueDefaults: true }],
									]}
								>
									{entryBody}
								</Markdown>
							</div>
						)}
					</section>
				</div>
			</div>

			{/* Footer */}
			<section className="bg-parchment border-t-2 border-stone">
				<div className="container px-6 md:px-8 py-6">
					<Link
						href="/codex"
						className="inline-flex items-center gap-2 text-stone hover:text-gold transition-colors no-underline"
					>
						<Icon path={mdiArrowLeft} size={0.875} />
						<span className="marcellus uppercase tracking-wider text-sm">
							Return to Codex
						</span>
					</Link>
				</div>
			</section>
		</article>
	);
}

// Creature-specific components
function CreatureSidebar({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'creature' }>;
}) {
	const challengeLevelColors: Record<string, string> = {
		trivial: 'text-stone',
		easy: 'text-laurel',
		moderate: 'text-gold',
		hard: 'text-bronze',
		deadly: 'text-oxblood',
	};

	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Stats */}
			<div className="grid grid-cols-2 gap-2 py-2">
				<div className="text-center p-2 bg-white border border-stone/30">
					<dt className="text-xs text-stone uppercase tracking-wider">PHY</dt>
					<dd className="marcellus text-lg text-black">
						{displayScore(entry.physical)}
					</dd>
				</div>
				<div className="text-center p-2 bg-white border border-stone/30">
					<dt className="text-xs text-stone uppercase tracking-wider">INT</dt>
					<dd className="marcellus text-lg text-black">
						{displayScore(entry.interpersonal)}
					</dd>
				</div>
				<div className="text-center p-2 bg-white border border-stone/30">
					<dt className="text-xs text-stone uppercase tracking-wider">ITE</dt>
					<dd className="marcellus text-lg text-black">
						{displayScore(entry.intellect)}
					</dd>
				</div>
				<div className="text-center p-2 bg-white border border-stone/30">
					<dt className="text-xs text-stone uppercase tracking-wider">PSY</dt>
					<dd className="marcellus text-lg text-black">
						{displayScore(entry.psyche)}
					</dd>
				</div>
			</div>

			{/* Combat stats */}
			<div className="flex flex-col py-2">
				<dt className="text-stone text-xs uppercase tracking-wider mb-1">
					Combat
				</dt>
				<dd className="flex flex-wrap gap-3 text-black">
					{entry.health != null && (
						<span className="flex items-center gap-1">
							<Icon path={mdiHeart} size={0.5} className="text-oxblood" />
							{entry.health}
						</span>
					)}
					{entry.physicalShield != null && entry.physicalShield > 0 && (
						<span className="flex items-center gap-1">
							<Icon path={mdiShield} size={0.5} className="text-stone" />
							{entry.physicalShield}
						</span>
					)}
					{entry.psychicShield != null && entry.psychicShield > 0 && (
						<span className="flex items-center gap-1">
							<Icon path={mdiShieldOutline} size={0.5} className="text-laurel" />
							{entry.psychicShield}
						</span>
					)}
				</dd>
			</div>

			{/* Attacks */}
			{entry.attacks && entry.attacks.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Attacks
					</dt>
					<dd className="space-y-1">
						{entry.attacks.map((attack) => (
							<div key={attack._key} className="flex items-center gap-2 text-black">
								<Icon path={mdiSword} size={0.5} className="text-bronze" />
								<span className="font-semibold">{attack.name}</span>
								{attack.damage && (
									<span className="text-stone">({attack.damage})</span>
								)}
							</div>
						))}
					</dd>
				</div>
			)}

			{/* Challenge Level */}
			{entry.challengeLevel && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Challenge Level
					</dt>
					<dd
						className={`capitalize ${challengeLevelColors[entry.challengeLevel]}`}
					>
						{entry.challengeLevel}
					</dd>
				</div>
			)}

			{/* Type */}
			{entry.creatureType && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Type
					</dt>
					<dd className="text-black">{entry.creatureType}</dd>
				</div>
			)}

			{/* Environments */}
			{entry.environments && entry.environments.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Environments
					</dt>
					<dd className="flex flex-wrap gap-1">
						{entry.environments.map((env, idx) => (
							<span key={idx} className="px-2 py-0.5 text-xs bg-stone/10">
								{env}
							</span>
						))}
					</dd>
				</div>
			)}
		</dl>
	);
}

function CreatureHeader({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'creature' }>;
}) {
	if (
		!entry.specialAbilities ||
		entry.specialAbilities.length === 0
	)
		return null;

	return (
		<div className="mb-8 p-4 bg-parchment border-2 border-stone">
			<h2 className="marcellus text-lg text-black mb-3">Special Abilities</h2>
			<div className="space-y-2">
				{entry.specialAbilities.map((ability) => (
					<div
						key={ability._key}
						className="text-sm bg-white p-3 border-l-2 border-bronze"
					>
						<span className="font-semibold">{ability.name}</span>
						{ability.description && (
							<span className="text-stone"> — {ability.description}</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

// Discipline-specific components
function DisciplineSidebar({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'discipline' }>;
}) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Paths */}
			{entry.paths && entry.paths.length > 0 && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Available to
					</dt>
					<dd className="text-black">
						{entry.paths.map((p) => p.title).join(', ')}
					</dd>
				</div>
			)}

			{/* Technique count */}
			{entry.techniques && entry.techniques.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Techniques
					</dt>
					<dd className="text-black">{entry.techniques.length}</dd>
				</div>
			)}
		</dl>
	);
}

function DisciplineHeader({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'discipline' }>;
}) {
	if (!entry.techniques || entry.techniques.length === 0) return null;

	return (
		<div className="mb-8 p-4 bg-parchment border-2 border-stone">
			<h2 className="marcellus text-lg text-black mb-3">Techniques</h2>
			<div className="space-y-2">
				{entry.techniques.map((tech) => (
					<Link
						key={tech._id}
						href={tech.slug ? `/codex/entries/${tech.slug.current}` : '#'}
						className="block text-sm bg-white p-3 border-l-2 border-laurel hover:border-gold transition-colors no-underline"
					>
						<span className="font-semibold text-black">{tech.title}</span>
						{tech.latin && (
							<span className="text-stone italic ml-2">({tech.latin})</span>
						)}
						{tech.cooldown && (
							<span className="text-stone ml-2 flex items-center gap-1 inline-flex">
								<Icon path={mdiClockOutline} size={0.5} />
								{tech.cooldown} rounds
							</span>
						)}
					</Link>
				))}
			</div>
		</div>
	);
}

// Technique-specific components
function TechniqueSidebar({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'technique' }>;
}) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Latin name */}
			{entry.latin && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Latin
					</dt>
					<dd className="text-black italic">{entry.latin}</dd>
				</div>
			)}

			{/* Cooldown */}
			{entry.cooldown && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Cooldown
					</dt>
					<dd className="text-black flex items-center gap-1">
						<Icon path={mdiClockOutline} size={0.5} />
						{entry.cooldown} rounds
					</dd>
				</div>
			)}
		</dl>
	);
}

function TechniqueHeader({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'technique' }>;
}) {
	// Techniques don't have special header content beyond the sidebar
	return null;
}

// Path-specific components
function PathSidebar({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'path' }>;
}) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Latin name */}
			{entry.latin && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Latin
					</dt>
					<dd className="text-black italic">{entry.latin}</dd>
				</div>
			)}

			{/* Modifiers */}
			{entry.modifiers && entry.modifiers.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Score Modifiers
					</dt>
					<dd className="space-y-1">
						{entry.modifiers.map((mod, idx) => (
							<div key={idx} className="text-black">
								{mod.modifierSubscore?.title}:{' '}
								<span
									className={
										(mod.modifierValue || 0) > 0 ? 'text-laurel' : 'text-oxblood'
									}
								>
									{(mod.modifierValue || 0) > 0 ? '+' : ''}
									{mod.modifierValue}
								</span>
							</div>
						))}
					</dd>
				</div>
			)}
		</dl>
	);
}

function PathHeader({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'path' }>;
}) {
	// Paths don't have special header content beyond the sidebar
	return null;
}

// Entry-specific components (regular entries)
function EntrySidebar({
	entry,
}: {
	entry: Extract<UNIFIED_ENTRY_QUERY_RESULT, { _type: 'entry' }>;
}) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Card details */}
			{entry.cardDetails?.map((d, index) => (
				<div key={`${d.detailName}-${index}`} className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						{d.detailName}
					</dt>
					<dd className="text-black">{d.detailDescription}</dd>
				</div>
			))}

			{/* Author */}
			<div className="flex flex-col py-2">
				<dt className="text-stone text-xs uppercase tracking-wider mb-1">
					Author
				</dt>
				<dd className="text-black">
					{entry.author?.name ?? 'An unknown scribe'}
				</dd>
			</div>

			{/* Published date */}
			<div className="flex flex-col py-2">
				<dt className="text-stone text-xs uppercase tracking-wider mb-1">
					Last Updated
				</dt>
				<dd className="text-black">
					{entry.publishedAt
						? new Date(entry.publishedAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})
						: 'Date unknown'}
				</dd>
			</div>
		</dl>
	);
}
