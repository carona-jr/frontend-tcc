import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import {
    Box,
    Text,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Button,
    InputGroup,
    InputRightElement,
    InputLeftElement,
    IconButton,
    useColorMode,
    Center
} from '@chakra-ui/react'
import { AiFillEye, AiFillEyeInvisible, AiTwotoneLock } from 'react-icons/ai'
import { LOGIN } from '../../src/graphql/index'
import { useMutation } from '@apollo/client'
import validator from 'validator'

export default function Home() {
    const [showPassword, setShowPassword] = useState(false)
    const { colorMode, toggleColorMode } = useColorMode()
    const [login, { data }] = useMutation(LOGIN)

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
                            const a = await login({variables: { email: values.login, password: values.password }})
                        } catch (e) {
                            console.error(e)
                        } finally {
                            actions.setSubmitting(false)
                        }
                    }}
                >
                    {(props) => (
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


export async function getServerSideProps(context) {
    return {
      props: {}, // will be passed to the page component as props
    }
}