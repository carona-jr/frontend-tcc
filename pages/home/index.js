// React
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { getApolloClient } from '../../lib/apolloNextClient'
import { ME, GET_ALL_CONTRACT, GET_ALL_CONTRACT_GROUP } from '../../src/graphql'
import { useApolloClient } from '@apollo/client'

// Others
import cookie from 'cookie'
import { Flex, Text, Box, Spinner, Grid, GridItem } from '@chakra-ui/react'
import { currencyFormatter } from '../../src/utils'
import { ResponsivePie } from '@nivo/pie'
import { pieChartDef, pieChartFill, contractNameStatus, pieChartLegend } from '../../src/utils/constants'
import { getDate } from '../../src/utils/index'
import InfiniteScroll from "react-infinite-scroll-component"

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))

export default function Home({ token, user, countContracts, countContractByStatus, contract }) {
    const router = useRouter()
    const client = useApolloClient()

    const [hasMore, setHasMore] = useState(contract.total > 10)
    const [items, setItems] = useState(contract.data)
    const [page, setPage] = useState(1)

    async function fetchMoreData() {
        if (items.length >= contract.total)
            return setHasMore(false)

        const response = await client.query({
            query: GET_ALL_CONTRACT,
            variables: {
                contractsInput: {
                    limit: (page + 1) * 10,
                    skip: page * 10
                }
            },
            fetchPolicy: 'no-cache'
        })

        setPage(page + 1)
        setItems([...items, ...response.data.contracts.data])
    }

    return (
        <Layout title='Início' token={token} router={router}>
            <Head>
                <title>Início</title>
            </Head>
            <Grid templateColumns="repeat(12, 1fr)" gap={10}>
                <GridItem colSpan={[8, 12, 12, 4]} border='1px solid var(--chakra-colors-blackAlpha-100)' boxShadow='sm'>
                    <Flex flexDir='column' alignItems='center' justifyContent='center' my="5">
                        <Text textTransform='uppercase' fontSize='1rem'>Sua conta</Text>
                        <Box alignSelf='flex-start' px='3'>
                            <Text fontSize='0.7rem' fontWeight='600' textTransform='capitalize'>Seu nome</Text>
                            <Text fontSize='1rem' textTransform='capitalize'>{user.name.toLowerCase()}</Text>
                        </Box>
                        <Box alignSelf='flex-start' px='3' mt='2'>
                            <Text fontSize='0.7rem' fontWeight='600' textTransform='capitalize'>Seu e-mail</Text>
                            <Text fontSize='1rem'>{user.email.toLowerCase()}</Text>
                        </Box>
                        <Box alignSelf='flex-start' px='3' mt='2'>
                            <Text fontSize='0.7rem' fontWeight='600' textTransform='capitalize'>Carteira Ethereum</Text>
                            <Text fontSize='1rem'>{user.wallet}</Text>
                        </Box>
                    </Flex>
                </GridItem>
                <GridItem colSpan={[8, 12, 12, 4]} border='1px solid var(--chakra-colors-blackAlpha-100)' boxShadow='sm'>
                    <Flex flexDir='column' alignItems='center' justifyContent='center' my="5">
                        <Text textTransform='uppercase' fontSize='1rem'>Seus créditos</Text>
                        <Text mb='3' fontSize='3rem' fontWeight='600' color='green.400'>{currencyFormatter(user.credit)}</Text>
                        <Flex alignItems='center'>
                            <Text mr='1' fontSize='1rem' fontWeight='500' color='blackAlpha.700'>Você possui</Text>
                            <Text mr='1' fontSize='1rem' fontWeight='600' color='yellow.400'>{currencyFormatter(user.reservedCredit)}</Text>
                            <Text fontSize='1rem' fontWeight='500' color='blackAlpha.700'>reservados</Text>
                        </Flex>
                    </Flex>
                </GridItem>
                <GridItem colSpan={[8, 12, 12, 4]} border='1px solid var(--chakra-colors-blackAlpha-100)' boxShadow='sm'>
                    <Flex flexDir='column' alignItems='center' justifyContent='center' my="5">
                        <Text textTransform='uppercase' fontSize='1rem'>Total de contratos</Text>
                        <Text fontSize='1.5rem' fontWeight='600' textTransform='uppercase' color='blackAlpha.700' mt='8'>Você tem {countContracts} contrato{countContracts > 0 ? 's' : ''}</Text>
                    </Flex>
                </GridItem>
            </Grid>
            <Grid templateColumns="repeat(12, 1fr)" gap={10} mt='10'>
                <GridItem colSpan={[8, 12, 12, 6]} border='1px solid var(--chakra-colors-blackAlpha-100)' boxShadow='sm' p='6' maxH='500px'>
                    <Text textTransform='uppercase' fontSize='1rem'>Contrato por status</Text>
                    <ResponsivePie
                        data={countContractByStatus}
                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        colors={{ scheme: 'set3' }}
                        borderWidth={1}
                        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                        radialLabelsSkipAngle={10}
                        radialLabelsTextXOffset={6}
                        radialLabelsTextColor="#333333"
                        radialLabelsLinkOffset={0}
                        radialLabelsLinkDiagonalLength={16}
                        radialLabelsLinkHorizontalLength={24}
                        radialLabelsLinkStrokeWidth={1}
                        radialLabelsLinkColor={{ from: 'color' }}
                        slicesLabelsSkipAngle={10}
                        slicesLabelsTextColor="#333333"
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                        enableArcLinkLabels={false}
                        enableArcLabels={true}
                        legends={pieChartLegend}
                        defs={pieChartDef}
                        fill={pieChartFill}
                    />
                </GridItem>
                <GridItem colSpan={[8, 12, 12, 6]} border='1px solid var(--chakra-colors-blackAlpha-100)' boxShadow='sm' p='6' maxH='500px'>
                    <Text textTransform='uppercase' fontSize='1rem'>Seus últimos contratos</Text>
                    <Box w={['100%']}>
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
                                        <b>Sem nenhum contrato adicionado</b>
                                    </p>
                                ) :
                                    (<></>)
                            }
                        >
                            {
                                items.map((i, n) => {
                                    return (
                                        <Box key={i._id} border='1px solid rgba(0, 0, 0, 0.1)' p='3' my='4' _hover={{ bgColor: 'var(--chakra-colors-blackAlpha-100)', cursor: 'pointer' }}>
                                            <Flex>
                                                <Box px='2'>
                                                    <Text fontSize='0.7rem' fontWeight='600' textTransform='capitalize'>Título</Text>
                                                    <Text fontSize='1rem' textTransform='capitalize'>{i.title}</Text>
                                                </Box>
                                                <Box px='2'>
                                                    <Text fontSize='0.7rem' fontWeight='600' textTransform='capitalize'>Descrição</Text>
                                                    <Text fontSize='1rem' textTransform='capitalize'>{i.subtitle}</Text>
                                                </Box>
                                            </Flex>
                                            <Flex mt='2'>
                                                <Flex px='2'>
                                                    <Text fontSize='1rem' mr='1'>Incluído em</Text>
                                                    <Text fontSize='1rem'>{getDate(i.createdAt)} por <Text display='inline-block' textTransform='capitalize'>{i.ownerId.name.toLowerCase()}</Text></Text>
                                                </Flex>
                                            </Flex>
                                        </Box>
                                    )
                                })
                            }
                        </InfiniteScroll>
                        <Text mt='5'>Total de contratos: {contract.total}</Text>
                    </Box>
                </GridItem>
            </Grid>
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

    const responseContract = await apollo.query({
        query: GET_ALL_CONTRACT,
        variables: {
            contractsInput: {
                skip: 0,
                limit: 10
            }
        }
    })

    const contractByStatus = await apollo.query({
        query: GET_ALL_CONTRACT_GROUP,
        variables: {
            contractsInput: {
                skip: 0,
                limit: 10,
                groupBy: 'status'
            }
        }
    })

    const contracts = contractByStatus.data.contracts.data.filter(c => c._id != 'CLOSED')
    const countContractByStatus = []
    contracts.map(c => {
        countContractByStatus.push({
            id: c._id,
            label: contractNameStatus[c._id],
            value: c.total
        })
    })

    return {
        props: {
            token: cookies.token,
            user: response.data.me,
            countContracts: contractByStatus.data.contracts.total,
            countContractByStatus,
            contract: responseContract.data.contracts
        }
    }
}