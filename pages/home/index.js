import {
    LinkBox,
    Box,
    Heading,
    LinkOverlay,
    Text,
    Badge,
    SimpleGrid,
    Flex,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalHeader,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    useToast,
    Center
} from '@chakra-ui/react'
import cookie from 'cookie'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { useMutation, useApolloClient } from '@apollo/client'
import { NEW_CONTRACT, GET_ALL_CONTRACT } from '../../src/graphql'

export default function Home({ token }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const formRef = useRef()
    const toast = useToast()
    const user = useSelector(state => state.User)
    const router = useRouter()
    const [addContract, { data: contract }] = useMutation(NEW_CONTRACT)
    const [contracts, setContracts] = useState([])
    const [loadingContracts, setLoadingContracts] = useState(true)
    const [savingContract, setSaveContracts] = useState(false)
    const client = useApolloClient()

    async function getContracts() {
        setLoadingContracts(true)
        const response = await client.query({
            query: GET_ALL_CONTRACT,
            fetchPolicy: 'no-cache'
        })
        setContracts(response.data.contracts.data)
        setLoadingContracts(false)
        LoadContracts()
    }

    function LoadContracts() {
        return (
            <SimpleGrid w='100%' p='6' columns={4} spacing={5}>
                {
                    contracts.map(c => {
                        return (
                            <LinkBox
                                as="contrato"
                                maxW="sm"
                                p="5"
                                borderWidth="1px"
                                borderColor='blackAlpha.100'
                                rounded="md"
                                backgroundColor='white'
                                key={c._id}
                            >
                                <Flex direction='row' justifyContent='space-between' as="tempo" dateTime="2021-01-15 15:30:00 +0000 UTC">
                                    <Text>{getDate(c.createdAt)}</Text>
                                    <Badge colorScheme='yellow' lineHeight='24px'>{c.status}</Badge>
                                </Flex>
                                <Heading size="md" my="2">
                                    <LinkOverlay href="#">
                                        {c.title}
                                    </LinkOverlay>
                                </Heading>
                                <Text>
                                    {c.subtitle}
                                </Text>
                            </LinkBox>
                        )
                    })
                }
            </SimpleGrid>
        )
    }

    useEffect(() => {
        getContracts()
    }, [])

    function handleSubmitContract() {
        if (formRef.current) {
            setSaveContracts(true)
            formRef.current.handleSubmit()
        }
    }

    function validateTitle(value) {
        let error

        if (!value)
            error = "O título é obrigatório"

        return error
    }

    function validateSubTitle(value) {
        let error

        if (!value)
            error = "O subtítulo é obrigatório"

        return error
    }

    function getDate(timestamp) {
        const date = new Date(parseInt(timestamp))

        return date.toLocaleString('pt-BR')
    }

    return (
        <Layout token={token} router={router}>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Novo Contrato</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Formik
                            initialValues={{ title: '', subtitle: '' }}
                            innerRef={formRef}
                            onSubmit={async (values, actions) => {
                                try {
                                    const contract = {
                                        ...values,
                                        ownerId: user._id,
                                        status: 'PENDING'
                                    }
                                    const response = await addContract({ variables: { contractInput: contract } })
                                    console.log(response)

                                    if (response.data.createContract.code != 200)
                                        throw new Error()

                                    toast({
                                        title: "Sucesso.",
                                        description: "Contrato adicionado com sucesso.",
                                        status: "success",
                                        duration: 3000,
                                        isClosable: true,
                                    })
                                } catch (e) {
                                    console.log(e)
                                    toast({
                                        title: "Erro.",
                                        description: "Erro ao criar o contrato.",
                                        status: "error",
                                        duration: 3000,
                                        isClosable: true,
                                    })
                                } finally {
                                    setSaveContracts(false)
                                    getContracts()
                                    onClose()
                                    actions.setSubmitting(false)
                                }
                            }}
                        >
                            {(props) => (
                                <Form>
                                    <Field name="title" validate={validateTitle}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.title && form.touched.title} isRequired mb='25px'>
                                                <FormLabel htmlFor="title">Título</FormLabel>
                                                <Input {...field} id="title" placeholder="seu contrato" type='text' autoFocus />
                                                <FormErrorMessage>{form.errors.title}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                    <Field name="subtitle" validate={validateSubTitle}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.subtitle && form.touched.subtitle} isRequired mb='25px'>
                                                <FormLabel htmlFor="subtitle">Subtítulo</FormLabel>
                                                <Input {...field} id="subtitle" placeholder="descreva o seu contrato" type='text' />
                                                <FormErrorMessage>{form.errors.subtitle}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmitContract} isLoading={savingContract}>
                            Salvar
                        </Button>
                        <Button variant="ghost" onClick={onClose} disabled={savingContract}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Button colorScheme="teal" variant="outline" p='6' m='6' onClick={onOpen}>
                Criar
            </Button>
            {
                loadingContracts ? (
                    <Center p='6'>loading</Center>
                ) : (
                    <LoadContracts />
                )
            }
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