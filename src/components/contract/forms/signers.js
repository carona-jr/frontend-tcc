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
import { useSelector } from 'react-redux'
import { useState, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { createObjectID } from 'mongo-object-reader'
import { useMutation } from '@apollo/client'
import { NEW_SIGNER, UPDATE_CONTRACT } from '../../../graphql'
import { useRouter } from 'next/router'

export default function Signers({ isOpen, onClose, data, method, list, setList }) {

    const formRef = useRef()
    const { query: { slug } } = useRouter()
    const toast = useToast()
    const user = useSelector(state => state.User)
    const [addSigner] = useMutation(NEW_SIGNER)
    // const [updateContract] = useMutation(UPDATE_CONTRACT)
    const [saving, setSaving] = useState(false)

    function handleSubmit() {
        if (formRef.current)
            formRef.current.handleSubmit()
    }

    function validate(type, value) {
        let error

        if (!value)
            error = `${type} é obrigatório`

        return error
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
                            try {
                                setSaving(true)

                                if (method == 'CREATE') {
                                    const response = await addSigner({
                                        variables: {
                                            signerInput: {
                                                contractId: slug,
                                                ...values
                                            }
                                        }
                                    })

                                    if (response.data.setSigner.code != 200)
                                        throw new Error()
                                }
                                // else {
                                //     const response = await updateContract({ variables: { updateContractInput: { ...values } } })

                                //     if (response.data.updateContract.code != 200)
                                //         throw new Error()
                                // }

                                if (method == 'CREATE') {
                                    setList([...list, {
                                        ...values,
                                        _id: createObjectID(),
                                        createdAt: new Date().getTime(),
                                        signerStatus: 'NOT_SIGNED'
                                    }])
                                } else {
                                    const data = list.find(x => x._id == values._id)

                                    data.name = values.name
                                    data.email = values.email
                                    data.document = values.document
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
                                            <Input {...field} id="name" placeholder="joão da silva" type='text' autoFocus />
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="email" validate={value => validate('descrição', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.email && form.touched.email} isRequired mb='25px'>
                                            <FormLabel htmlFor="email">E-mail</FormLabel>
                                            <Input {...field} id="email" placeholder="joao@examplo.com" type='text' />
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="document" validate={value => validate('descrição', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.document && form.touched.document} isRequired mb='25px'>
                                            <FormLabel htmlFor="document">Documento</FormLabel>
                                            <Input {...field} id="document" placeholder="joao@examplo.com" type='text' />
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