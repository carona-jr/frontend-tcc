import {
    Button,
    Flex,
    Text,
    useDisclosure
} from '@chakra-ui/react'
import DefaultModal from '../modal'

import { SIGN_CONTRACT, GET_CONTRACT_BY_ID } from '../../graphql'
import { useMutation } from '@apollo/client'

export default function SignerModalButton({ contractId, currentUserId, signId, setSignersList, client }) {
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
                        onClick={async () => {
                            signContract({
                                variables: {
                                    signContractInput: {
                                        contractId, userId: currentUserId, signId
                                    }
                                }
                            })
                            const response = await client.query({
                                query: GET_CONTRACT_BY_ID,
                                variables: { _id: contractId }
                            })
                            setSignersList(response.data.contract.data[0].signers)
                            onSignerClose()
                        }}
                    >
                        Assinar
                    </Button>
                    <Button
                        colorScheme="red"
                        variant="ghost"
                        onClick={onSignerClose}
                    >
                        Recusar
                    </Button>
                </Flex>
            </DefaultModal>
        </>
    )
}