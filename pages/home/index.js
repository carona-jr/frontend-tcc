import {
    LinkBox,
    Box,
    Heading,
    LinkOverlay,
    Text,
    Badge,
    SimpleGrid,
    Flex
} from '@chakra-ui/react'
import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'

export default function Home({ token }) {
    const user = useSelector(state => state.User)
    const router = useRouter()

    return (
        <Layout token={token} router={router}>
            <SimpleGrid w='100%' p='6' columns={4} spacing={5}>
                <LinkBox
                    as="contrato"
                    maxW="sm"
                    p="5"
                    borderWidth="1px"
                    borderColor='blackAlpha.100'
                    rounded="md"
                    backgroundColor='white'
                >
                    <Flex direction='row' justifyContent='space-between' as="tempo" dateTime="2021-01-15 15:30:00 +0000 UTC">
                        <Text>19/07/2021 às 19h59</Text>
                        <Badge colorScheme='teal' lineHeight='24px'>Criado</Badge>
                    </Flex>
                    <Heading size="md" my="2">
                        <LinkOverlay href="#">
                            Título
                        </LinkOverlay>
                    </Heading>
                    <Text>
                        Subtítulo
                    </Text>
                </LinkBox>

            </SimpleGrid>
        </Layout>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token || cookies.token == 'undefined')
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            }
        }

    return {
        props: {
            token: cookies.token
        }
    }
}