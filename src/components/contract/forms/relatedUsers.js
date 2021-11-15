/* eslint-disable no-unused-vars */
import {
    FormControl,
    FormLabel,
    Input,
    useToast
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { useState, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import { useMutation } from '@apollo/client'
import { NEW_CONTRACT, UPDATE_CONTRACT } from '../../../graphql'

export default function RelatedUsers({ data, method }) {
    const formRef = useRef()
    const toast = useToast()
    const user = useSelector(state => state.User)
    // const [addContract] = useMutation(NEW_CONTRACT)
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
        <Formik
            initialValues={data}
            innerRef={formRef}
            onSubmit={async (values, actions) => {
                try {
                    setSaveContracts(true)

                    // if (method == 'CREATE') {
                    //     const response = await addContract({
                    //         variables: {
                    //             contractInput: {
                    //                 ...values,
                    //                 ownerId: user._id,
                    //                 status: 'OPENED'
                    //             }
                    //         }
                    //     })

                    //     if (response.data.createContract.code != 200)
                    //         throw new Error()
                    // } else {
                    //     const response = await updateContract({ variables: { updateContractInput: { ...values } } })

                    //     if (response.data.updateContract.code != 200)
                    //         throw new Error()
                    // }

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
    )
}