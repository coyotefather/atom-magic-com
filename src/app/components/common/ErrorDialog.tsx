/**
 * ErrorDialog.tsx
 *
 * A modal dialog used to notify the user that a form action could not proceed
 * because required fields are incomplete. It is specifically designed for the
 * Character Manager wizard flow, where clicking "Continue" on an incomplete
 * section triggers this dialog instead of advancing.
 *
 * The dialog displays:
 *   - A heading (`title`) explaining the problem
 *   - A body message (`message`) with the name(s) of the missing field(s)
 *     highlighted in oxblood red (`incomplete` prop)
 *   - A dismissal button (`buttonText`) that closes the dialog
 *
 * Backed by a HeroUI Modal with a backdrop so the rest of the page is
 * obscured. Open/close state is controlled externally via `isOpen` and
 * `onOpenChange`.
 *
 * Props:
 *   - title: string          — modal heading (e.g. "Please complete the missing fields.")
 *   - message: string        — explanatory body text
 *   - buttonText: string     — label for the close button
 *   - incomplete: string     — name of the missing field(s), rendered in bold oxblood
 *   - isOpen: boolean        — whether the dialog is currently visible
 *   - onOpenChange: (isOpen: boolean) => void — called when the dialog should open or close
 *
 * Used by:
 *   - Section.tsx (character creation wizard) — shown when the user tries to
 *     advance past an incomplete step
 */

'use client';
import { Modal } from "@heroui/react";
import FunctionButton from '@/app/components/common/FunctionButton';
import { mdiCloseCircleOutline } from '@mdi/js';

const ErrorDialog = ({
		title,
		message,
		buttonText,
		incomplete,
		isOpen,
		onOpenChange
	}: {
	title: string,
	message: string,
	buttonText: string,
	incomplete: string,
	isOpen: boolean,
	onOpenChange: (isOpen: boolean) => void
}) => {

	return (
		<Modal.Backdrop isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
			<Modal.Container size="xs">
				<Modal.Dialog>
					<Modal.CloseTrigger />
					<Modal.Header>
						<Modal.Heading>{title}</Modal.Heading>
					</Modal.Header>
					<Modal.Body>
						<p>
							{message} <span className="text-oxblood font-semibold">{incomplete}</span>
						</p>
					</Modal.Body>
					<Modal.Footer>
						<FunctionButton
							onClick={() => onOpenChange(false)}
							icon={mdiCloseCircleOutline}
							variant="secondary"
						>
							{buttonText}
						</FunctionButton>
					</Modal.Footer>
				</Modal.Dialog>
			</Modal.Container>
		</Modal.Backdrop>
	);
};

export default ErrorDialog;
