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
