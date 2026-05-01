/**
 * page.tsx — Dice Roller (/dice)
 *
 * Thin wrapper that renders the `<DiceRoller />` component. The dice roller
 * broadcasts results via `RollContext` so the Adventure Log can capture them.
 */
import DiceRoller from '@/app/components/dice/DiceRoller';

export const metadata = {
	title: 'Dice Roller | Atom Magic',
	description: 'Roll dice for your Atom Magic tabletop sessions. Supports d4, d6, d8, d10, d12, d20, and d100.',
};

export default function DicePage() {
	return (
		<main className="notoserif">
			<DiceRoller />
		</main>
	);
}
