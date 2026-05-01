/**
 * ErrorBoundary.tsx
 *
 * A React class-based error boundary that catches unhandled JavaScript errors
 * thrown during rendering in its child subtree. Without a boundary like this,
 * a single render-time error would unmount the entire React tree and show a
 * blank page.
 *
 * When an error is caught the boundary either:
 *   1. Renders the `fallback` prop (if provided) — allows callers to show a
 *      custom recovery UI.
 *   2. Falls back to a built-in error card (styled with the project's stone/
 *      oxblood palette) that shows the error message in a collapsible
 *      <details> element and offers two actions:
 *        - "Try Again" — resets the error state so React re-renders the children
 *        - "Refresh Page" — reloads the browser tab
 *
 * The caught error is also logged to `console.error` for server/browser
 * monitoring tools to capture.
 *
 * Props:
 *   - children: ReactNode   — the component subtree to protect
 *   - fallback?: ReactNode  — optional custom UI to display instead of the
 *                             default error card
 *
 * Used by:
 *   - Feature sections (Character Manager, Vorago, Creature Manager) as a
 *     safety net around complex interactive UIs
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-[50vh] flex items-center justify-center p-8">
					<div className="max-w-md w-full border-2 border-stone bg-white p-8">
						<h2 className="font-marcellus text-2xl text-oxblood mb-4">
							Something went wrong
						</h2>
						<p className="font-notoserif text-stone mb-6">
							An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
						</p>
						{this.state.error && (
							<details className="mb-6">
								<summary className="cursor-pointer text-sm text-stone hover:text-oxblood">
									Error details
								</summary>
								<pre className="mt-2 p-4 bg-parchment text-xs overflow-auto max-h-32">
									{this.state.error.message}
								</pre>
							</details>
						)}
						<div className="flex gap-4">
							<button
								onClick={this.handleReset}
								className="px-4 py-2 bg-gold text-white font-marcellus hover:bg-bronze transition-colors"
							>
								Try Again
							</button>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 border-2 border-stone text-stone font-marcellus hover:border-oxblood hover:text-oxblood transition-colors"
							>
								Refresh Page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
