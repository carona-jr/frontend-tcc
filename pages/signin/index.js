import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import {
    Box,
    Text,
    FormControl,
    FormLabel,
    Input,
    Button,
    InputGroup,
    InputRightElement,
    InputLeftElement,
    IconButton,
    useColorMode,
    Center,
    useToast
} from '@chakra-ui/react'
import { AiFillEye, AiFillEyeInvisible, AiTwotoneLock } from 'react-icons/ai'
import { LOGIN } from '../../src/graphql'
import { useMutation } from '@apollo/client'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../src/actions'
import validator from 'validator'
import { useCookies } from "react-cookie"
import cookie from 'cookie'
import { useRouter } from 'next/router'

export default function SignIn() {
    // eslint-disable-next-line no-unused-vars
    const [cookie, setCookie] = useCookies(["user"])
    const [showPassword, setShowPassword] = useState(false)
    const { colorMode } = useColorMode()
    const toast = useToast()
    const [login] = useMutation(LOGIN)
    const dispatch = useDispatch()
    const router = useRouter()

    function validateLogin(value) {
        let error

        if (!value)
            error = "O e-mail é obrigatório"
        else if (!validator.isEmail(value))
            error = "Formato inválido"

        return error
    }

    function validatePassword(value) {
        let error

        if (!value)
            error = "A senha é obrigatória"

        return error
    }

    return (
        <Center h='100vh' bgColor={colorMode == 'light' ? 'gray.200' : 'gray.700'}>
            <Box w="100%" maxW='xl' borderWidth='1px' borderRadius='lg' bgColor={colorMode == 'light' ? 'white' : 'blackAlpha.700'} py='70px' px='50px' mx='10px'>
                <Center mb='20px'>
                    <Text fontSize="4xl" casing="uppercase" fontWeight='600'>Contrato</Text>
                </Center>
                <Formik
                    initialValues={{ login: '', password: '' }}
                    onSubmit={async (values, actions) => {
                        try {
                            const response = await login({ variables: { email: values.login, password: values.password } })
                            console.log(response)
                            setCookie("token", response.data.login.token, {
                                path: "/",
                                maxAge: 604800, // Expires after 7 days
                                sameSite: true
                            })

                            dispatch(updateUser(response.data.login.user))
                            router.push('/home')

                            toast({
                                title: "Sucesso.",
                                description: "Você foi autenticado com sucesso.",
                                status: "success",
                                duration: 3000,
                                isClosable: true
                            })
                        } catch (e) {
                            console.log(e)
                            toast({
                                title: "Erro.",
                                description: "As suas credenciais não foram encontradas.",
                                status: "error",
                                duration: 3000,
                                isClosable: true
                            })
                        } finally {
                            actions.setSubmitting(false)
                        }
                    }}
                >
                    {props => (
                        <Form>
                            <Field name="login" validate={validateLogin}>
                                {({ field, form }) => (
                                    <FormControl isInvalid={form.errors.login && form.touched.login} isRequired mb='25px'>
                                        <FormLabel htmlFor="login">Usuário</FormLabel>
                                        <Input {...field} id="login" placeholder="seu@email.com" type='email' />
                                        {/* <FormErrorMessage>{form.errors.login}</FormErrorMessage> */}
                                    </FormControl>
                                )}
                            </Field>
                            <Field name="password" validate={validatePassword}>
                                {({ field, form }) => (
                                    <FormControl isInvalid={form.errors.password && form.touched.password} isRequired mb='15px'>
                                        <FormLabel htmlFor="password">Senha</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents="none"
                                            >
                                                <AiTwotoneLock color="gray.300" />
                                            </InputLeftElement>
                                            <Input {...field} id='password' placeholder='******' type={showPassword ? 'text' : 'password'} />
                                            <InputRightElement width="4.5rem">
                                                {showPassword ?
                                                    <IconButton
                                                        aria-label="Mostrar a senha"
                                                        variant='ghost'
                                                        isRound
                                                        icon={<AiFillEyeInvisible fontSize='24px' />}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    /> :
                                                    <IconButton
                                                        aria-label="Esconder a senha"
                                                        variant='ghost'
                                                        isRound
                                                        icon={<AiFillEye
                                                            fontSize='24px' />}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    />}
                                            </InputRightElement>
                                        </InputGroup>
                                        {/* <FormErrorMessage>{form.errors.password}</FormErrorMessage> */}
                                    </FormControl>
                                )}
                            </Field>

                            <Text fontSize="small" casing="uppercase" mb='5px'>Esqueci minha senha?</Text>

                            <Button
                                mt='25px'
                                w='100%'
                                colorScheme="whatsapp"
                                isLoading={props.isSubmitting}
                                type="submit"
                                mb='40px'
                            >
                                Entrar
                            </Button>
                        </Form>
                    )}
                </Formik>

                <Text fontSize="sm" casing="uppercase">Não tem uma conta? Crie aqui</Text>
            </Box>
        </Center>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (cookies.token && cookies.token != 'undefined')
        return {
            redirect: {
                destination: '/home',
                permanent: false
            }
        }

    return {
        props: {}
    }
}