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
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../layout'))
import { useSelector } from 'react-redux'
import { useState, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { useMutation } from '@apollo/client'
import { NEW_CONTRACT, UPDATE_CONTRACT } from '../../graphql'

export default function ContractForm({ isOpen, onClose, getContracts, data, method }) {
    const formRef = useRef()
    const toast = useToast()
    const user = useSelector(state => state.User)
    const [addContract] = useMutation(NEW_CONTRACT)
    const [updateContract] = useMutation(UPDATE_CONTRACT)
    const [savingContract, setSaveContracts] = useState(false)

    function handleSubmitContract() {
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
                <ModalHeader>Novo Contrato</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Formik
                        initialValues={data}
                        innerRef={formRef}
                        onSubmit={async (values, actions) => {
                            try {
                                setSaveContracts(true)

                                if (method == 'CREATE') {
                                    const response = await addContract({
                                        variables: {
                                            contractInput: {
                                                ...values,
                                                ownerId: user._id,
                                                status: 'OPENED'
                                            }
                                        }
                                    })

                                    if (response.data.createContract.code != 200)
                                        throw new Error()
                                } else {
                                    const response = await updateContract({ variables: { updateContractInput: { ...values } } })

                                    if (response.data.updateContract.code != 200)
                                        throw new Error()
                                }

                                toast({
                                    title: "Sucesso.",
                                    description: `Contrato ${method == 'CREATE' ? 'adicionado' : 'alterado'} com sucesso.`,
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true
                                })
                            } catch (e) {
                                toast({
                                    title: "Erro.",
                                    description: `Erro ao ${method == 'CREATE' ? 'adicionar' : 'alterar'} o contrato.`,
                                    status: "error",
                                    duration: 3000,
                                    isClosable: true
                                })
                            } finally {
                                setSaveContracts(false)
                                onClose()
                                getContracts()
                                actions.setSubmitting(false)
                            }
                        }}
                    >
                        {props => (
                            <Form>
                                <Field name="title" validate={value => validate('título', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.title && form.touched.title} isRequired mb='25px'>
                                            <FormLabel htmlFor="title">Título</FormLabel>
                                            <Input {...field} id="title" placeholder="seu contrato" type='text' autoFocus />
                                        </FormControl>
                                    )}
                                </Field>
                                <Field name="subtitle" validate={value => validate('descrição', value)}>
                                    {({ field, form }) => (
                                        <FormControl isInvalid={form.errors.subtitle && form.touched.subtitle} isRequired mb='25px'>
                                            <FormLabel htmlFor="subtitle">Subtítulo</FormLabel>
                                            <Input {...field} id="subtitle" placeholder="descreva o seu contrato" type='text' />
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
    )
}