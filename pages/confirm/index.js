import { useRouter } from 'next/router'
import { useApolloClient, useMutation } from '@apollo/client'
import { UPDATE_USER } from '../../src/graphql'
import { Box, Center } from '@chakra-ui/react'

export default function Confirm() {
    const router = useRouter()

    const userId = router.query?.u

    const [updateUser] = useMutation(UPDATE_USER)

    updateUser({
        variables: {
            userInput: {
                id: userId,
                confirmedEmail: true
            }
        }
    })

    return (
        <Center bg='#fff' h='100px' color='white'>
            <Box bg='green' w='40%' p={4} color='white'>
                Email confirmado com sucesso!
            </Box>
        </Center>
    )
}

export function getServerSideProps({ req }) {
    return {
        props: {}
    }
}