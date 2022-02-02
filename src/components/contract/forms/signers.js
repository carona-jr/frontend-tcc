/* eslint-disable no-unused-vars */
import {
    Button,
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
    useToast
} from '@chakra-ui/react'

import AsyncCreatableSelect from 'react-select/async-creatable'
import { useQuery, useMutation } from '@apollo/client'
import _pick from 'lodash/pick'

import { useSelector } from 'react-redux'
import { useState, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { createObjectID } from 'mongo-object-reader'
import { NEW_SIGNER, UPDATE_SIGNER, FIND_USERS, ME } from '../../../graphql'
import { useRouter } from 'next/router'
import { cpf } from 'cpf-cnpj-validator'
import validator from 'validator'
import InputMask from 'react-input-mask'

import _omit from 'lodash/omit'

export default function Signers({ isOpen, onClose, data, method, list, setList }) {

    const formRef = useRef()
    const { query: { slug } } = useRouter()
    const toast = useToast()
    const user = useSelector(state => state.User)
    const [addSigner] = useMutation(NEW_SIGNER)
    const [updateSigner] = useMutation(UPDATE_SIGNER)
    const [saving, setSaving] = useState(false)
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        document: ''
    })

    function handleSubmit() {
        if (formRef.current)
            formRef.current.handleSubmit()
    }

    function validate(type, value) {
        let error

        if (!value)
            error = `${type} é obrigatório`

        if (type === 'document' && !cpf.isValid(value))
            error = 'CPF inválido'

        if (type == 'email' && !validator.isEmail(value))
            error = `Email inválido`

        return error
    }

    const filterUser = inputValue => {
        const selected = userOptions.filter(i =>
            i.label?.toLowerCase().includes(inputValue.toLowerCase())
        )

        if (selected.length > 0) return selected

        return [{ label: inputValue, value: inputValue, name: inputValue }]
    }

    const promiseOptions = inputValue =>
        new Promise(resolve => {
            setTimeout(() => {
                resolve(filterUser(inputValue))
            }, 1000)
        })

    let userOptions = []

    const { data: findUsers } = useQuery(FIND_USERS, {
        variables: {
            userInputs: {
                skip: 0,
                limit: 50
            }
        }
    })

    const { data: queryMe } = useQuery(ME)

    if (queryMe) {
        const selectableUsers = queryMe.me.supervised.map(user => ({ label: user.name, value: user._id, ..._pick(user, ['document', 'email', 'name', '_id']) }))
        selectableUsers.push({ label: queryMe.me.name, value: queryMe.me._id, ..._pick(queryMe.me, ['document', 'email', 'name', '_id']) })

        userOptions = selectableUsers
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Nova Parte</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Formik
                        initialValues={data}
                        innerRef={formRef}
                        onSubmit={async (values, actions) => {
                            const _values =
                                { userId: values._id, ..._pick(values, ['name', 'document', 'email']) }

                            try {
                                setSaving(true)

                                if (method == 'CREATE') {
                                    const response = await addSigner({
                                        variables: {
                                            signerInput: {
                                                contractId: slug,
                                                ..._values
                                            }
                                        }
                                    })

                                    if (response.data.setSigner.code != 200)
                                        throw new Error()
                                }
                                else {
                                    const res = await updateSigner({
                                        variables: {
                                            signId: data._id,
                                            signerInput: {
                                                contractId: slug,
                                                ..._values
                                            }
                                        }
                                    })
                                }

                                if (method == 'CREATE') {
                                    setList([...list, {
                                        ..._values,
                                        _id: createObjectID(),
                                        createdAt: new Date().getTime(),
                                        signerStatus: 'NOT_SIGNED'
                                    }])
                                } else {
                                    const data = list.find(x => x.userId == values.userId)

                                    data.name = _values.name
                                    data.email = _values.email
                                    data.document = _values.document

                                }

                                toast({
                                    title: "Sucesso.",
                                    description: `Nova parte ${method == 'CREATE' ? 'adicionada' : 'alterada'} com sucesso.`,
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true
                                })
                            } catch (e) {
                                toast({
                                    title: "Erro.",
                                    description: `Erro ao ${method == 'CREATE' ? 'adicionar' : 'alterar'} a parte interessada.`,
                                    status: "error",
                                    duration: 3000,
                                    isClosable: true
                                })
                            } finally {
                                setSaving(false)
                                onClose()
                                actions.setSubmitting(false)
                            }
                        }}
                    >
                        {props => (
                            <Form>
                                <Field name="name" validate={value => validate('nome', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.name && form.touched.name} isRequired mb='25px'>
                                            <FormLabel htmlFor="name">Nome</FormLabel>
                                            {/* <Input {...field} id="name" placeholder="joão da silva" type='text' autoFocus /> */}
                                            <AsyncCreatableSelect
                                                cacheOptions
                                                defaultOptions
                                                loadOptions={promiseOptions}
                                                onChange={values => {
                                                    const _values = _omit(values, ['label', 'values'])
                                                    Object.keys(_values).forEach(key => { props.setFieldValue(key, _values[key])})

                                                    setFormValues({
                                                        ...formValues,
                                                        ...values
                                                    })
                                                }}
                                                onCreateOption={ values => {
                                                    props.setFieldValue('name', values)
                                                    userOptions.push({ label: values, value: values, name: values })
                                                    promiseOptions(values)
                                                }}
                                            />
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="email" validate={value => validate('email', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.email && form.touched.email} isRequired mb='25px'>
                                            <FormLabel htmlFor="email">E-mail</FormLabel>
                                            <Input {...field} id="email" placeholder="joao@examplo.com" type='text' />
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="document" validate={value => validate('document', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.document && form.touched.document} isRequired mb='25px'
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
                                            <FormLabel htmlFor="document">Documento</FormLabel>
                                            <InputMask {...field} mask={formValues.document.length < 15 ? '999.999.999-999' : '99.999.999/9999-99'} maskChar='' value={formValues.document}>
                                                {inputProps => <Input {...inputProps} id="document" placeholder="123.456.789-11" type='text' maxLength='20' />}
                                            </InputMask>
                                        </FormControl>
                                    )}
                                </Field>
                            </Form>
                        )}
                    </Formik>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={saving}>
                        Salvar
                    </Button>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}