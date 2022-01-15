import {
    Button,
    Flex,
    Text,
    useDisclosure
} from '@chakra-ui/react'
import DefaultModal from '../modal'

import { SIGN_CONTRACT } from '../../graphql'
import { useMutation } from '@apollo/client'

export default function SignerModalButton({ contractId, currentUserId }) {
    // Signers
    const { isOpen: isSignerOpen, onOpen: onSignerOpen, onClose: onSignerClose } = useDisclosure()

    const [signContract, { data, loading, error }] = useMutation(SIGN_CONTRACT)

    return (
        <>
            <Button
                colorScheme="whatsapp"
                variant="unstyled"
                mr='2'
                onClick={onSignerOpen}
            >
            Assinar
            </Button>

            <DefaultModal
                modalName="Assinatura"
                isOpen={isSignerOpen}
                onClose={onSignerClose}
                handleSuccess={() => null}
                size='sm'
                showButton={false}
            >
                <Text textAlign="center" mb="5">Você deseja assinar este contrato?</Text>
                <Flex justifyContent='center'>
                    <Button
                        colorScheme="whatsapp"
                        variant="ghost"
                        mr='5'
                        onClick={() => {signContract({ variables: {
                            signContractInput: {
                                contractId, userId: currentUserId
                            }
                        } })
                        onSignerClose()
                        }}
                    >
                Assinar
                    </Button>
                    <Button
                        colorScheme="red"
                        variant="ghost"
                        mr='5'
                        onClick={onSignerClose}
                    >
                Recusar
                    </Button>
                </Flex>
            </DefaultModal>
        </>
    )
}