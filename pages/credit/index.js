// React
import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { getApolloClient } from '../../lib/apolloNextClient'
import { DEPOSIT, ME, FIND_COUPONS } from '../../src/graphql'
import { useMutation, useApolloClient } from '@apollo/client'

// Icons
import { FaUser } from 'react-icons/fa'

// Others
import cookie from 'cookie'
import { Flex, BreadcrumbItem, BreadcrumbLink, Text, useToast, Button, Input, Box, Spinner } from '@chakra-ui/react'
import { currencyFormatter, getDate } from '../../src/utils'
import InfiniteScroll from "react-infinite-scroll-component"

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))

export default function User({ token, data, coupons }) {
    const toast = useToast()
    const router = useRouter()
    const [code, setCode] = useState('')
    const [credit, setCredit] = useState(data.credit)
    const [reservedCredit, setReservedCredit] = useState(data.reservedCredit)
    const [deposit] = useMutation(DEPOSIT)
    const client = useApolloClient()

    const [hasMore, setHasMore] = useState(coupons.total > 10)
    const [items, setItems] = useState(coupons.data)
    const [page, setPage] = useState(1)

    async function handleClick() {
        if (code == '') {
            return toast({
                title: "Erro.",
                description: 'Preencha o campo código com um valor válido.',
                status: "error",
                duration: 3000,
                isClosable: true
            })
        }

        try {
            await deposit({
                variables: {
                    couponId: code
                }
            })

            const response = await client.query({ query: ME })
            setCredit(response.data.me.credit)
            setReservedCredit(response.data.me.reservedCredit)
            setCode('')

            const responseCoupons = await client.query({
                query: FIND_COUPONS,
                variables: {
                    couponInputs: {
                        limit: 10,
                        skip: 0
                    }
                },
                fetchPolicy: 'no-cache'
            })

            setPage(1)
            setItems([...responseCoupons.data.findCoupons.data])

            toast({
                title: "Sucesso.",
                description: `Créditos adicionados com sucesso`,
                status: "success",
                duration: 10000,
                isClosable: true
            })
        } catch (e) {
            toast({
                title: "Erro.",
                description: e.message,
                status: "error",
                duration: 3000,
                isClosable: true
            })
        }
    }

    async function fetchMoreData() {
        if (items.length >= coupons.total)
            return setHasMore(false)

        const response = await client.query({
            query: FIND_COUPONS,
            variables: {
                couponInputs: {
                    limit: (page + 1) * 10,
                    skip: page * 10
                }
            },
            fetchPolicy: 'no-cache'
        })

        setPage(page + 1)
        setItems([...items, ...response.data.findCoupons.data])
        console.log("🚀 ~ file: index.js ~ line 93 ~ fetchMoreData ~ response.data.findCoupons.data", [...items, ...response.data.findCoupons.data])
    }

    const breadcrumbItens = [
        <BreadcrumbItem key="1">
            <BreadcrumbLink href="/user">
                <Flex alignItems="center">
                    <FaUser className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">Créditos</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout token={token} router={router} title="Meus créditos" breadcrumbs={breadcrumbItens}>
            <Head>
                <title>Meus Créditos</title>
            </Head>

            <Flex flexDir='column' alignItems='center' my="5">
                <Text textTransform='uppercase' fontSize='1rem'>Você possui</Text>
                <Text mb='3' fontSize='3rem' fontWeight='600' color='green.400'>{currencyFormatter(credit)}</Text>
                <Flex mb='5' alignItems='center'>
                    <Text mr='1' fontSize='1rem' fontWeight='500' color='blackAlpha.700'>Você possui</Text>
                    <Text mr='1' fontSize='1rem' fontWeight='600' color='yellow.400'>{currencyFormatter(reservedCredit)}</Text>
                    <Text fontSize='1rem' fontWeight='500' color='blackAlpha.700'>reservados</Text>
                </Flex>
                <Box mb='5' minW="300px">
                    <Input placeholder='cole o código aqui para adicionar mais crédito' size='md' onChange={(e) => { setCode(e.target.value) }} />
                </Box>
                <Button
                    colorScheme="blue"
                    minW="200px"
                    isLoading={false}
                    onClick={() => handleClick()}
                >
                    Validar
                </Button>
            </Flex>

            <Flex justifyContent='center'>
                <Box w={['100%', '100%', '50%']}>
                    <InfiniteScroll
                        style={{ paddingBottom: '48px' }}
                        dataLength={items.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={
                            <Flex justifyContent='center'>
                                <Spinner
                                    thickness="4px"
                                    speed="0.65s"
                                    emptyColor="gray.200"
                                    color="blue.500"
                                    size="xl"
                                />
                            </Flex>
                        }
                        height='350px'
                        scrollThreshold={0.9}
                        endMessage={
                            items.length == 0 ? (
                                <p style={{ textAlign: "center" }}>
                                    <b>Sem nenhum crédito adicionado</b>
                                </p>
                            ) :
                                (<></>)
                        }
                    >
                        {
                            items.map((i, n) => {
                                return (
                                    <Box key={i._id} border='1px solid rgba(0, 0, 0, 0.1)' p='3' my='4'>
                                        {currencyFormatter(i.value)} adicionado em {getDate(i.updatedAt)}
                                    </Box>
                                )
                            })
                        }
                    </InfiniteScroll>
                    <Text mt='5'>Total de cupons: {coupons.total}</Text>
                </Box>
            </Flex>
        </Layout>
    )
}

export async function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token || cookies.token == 'undefined')
        return {
            redirect: {
                destination: '/signin',
                permanent: false
            }
        }

    const apollo = getApolloClient({ token: cookies.token })
    const response = await apollo.query({
        query: ME
    })

    const couponUsage = await apollo.query({
        query: FIND_COUPONS,
        variables: {
            couponInputs: {
                limit: 10,
                skip: 0
            }
        }
    })

    return {
        props: {
            token: cookies.token,
            data: response.data.me,
            coupons: couponUsage.data.findCoupons
        }
    }
}