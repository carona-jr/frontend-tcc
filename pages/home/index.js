import { Center, useColorMode } from '@chakra-ui/react'
import cookie from 'cookie'

export default function Home() {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Center h='100vh' bgColor={colorMode == 'light' ? 'gray.200' : 'gray.700'}>
            Dashboard
        </Center>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token)
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            },
        }

    return {
        props: {},
    }
}