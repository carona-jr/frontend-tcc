// React
import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../src/actions'
import { useRouter } from 'next/router'

// GraphQL
import { CREATE_USER } from '../../src/graphql'
import { useMutation } from '@apollo/client'

// Icons
import { AiFillEye, AiFillEyeInvisible, AiTwotoneLock } from 'react-icons/ai'

// Others
import cookie from 'cookie'
import { useCookies } from "react-cookie"
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
    useToast,
    Grid,
    GridItem,
    FormErrorMessage,
    Select
} from '@chakra-ui/react'

import { Formik, Form, Field, getIn } from 'formik'
import validator from 'validator'
import { cpf, cnpj } from 'cpf-cnpj-validator'
import InputMask from 'react-input-mask'
import passwordValidator from 'password-validator'

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { colorMode } = useColorMode()
    const toast = useToast()
    const [createUser] = useMutation(CREATE_USER)
    const router = useRouter()

    const formRef = useRef()
    const [saveFormData, setSaveFormData] = useState(false)
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: '',
        document: '',
        phone: {
            number: ''
        }
    })

    const passwordSchema = new passwordValidator()
    passwordSchema
        .is().min(6)
        .is().max(255)
        .has().symbols()
        .has().uppercase()
        .has().lowercase()
        .has().digits(1)
        .has().not().spaces()
        .is().not().oneOf(['Password', 'Password123', '123456', '123'])

    function validate(type, value) {
        let error

        if (!value)
            error = `${type} é obrigatório`

        if (type == 'email' && !validator.isEmail(value))
            error = `${type} é inválido`

        if (type == 'documento') {
            value = value.replace(/\D/g, '')

            if (value.length < 11 || value.length == 12 || value.length == 13)
                error = `${type} é inválido`
            else if (value.length == 11 && !cpf.isValid(value))
                error = `${type} é inválido`
            else if (value.length == 14 && !cnpj.isValid(value))
                error = `${type} é inválido`
        }

        if (type == 'senha' && !passwordSchema.validate(value))
            error = 'mínimo 6 digitos com uma maiúscula, minúscula, um número, uma letra e um caractere especial'

        if (type == 'confirmar a senha' && formValues.password != value)
            error = 'As senhas não conferem'

        return error
    }

    function handleSubmit() {
        if (formRef.current)
            formRef.current.handleSubmit()
    }

    return (
        <Center h='100vh' bgColor={colorMode == 'light' ? 'gray.200' : 'gray.700'}>
            <Box w="100%" maxW='xl' borderWidth='1px' borderRadius='lg' bgColor={colorMode == 'light' ? 'white' : 'blackAlpha.700'} py='70px' px='50px' mx='10px'>
                <Center mb='20px'>
                    <Text fontSize="4xl" casing="uppercase" fontWeight='600'>Crie a sua conta</Text>
                </Center>

                <Formik
                    initialValues={formValues}
                    innerRef={formRef}
                    onSubmit={async (values, actions) => {
                        try {
                            setSaveFormData(true)

                            values.phone.number = values.phone.number.replace(/\D/g, '')
                            values.document = values.document.replace(/\D/g, '')

                            const body = {
                                ...values,
                                phone: {
                                    ...values.phone,
                                    active: true
                                }
                            }

                            delete body.confirmPassword
                            await createUser({
                                variables: {
                                    userInput: {
                                        ...body
                                    }
                                }
                            })

                            setTimeout(() => {
                                router.push('/signin')
                            }, 10000)

                            toast({
                                title: "Sucesso.",
                                description: `Confirme o seu e-mail e faça o login`,
                                status: "success",
                                duration: 10000,
                                isClosable: true
                            })
                        } catch (e) {
                            toast({
                                title: "Erro.",
                                description: e.message,
                                status: "error",
                                duration: 3000,
                                isClosable: true
                            })
                        } finally {
                            setSaveFormData(false)
                            actions.setSubmitting(false)
                        }
                    }}
                >
                    {(props) => (
                        <Form>
                            <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                                <GridItem colSpan={12}>
                                    <Field name="name" validate={value => validate('nome', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.name && form.touched.name} isRequired mb='5px'>
                                                <FormLabel fontSize='12px' htmlFor="name">Nome</FormLabel>
                                                <Input {...field} id="name" placeholder="seu cliente" type='text' />
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="email" validate={value => validate('email', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.email && form.touched.email} isRequired mb='5px'>
                                                <FormLabel fontSize='12px' htmlFor="email">E-mail</FormLabel>
                                                <Input {...field} id="email" placeholder="seu@cliente.com" type='email' />
                                                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="phone.number" validate={value => validate('telefone', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={getIn(form.errors, 'phone.number') && getIn(form.touched, 'phone.number')} isRequired mb='5px'
                                                onChange={e => setFormValues({ ...formValues, phone: { number: e.target.value } })}>
                                                <FormLabel fontSize='12px' htmlFor="phoneNumber">Celular</FormLabel>
                                                <InputMask {...field} mask='99 99999-9999' maskChar='' value={formValues.phone.number}>
                                                    {inputProps => <Input {...inputProps} id="phoneNumber" placeholder="99 99999-9999" type='text' maxLength='13' />}
                                                </InputMask>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="document" validate={value => validate('documento', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.document && form.touched.document} isRequired mb='5px'
                                                onChange={e => {
                                                    const type = e.target.value.length < 15 ? 'PESSOA_FISICA' : 'PESSOA_JURIDICA'

                                                    setFormValues({
                                                        ...formValues,
                                                        document: e.target.value,
                                                        type
                                                    })

                                                    if (formRef.current.errors.type)
                                                        delete formRef.current.errors.type

                                                    formRef.current.values.type = type
                                                }}>
                                                <FormLabel fontSize='12px' htmlFor="document">Documento</FormLabel>
                                                <InputMask {...field} mask={formValues.document.length < 15 ? '999.999.999-999' : '99.999.999/9999-99'} maskChar='' value={formValues.document}>
                                                    {inputProps => <Input {...inputProps} id="document" placeholder="123.456.789-11" type='text' maxLength='20' />}
                                                </InputMask>
                                                <FormErrorMessage>{form.errors.document}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="type" validate={value => validate('tipo do cliente', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.type && form.touched.type} isRequired mb='5px'
                                                onChange={e => { setFormValues({ ...formValues, type: e.target.value }) }}>
                                                <FormLabel fontSize='12px' htmlFor="type">Tipo</FormLabel>
                                                <Select {...field} id="type" className='select-box' value={formValues.type}>
                                                    <option value='' disabled>Selecione</option>
                                                    <option value='PESSOA_JURIDICA'>Pessoa Jurídica</option>
                                                    <option value='PESSOA_FISICA'>Pessoa Física</option>
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="password" validate={value => validate('senha', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.password && form.touched.password} isRequired mb='5px'
                                                onChange={e => { setFormValues({ ...formValues, password: e.target.value }) }}>
                                                <FormLabel fontSize='12px' htmlFor="password">Senha</FormLabel>
                                                <InputGroup>
                                                    <Input {...field} id="password" placeholder="******" type={showPassword ? 'text' : 'password'} value={formValues.password} />
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
                                                <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>

                                <GridItem colSpan={6}>
                                    <Field name="confirmPassword" validate={value => validate('confirmar a senha', value)}>
                                        {({ field, form }) => (
                                            <FormControl isInvalid={form.errors.confirmPassword && form.touched.confirmPassword} isRequired mb='5px'
                                                onChange={e => { setFormValues({ ...formValues, confirmPassword: e.target.value }) }}>
                                                <FormLabel fontSize='12px' htmlFor="confirmPassword">Confirme a senha</FormLabel>
                                                <InputGroup>
                                                    <Input {...field} id="confirmPassword" placeholder="******" type={showConfirmPassword ? 'text' : 'password'} value={formValues.confirmPassword} />
                                                    <InputRightElement width="4.5rem">
                                                        {showConfirmPassword ?
                                                            <IconButton
                                                                aria-label="Mostrar a senha"
                                                                variant='ghost'
                                                                isRound
                                                                icon={<AiFillEyeInvisible fontSize='24px' />}
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            /> :
                                                            <IconButton
                                                                aria-label="Esconder a senha"
                                                                variant='ghost'
                                                                isRound
                                                                icon={<AiFillEye
                                                                    fontSize='24px' />}
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            />}
                                                    </InputRightElement>
                                                </InputGroup>
                                                <FormErrorMessage>{form.errors.confirmPassword}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                </GridItem>
                            </Grid>
                        </Form>
                    )}
                </Formik>
                <Center mt='10'>
                    <Button variant="ghost" mr='5' onClick={() => router.push('/signin')} disabled={saveFormData}>Login</Button>
                    <Button colorScheme="whatsapp" onClick={handleSubmit} isLoading={saveFormData}>Criar</Button>
                </Center>
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