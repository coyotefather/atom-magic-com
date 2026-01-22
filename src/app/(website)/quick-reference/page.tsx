import { mdiBookOpenPageVariant } from '@mdi/js';
import QuickReference from '@/app/components/tools/QuickReference';
import PageHero from '@/app/components/common/PageHero';

export const metadata = {
	title: 'Quick Reference | Atom Magic',
	description: 'Essential rules at a glance. Combat flow, damage types, conditions, and commonly-needed mechanics for Atom Magic.',
};

export default function QuickReferencePage() {
	return (
		<main className="notoserif min-h-screen bg-parchment">
			<PageHero
				title="Quick Reference"
				description="Essential rules at a glance"
				icon={mdiBookOpenPageVariant}
				accentColor="gold"
				variant="inline"
			/>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="max-w-3xl">
					<QuickReference />
				</div>
			</div>
		</main>
	);
}
