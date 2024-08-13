import {  Modal,   ModalContent,   ModalHeader,   ModalBody,   ModalFooter} from "@nextui-org/modal";
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
		incomplete: string[],
		isOpen: boolean,
		onOpenChange: (isOpen: boolean) => void
	}) => {

	const incompleteItems = (
		incomplete.map( (item) => (
			item
		))
	);

	return (
		<>
			<Modal
				backdrop="opaque"
				isOpen={isOpen}
				onOpenChange={onOpenChange}>
				<ModalContent>
				  {(onClose) => (
					<>
					  <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
					  <ModalBody>
						<p>
						  {message} <span className="text-adobe text-semibold">{incompleteItems}</span>
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