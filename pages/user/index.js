// React
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { useApolloClient, useMutation } from '@apollo/client'
import { getApolloClient } from '../../lib/apolloNextClient'
import { FIND_USERS } from '../../src/graphql'

// Icons
import { FaUser } from 'react-icons/fa'

// Others
import cookie from 'cookie'
import { Button, Flex, useDisclosure, BreadcrumbItem, BreadcrumbLink, Text, useToast, Box, Input } from '@chakra-ui/react'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import TableList from '../../src/components/list/table'

export default function User({ token, initialData, initialConfig }) {
    const router = useRouter()

    const [tableData, setTableData] = useState(initialData.data)
    const [tablePageCount, setTablePageCount] = useState(initialData.total % initialConfig.initialPageSize == 0 ? parseInt(initialData.total / initialConfig.initialPageSize) : parseInt(initialData.total / initialConfig.initialPageSize) + 1)

    const columns = useMemo(
        () => [
            {
                Header: 'nome',
                accessor: 'name'
            },
            {
                Header: 'email',
                accessor: 'email'
            },
            {
                Header: '',
                accessor: '_id'
            }
        ],
        []
    )
    const data = useMemo(() => tableData, [tableData])

    const breadcrumbItens = [
        <BreadcrumbItem key="1">
            <BreadcrumbLink href="/user">
                <Flex alignItems="center">
                    <FaUser className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">Usuários</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout token={token} router={router} title="Usuários" breadcrumbs={breadcrumbItens}>
            <Head>
                <title>Usuários - Lista</title>
            </Head>

            <TableList
                columns={columns}
                data={data}
                handleEdit={() => {}}
                initialConfig={initialConfig}
                tablePageCount={tablePageCount}
            />
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
        query: FIND_USERS,
        variables: { 
            userInputs: {
                limit: 10,
                skip: 0
            }
        }
    })

    return {
        props: {
            token: cookies.token,
            initialData: {
                data: response.data.findUsers.data,
                total: response.data.findUsers.total
            },
            initialConfig: {
                page: 1,
                initialPageSize: 10
            }
        }
    }
}