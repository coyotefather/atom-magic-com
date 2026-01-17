import Icon from '@mdi/react';
import { mdiBookOpenPageVariant } from '@mdi/js';
import QuickReference from '@/app/components/tools/QuickReference';

export const metadata = {
	title: 'Quick Reference | Atom Magic',
	description: 'Essential rules at a glance. Combat flow, damage types, conditions, and commonly-needed mechanics for Atom Magic.',
};

export default function QuickReferencePage() {
	return (
		<main className="notoserif min-h-screen bg-parchment">
			{/* Hero */}
			<section className="bg-black border-b-2 border-gold">
				<div className="container px-6 md:px-8 py-8 md:py-12">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 flex items-center justify-center border-2 border-gold">
							<Icon path={mdiBookOpenPageVariant} size={1.25} className="text-gold" />
						</div>
						<div>
							<h1 className="marcellus text-3xl md:text-4xl text-white">Quick Reference</h1>
							<p className="text-stone-light text-sm mt-1">Essential rules at a glance</p>
						</div>
					</div>
				</div>
			</section>

			<div className="container px-6 md:px-8 py-8 md:py-12">
				<div className="max-w-3xl">
					<QuickReference />
				</div>
			</div>
		</main>
	);
}
