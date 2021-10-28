import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { useRouter } from 'next/router'
import Board from 'react-trello'

const data = {
    lanes: [
        {
            id: 'ABERTO',
            title: 'Abertos',
            label: '2/2',
            cards: [
                { id: 'Card1', title: 'Meu primeiro contrato', description: 'novo contrato teste', label: '11/08/2021', tags: [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: 'PENDENTE' }], draggable: false },
                { id: 'Card1', title: 'Meu segundo contrato', description: 'novo contrato teste', label: '11/08/2021', tags: [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: 'PENDENTE' }] }
            ]
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
}

export default function Home({ token }) {
    const router = useRouter()

    return (
        <Layout token={token} router={router}>
            <Board
                data={data}
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