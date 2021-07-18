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
            Dashboard - {user.email}
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