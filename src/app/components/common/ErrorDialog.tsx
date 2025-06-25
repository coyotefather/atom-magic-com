import {  Modal,   ModalContent,   ModalHeader,   ModalBody,   ModalFooter} from "@heroui/react";
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
		<>
			<Modal
				backdrop="opaque"
				size="xs"
				isOpen={isOpen}
				onOpenChange={onOpenChange}>
				<ModalContent>
				  {(onClose) => (
					<>
					  <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
					  <ModalBody>
						<p>
						  {message} <span className="text-adobe text-semibold">{incomplete}</span>
						</p>
					  </ModalBody>
					  <ModalFooter>
						<FunctionButton
							isDisabled={false}
							iconOnly={false}
							buttonFunction={onClose}
							buttonIcon={mdiCloseCircleOutline}
							variant="secondary">{buttonText}</FunctionButton>
					  </ModalFooter>
					</>
				  )}
				</ModalContent>
			</Modal>
		</>
	);
};

export default ErrorDialog;