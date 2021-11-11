/* eslint-disable no-unused-vars */
import {
    Text
} from '@chakra-ui/react'
import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { useRouter } from 'next/router'

export default function Home({ token }) {
    const router = useRouter()

    return (
        <Layout token={token} router={router}>
            <Text>Home</Text>
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