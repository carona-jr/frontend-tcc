// React
import { useState } from 'react'

// Graphql
import { useMutation } from '@apollo/client'
import { CREATE_USER, UPDATE_USER } from '../../../graphql'

// API
import { viacep } from '../../../services/api'

// Others
import {
    FormControl, FormLabel, Input,
    Select, Grid, GridItem, Spinner,
    InputGroup, InputRightElement, Tabs, Tab,
    TabList, TabPanel, TabPanels, FormErrorMessage
} from '@chakra-ui/react'
import { Formik, Form, Field, getIn } from 'formik'
import validator from 'validator'
import { cpf, cnpj } from 'cpf-cnpj-validator'
import InputMask from 'react-input-mask'


export default function UserForm({ toast, formValues, setFormValues, formRef, method, setSaveData, onClose }) {
    const [createUser] = useMutation(CREATE_USER)
    const [updateUser] = useMutation(UPDATE_USER)
    const [zipCodeLoading, setZipCodeLoading] = useState(false)

    function validate(type, value) {
        let error

        if (type == 'senha' && method == 'UPDATE')
            return error

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

        return error
    }

    async function searchZipCode(zipcode) {
        setFormValues({ ...formValues, address: { zipcode } })
        zipcode = zipcode.replace(/\D/g, '')
        if (zipcode.length == 8) {
            try {
                setZipCodeLoading(true)
                const response = await viacep.get(`/${zipcode}/json`)

                if (!response.data)
                    throw new Error()

                formRef.current.values.address.street = response.data.logradouro
                formRef.current.values.address.neighborhood = response.data.bairro
                formRef.current.values.address.city = response.data.localidade
                formRef.current.values.address.state = response.data.uf

                setFormValues({
                    ...formValues,
                    address: {
                        street: response.data.logradouro,
                        neighborhood: response.data.bairro,
                        city: response.data.localidade,
                        state: response.data.uf
                    }
                })
            } catch {
            } finally {
                setZipCodeLoading(false)
            }
        }
    }

    return (
        <Formik
            initialValues={formValues}
            innerRef={formRef}
            onSubmit={async (values, actions) => {
                try {
                    setSaveData(true)

                    values.phone.number = values.phone.number.replace(/\D/g, '')
                    values.address.zipcode = values.address.zipcode.replace(/\D/g, '')
                    values.document = values.document.replace(/\D/g, '')

                    const body = {
                        ...values,
                        address: {
                            ...values.address,
                            active: true
                        },
                        phone: {
                            ...values.phone,
                            active: true
                        }
                    }

                    if (method == 'CREATE') {
                        await createUser({
                            variables: {
                                userInput: {
                                    ...body
                                }
                            }
                        })
                    } else {
                        body.id = body._id
                        delete body.__typename
                        delete body.supervised
                        delete body._id
                        delete body.address.__typename
                        delete body.address._id
                        delete body.phone.__typename
                        delete body.phone._id
                        await updateUser({
                            variables: {
                                userInput: {
                                    ...body
                                }
                            }
                        })
                    }

                    onClose()
                    toast({
                        title: "Sucesso.",
                        description: `Sucesso`,
                        status: "success",
                        duration: 3000,
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
                    setSaveData(false)
                    actions.setSubmitting(false)
                }
            }}
        >
            {(props) => (
                <Form>
                    <Tabs isFitted variant="enclosed">
                        <TabList mb="1em">
                            <Tab>Geral</Tab>
                            <Tab>Endereço</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
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

                                    <GridItem colSpan={12}>
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
                                        <Field name="password" validate={value => validate('senha', value)}>
                                            {({ field, form }) => (
                                                method == 'CREATE' ? <FormControl isInvalid={form.errors.password && form.touched.password} isRequired mb='5px'>
                                                    <FormLabel fontSize='12px' htmlFor="password">Senha</FormLabel>
                                                    <Input {...field} id="password" placeholder="******" type='password' />
                                                </FormControl> : <FormControl isInvalid={form.errors.password && form.touched.password} mb='5px'>
                                                    <FormLabel fontSize='12px' htmlFor="password">Senha</FormLabel>
                                                    <Input {...field} id="password" placeholder="******" type='password' />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                                    <GridItem colSpan={3}>
                                        <Field name="address.zipcode" validate={value => validate('cep', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.zipcode') && getIn(form.touched, 'address.zipcode')} isRequired mb='5px'
                                                    onChange={e => searchZipCode(e.target.value)}>
                                                    <FormLabel fontSize='12px' htmlFor="addressZipcode">CEP</FormLabel>
                                                    <InputGroup>
                                                        <InputMask {...field} mask='99999-999' maskChar='' value={formValues.address.zipcode}>
                                                            {inputProps => <Input {...inputProps} id="addressZipcode" placeholder="99999-999" type='text' maxLength='10' />}
                                                        </InputMask>
                                                        <InputRightElement width="4.5rem">
                                                            {zipCodeLoading ? <Spinner color='blue.500' /> : <></>}
                                                        </InputRightElement>
                                                    </InputGroup>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={9}>
                                        <Field name="address.street" validate={value => validate('rua', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.street') && getIn(form.touched, 'address.street')} isRequired mb='5px'
                                                    onChange={e => setFormValues({ ...formValues, address: { street: e.target.value } })}>
                                                    <FormLabel fontSize='12px' htmlFor="addressStreet">Logradouro</FormLabel>
                                                    <Input {...field} id="addressStreet" placeholder="nome da rua" type='text' value={formValues.address.street} />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={2}>
                                        <Field name="address.number" validate={value => validate('numero', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.number') && getIn(form.touched, 'address.number')} isRequired mb='5px'>
                                                    <FormLabel fontSize='12px' htmlFor="addressNumber">Nº</FormLabel>
                                                    <Input {...field} id="addressNumber" placeholder="nº" type='text' />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={10}>
                                        <Field name="address.complement">
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.complement') && getIn(form.touched, 'address.complement')} mb='5px'>
                                                    <FormLabel fontSize='12px' htmlFor="addressComplement">Complemento</FormLabel>
                                                    <Input {...field} id="addressComplement" placeholder="observação" type='text' />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={6}>
                                        <Field name="address.neighborhood" validate={value => validate('bairro', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.neighborhood') && getIn(form.touched, 'address.neighborhood')} isRequired mb='5px'
                                                    onChange={e => setFormValues({ ...formValues, address: { neighborhood: e.target.value } })}>
                                                    <FormLabel fontSize='12px' htmlFor="addressNeighborhood">Bairro</FormLabel>
                                                    <Input {...field} id="addressNeighborhood" placeholder="bairro" type='text' value={formValues.address.neighborhood} />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={6}>
                                        <Field name="address.city" validate={value => validate('estado', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.city') && getIn(form.touched, 'address.city')} isRequired mb='5px'
                                                    onChange={e => setFormValues({ ...formValues, address: { city: e.target.value } })}>
                                                    <FormLabel fontSize='12px' htmlFor="addressCity">Cidade</FormLabel>
                                                    <Input {...field} id="addressCity" placeholder="cidade" type='text' value={formValues.address.city} />
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>

                                    <GridItem colSpan={6}>
                                        <Field name="address.state" validate={value => validate('estado', value)}>
                                            {({ field, form }) => (
                                                <FormControl isInvalid={getIn(form.errors, 'address.state') && getIn(form.touched, 'address.state')} isRequired mb='5px'
                                                    onChange={e => setFormValues({ ...formValues, address: { state: e.target.value } })}>
                                                    <FormLabel fontSize='12px' htmlFor="addressState">Estado</FormLabel>
                                                    <Select {...field} id="addressState" className='select-box' value={formValues.address.state}>
                                                        <option value=''>Selecione</option>
                                                        <option value='SP'>SP</option>
                                                        <option value='RJ'>RJ</option>
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </GridItem>
                                </Grid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Form>
            )}
        </Formik>
    )
}