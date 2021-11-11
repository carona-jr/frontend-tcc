import {
    Button, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter
} from '@chakra-ui/react'

export default function DefaultModal({
    isOpen,
    onClose,
    handleSuccess,
    handleCancel,
    children,
    btnSuccessText = 'Sim',
    btnCancelText = 'Não',
    modalName = 'Alerta',
    loading = false,
    size = 'sm'
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius={['0', '12px']}>
                <ModalHeader>{modalName}</ModalHeader>
                <ModalCloseButton onClick={() => {
                    if (handleCancel)
                        return handleCancel()
                }} />
                <ModalBody p="5">
                    {children}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} isLoading={loading} onClick={handleSuccess}>{btnSuccessText}</Button>
                    <Button
                        variant="ghost"
                        disabled={loading}
                        onClick={() => {
                            if (handleCancel)
                                return handleCancel()

                            onClose()
                        }}>{btnCancelText}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}