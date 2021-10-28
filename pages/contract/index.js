import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { useRouter } from 'next/router'
import Board from 'react-trello'
import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/client'
import { GET_ALL_CONTRACT } from '../../src/graphql'

// const data = {
//     lanes: [
//         {
//             id: 'ABERTO',
//             title: 'Abertos',
//             label: '2/2',
//             cards: [
//                 { id: 'Card1', title: 'Meu primeiro contrato', description: 'novo contrato teste', label: '11/08/2021', tags: [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: 'PENDENTE' }], draggable: false },
//                 { id: 'Card1', title: 'Meu segundo contrato', description: 'novo contrato teste', label: '11/08/2021', tags: [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: 'PENDENTE' }] }
//             ]
//         },
//         {
//             id: 'PREPARACAO',
//             title: 'Preparação',
//             label: '0/0',
//             cards: []
//         },
//         {
//             id: 'ENVIADO',
//             title: 'Enviado',
//             label: '0/0',
//             cards: []
//         },
//         {
//             id: 'ASSINADO',
//             title: 'Assinado',
//             label: '0/0',
//             cards: []
//         }
//     ]
// }

export default function Contract({ token }) {
    const router = useRouter()
    const [contracts, setContracts] = useState({
        lanes: [
            {
                id: 'ABERTO',
                title: 'Abertos',
                label: '0/0',
                cards: []
            },
            {
                id: 'PREPARACAO',
                title: 'Preparação',
                label: '0/0',
                cards: []
            },
            {
                id: 'ENVIADO',
                title: 'Enviado',
                label: '0/0',
                cards: []
            },
            {
                id: 'ASSINADO',
                title: 'Assinado',
                label: '0/0',
                cards: []
            }
        ]
    })
    const client = useApolloClient()

    function getDate(timestamp) {
        const date = new Date(parseInt(timestamp))
        return date.toLocaleString('pt-BR')
    }

    async function getContracts() {
        console.log('teste')
        const response = await client.query({
            query: GET_ALL_CONTRACT,
            fetchPolicy: 'no-cache'
        })

        response.data.contracts.data.map(v => {
            v.description = v.subtitle
            v.tags = [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: v.status }]
            v.label = getDate(v.createdAt)
        })

        console.log(response.data.contracts.data)

        setContracts({
            lanes: [
                {
                    id: 'ABERTO',
                    title: 'Abertos',
                    label: '0/0',
                    cards: response.data.contracts.data
                },
                {
                    id: 'PREPARACAO',
                    title: 'Preparação',
                    label: '0/0',
                    cards: []
                },
                {
                    id: 'ENVIADO',
                    title: 'Enviado',
                    label: '0/0',
                    cards: []
                },
                {
                    id: 'ASSINADO',
                    title: 'Assinado',
                    label: '0/0',
                    cards: []
                }
            ]
        })
    }

    useEffect(() => {
        getContracts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout token={token} router={router}>
            <Board
                data={contracts}
                style={{ backgroundColor: '#fff', display: 'flex', justifyContent: 'center', height: '650px' }}
                laneStyle={{ width: '24.5%' }}
            />
        </Layout>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token || cookies.token == 'undefined')
        return {
            redirect: {
                destination: '/signin',
                permanent: false
            }
        }

    return {
        props: {
            token: cookies.token
        }
    }
}