/**
 * LoadingPage.tsx
 *
 * Animated loading overlay shown while the Character Manager's Redux state is
 * hydrating from localStorage. Displays an Atom Magic logo with a fade-in/out
 * transition — the "hello" state is visible until Redux `character.loaded` is
 * true, at which point it transitions to the "goodbye" (hidden) state.
 *
 * Uses `react-transition-group` SwitchTransition + CSSTransition for the swap
 * animation. The `loadedCheck` local state prevents a flash on first render by
 * waiting one tick after mount before reading the Redux loaded flag.
 *
 * Used by:
 *   - `src/app/(website)/character/page.tsx` (shown before CharacterManager mounts)
 *   - `src/app/(website)/generator/page.tsx`
 */
'use client';
import NextImage from "next/image";
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useAppSelector } from '@/lib/hooks'

export default function LoadingPage() {
	const loaded = useAppSelector(state => state.character.loaded);
	const [loadedCheck, setLoadedCheck] = useState(false);

	useEffect( () => {
		if(loadedCheck !== true) {
			setLoadedCheck(true);
		}
	},[loaded, loadedCheck] );

	const helloRef = useRef(null);
	const goodbyeRef = useRef(null);
	const nodeRef = loadedCheck ? goodbyeRef : helloRef;

	return (
		<SwitchTransition mode="out-in">
			<CSSTransition
				key={loadedCheck ? "x" : "y"}
				in={loadedCheck}
				nodeRef={nodeRef}
				timeout={500}
				classNames='loading'>
				<div className={clsx(
					"transition duration-700 ease-in",
					{'opacity-100': loadedCheck == false},
					{'opacity-0 hidden': loadedCheck == true},
				)} ref={nodeRef}>
					<div className="grow absolute w-full h-full z-50 bg-white opacity-90">
						<div className="w-[100px] h-[100px] justify-center mx-auto mt-16">
							<NextImage
								className="bg-white animate-spin rounded-full m-auto absolute top-0 bottom-0 right-0 left-0"
								width={100}
								height={100}
								src="/atom-magic-circle-black.png"
								alt="Atom Magic Loading" />
						</div>
					</div>
				</div>
			</CSSTransition>
		</SwitchTransition>
	);
}