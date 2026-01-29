'use client';
import { useState } from 'react';
import Icon from '@mdi/react';
import { mdiContentCopy, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import FunctionButton from '@/app/components/common/FunctionButton';
import { Session, generateSessionSummary, countKeyEvents } from '@/lib/adventure-log-data';
import { copyToClipboard } from '@/lib/sessionPersistence';

interface SessionExportProps {
	session: Session;
}

const SessionExport = ({ session }: SessionExportProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);

	const keyEventCount = countKeyEvents(session.entries);
	const summary = generateSessionSummary(session);

	const handleCopy = async () => {
		const success = await copyToClipboard(summary);
		if (success) {
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		}
	};

	return (
		<div className="bg-black text-white">
			{/* Header */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
			>
				<div className="flex items-center gap-3">
					<span className="marcellus text-lg">Session Export</span>
					<span className="text-xs text-stone-light">
						{keyEventCount} key event{keyEventCount !== 1 ? 's' : ''}
					</span>
				</div>
				<Icon
					path={isExpanded ? mdiChevronUp : mdiChevronDown}
					size={1}
					className="text-stone-light"
				/>
			</button>

			{/* Expanded content */}
			{isExpanded && (
				<div className="px-4 pb-4">
					{keyEventCount === 0 ? (
						<p className="text-sm text-stone-light py-4">
							Mark entries as key events (star icon) to include them in the export.
						</p>
					) : (
						<>
							{/* Preview */}
							<div className="bg-white/5 p-4 mb-4 max-h-60 overflow-y-auto">
								<pre className="text-sm text-stone-light whitespace-pre-wrap font-mono">
									{summary}
								</pre>
							</div>

							{/* Copy button */}
							<FunctionButton
								variant="primary"
								fullWidth
								onClick={handleCopy}
								icon={mdiContentCopy}
								className="bg-bronze hover:bg-gold"
							>
								{copySuccess ? 'Copied!' : 'Copy to Clipboard'}
							</FunctionButton>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default SessionExport;
