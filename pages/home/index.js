import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { getApolloClient } from '../../lib/apolloNextClient'
import { ME } from '../../src/graphql'

export default function Home({ user }) {
    return (
        <Layout>
            Dashboard - {user.name}
        </Layout>
    )
}

export async function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token)
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            }
        }

    try {
        const apollo = getApolloClient({ token: cookies.token })
        const response = await apollo.query({
            query: ME,
        })
        const data = JSON.stringify(response.data.me)

        return {
            props: {
                user: JSON.parse(data)
            }
        }
    } catch (e) {
        return {
            notFound: true
        }
    }
}