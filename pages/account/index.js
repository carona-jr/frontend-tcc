// React
import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { getApolloClient } from '../../lib/apolloNextClient'
import { ME } from '../../src/graphql'

// Icons
import { FaUser } from 'react-icons/fa'

// Others
import cookie from 'cookie'
import { Flex, BreadcrumbItem, BreadcrumbLink, Text, useToast, Button } from '@chakra-ui/react'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import UserForm from '../../src/components/user/forms'

export default function User({ token, data }) {
    const toast = useToast()
    const router = useRouter()

    const formRef = useRef()
    const [mutationMethod] = useState('UPDATE')
    const [saveFormData, setSaveFormData] = useState(false)
    const initialForm = {
        ...data,
        address: {
            ...data.address[0]
        },
        phone: {
            ...data.phone[0]
        }
    }
    const [formValues, setFormValues] = useState(initialForm)

    const breadcrumbItens = [
        <BreadcrumbItem key="1">
            <BreadcrumbLink href="/user">
                <Flex alignItems="center">
                    <FaUser className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">Minha Conta</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout token={token} router={router} title="Minha conta" breadcrumbs={breadcrumbItens}>
            <Head>
                <title>Minha Conta</title>
            </Head>

            <UserForm
                token={token}
                toast={toast}
                formValues={formValues}
                setFormValues={setFormValues}
                formRef={formRef}
                method={mutationMethod}
                setSaveData={setSaveFormData}
            />

            <Flex justifyContent="flex-end" mt="5">
                <Button
                    colorScheme="blue"
                    minW="150px"
                    isLoading={saveFormData}
                    onClick={() => {
                        if (formRef.current)
                            formRef.current.handleSubmit()
                    }}
                >
                    Salvar
                </Button>
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
    console.log("🚀 ~ file: index.js ~ line 99 ~ getServerSideProps ~ response", response)

    return {
        props: {
            token: cookies.token,
            data: response.data.me
        }
    }
}