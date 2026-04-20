import Image from 'next/image';
import Link from 'next/link';
import { RichText } from '@/app/components/common/RichText';
import type { Entry, Creature, Discipline, Technique, Path, Category, Media } from '../../../../payload-types';
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

type EntryCollectionType = 'entries' | 'creatures' | 'disciplines' | 'techniques' | 'paths';
type UnifiedDoc = Entry | Creature | Discipline | Technique | Path;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMainImage(doc: UnifiedDoc): Media | null {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const img = (doc as any).mainImage;
	if (img && typeof img === 'object' && 'url' in img) return img as Media;
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCategory(doc: UnifiedDoc): Category | null {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const cat = (doc as any).category;
	if (cat && typeof cat === 'object' && 'slug' in cat) return cat as Category;
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCategoryAncestors(cat: Category): Array<{ title: string; url: string }> {
	const parents: Array<{ title: string; url: string }> = [];
	const walk = (c: Category) => {
		if (c.parent && typeof c.parent === 'object' && 'slug' in c.parent) {
			walk(c.parent as Category);
		}
		parents.push({ title: c.title, url: `/codex/categories/${c.slug}` });
	};
	if (cat.parent && typeof cat.parent === 'object' && 'slug' in cat.parent) {
		walk(cat.parent as Category);
	}
	parents.push({ title: cat.title, url: `/codex/categories/${cat.slug}` });
	return parents;
}

export function UnifiedEntry({
	entry,
	entryType,
}: {
	entry: UnifiedDoc;
	entryType: EntryCollectionType;
}) {
	if (!entry) return null;

	// Get display title (Creature uses 'name', others use 'title')
	const displayTitle = entryType === 'creatures'
		? (entry as Creature).name
		: (entry as Entry | Path | Discipline | Technique).title;

	const mainImage = getMainImage(entry);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const entryBody = (entry as any).entryBody ?? null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const toc = (entry as any).toc ?? null;
	const category = getCategory(entry);

	// Build breadcrumb trail
	const parents = [{ title: 'Home', url: '/' }];
	if (category) {
		parents.push(...getCategoryAncestors(category));
	}

	return (
		<article className="notoserif bg-white">
			{/* Breadcrumb bar */}
			<div className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-4">
					<Breadcrumbs currentPage={displayTitle ?? ''} parents={parents} />
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
							{mainImage?.url && (
								<div className="border-b-2 border-stone">
									<Image
										className="w-full h-48 object-cover"
										src={mainImage.url}
										width={400}
										height={300}
										alt={mainImage.alt || displayTitle || ''}
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
								{entryType === 'creatures' && <CreatureSidebar entry={entry as Creature} />}
								{entryType === 'disciplines' && <DisciplineSidebar entry={entry as Discipline} />}
								{entryType === 'techniques' && <TechniqueSidebar entry={entry as Technique} />}
								{entryType === 'paths' && <PathSidebar entry={entry as Path} />}
								{entryType === 'entries' && <EntrySidebar entry={entry as Entry} />}
							</div>
						</div>
					</aside>

					{/* Main content */}
					<section className="md:col-span-2">
						<h1 className="marcellus text-3xl md:text-4xl text-black mb-6 pb-4 border-b-2 border-gold">
							{displayTitle}
						</h1>

						{/* Type-specific header content */}
						{entryType === 'creatures' && <CreatureHeader entry={entry as Creature} />}
						{entryType === 'disciplines' && <DisciplineHeader entry={entry as Discipline} />}
						{entryType === 'techniques' && <TechniqueHeader />}
						{entryType === 'paths' && <PathHeader />}

						{/* Main body content */}
						{entryBody && (
							<div className="prose prose-stone prose-lg max-w-none first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:marcellus">
								<RichText content={entryBody} />
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
function CreatureSidebar({ entry }: { entry: Creature }) {
	const challengeLevelColors: Record<string, string> = {
		harmless: 'text-stone-dark',
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
						{entry.attacks.map((attack, idx) => (
							<div key={attack.id ?? idx} className="flex items-center gap-2 text-black">
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
							<span key={env.id ?? idx} className="px-2 py-0.5 text-xs bg-stone/10">
								{env.environment}
							</span>
						))}
					</dd>
				</div>
			)}
		</dl>
	);
}

function CreatureHeader({ entry }: { entry: Creature }) {
	if (!entry.specialAbilities || entry.specialAbilities.length === 0) return null;

	return (
		<div className="mb-8 p-4 bg-parchment border-2 border-stone">
			<h2 className="marcellus text-lg text-black mb-3">Special Abilities</h2>
			<div className="space-y-2">
				{entry.specialAbilities.map((ability, idx) => (
					<div
						key={ability.id ?? idx}
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
function DisciplineSidebar({ entry }: { entry: Discipline }) {
	const paths = (entry.paths ?? []).filter((p): p is Path => typeof p === 'object');
	const techniques = (entry.techniques ?? []).filter((t): t is Technique => typeof t === 'object');

	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{/* Paths */}
			{paths.length > 0 && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Available to
					</dt>
					<dd className="text-black">
						{paths.map((p) => p.title).join(', ')}
					</dd>
				</div>
			)}

			{/* Technique count */}
			{techniques.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Techniques
					</dt>
					<dd className="text-black">{techniques.length}</dd>
				</div>
			)}
		</dl>
	);
}

function DisciplineHeader({ entry }: { entry: Discipline }) {
	const techniques = (entry.techniques ?? []).filter((t): t is Technique => typeof t === 'object');
	if (techniques.length === 0) return null;

	return (
		<div className="mb-8 p-4 bg-parchment border-2 border-stone">
			<h2 className="marcellus text-lg text-black mb-3">Techniques</h2>
			<div className="space-y-2">
				{techniques.map((tech) => (
					<Link
						key={tech.id}
						href={tech.slug ? `/codex/entries/${tech.slug}` : '#'}
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
function TechniqueSidebar({ entry }: { entry: Technique }) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{entry.latin && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Latin
					</dt>
					<dd className="text-black italic">{entry.latin}</dd>
				</div>
			)}
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

function TechniqueHeader() {
	return null;
}

// Path-specific components
function PathSidebar({ entry }: { entry: Path }) {
	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{entry.latin && (
				<div className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Latin
					</dt>
					<dd className="text-black italic">{entry.latin}</dd>
				</div>
			)}
			{entry.modifiers && entry.modifiers.length > 0 && (
				<div className="flex flex-col py-2">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						Score Modifiers
					</dt>
					<dd className="space-y-1">
						{entry.modifiers.map((mod, idx) => {
							const sub = typeof mod.modifierSubscore === 'object' ? mod.modifierSubscore : null;
							return (
								<div key={idx} className="text-black">
									{sub?.title}:{' '}
									<span className={(mod.modifierValue || 0) > 0 ? 'text-laurel' : 'text-oxblood'}>
										{(mod.modifierValue || 0) > 0 ? '+' : ''}
										{mod.modifierValue}
									</span>
								</div>
							);
						})}
					</dd>
				</div>
			)}
		</dl>
	);
}

function PathHeader() {
	return null;
}

// Entry-specific components (regular codex entries)
function EntrySidebar({ entry }: { entry: Entry }) {
	const author = typeof entry.author === 'object' ? entry.author : null;

	return (
		<dl className="divide-y divide-stone/30 text-sm">
			{entry.cardDetails?.map((d, index) => (
				<div key={`${d.detailName}-${index}`} className="flex flex-col py-2 first:pt-0">
					<dt className="text-stone text-xs uppercase tracking-wider mb-1">
						{d.detailName}
					</dt>
					<dd className="text-black">{d.detailDescription}</dd>
				</div>
			))}

			<div className="flex flex-col py-2">
				<dt className="text-stone text-xs uppercase tracking-wider mb-1">
					Author
				</dt>
				<dd className="text-black">
					{author?.name ?? 'An unknown scribe'}
				</dd>
			</div>

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
