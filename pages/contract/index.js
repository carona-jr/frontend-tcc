import cookie from 'cookie'
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { Button, Flex, useDisclosure, Text, useToast } from '@chakra-ui/react'
import Board from 'react-trello'
import { GET_ALL_CONTRACT, UPDATE_CONTRACT } from '../../src/graphql'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import ContractForm from '../../src/components/contract/form'
import DefaultModal from '../../src/components/modal'
import { getDate } from '../../src/utils'

export default function Contract({ token }) {
    const router = useRouter()
    const toast = useToast()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [deleteCallback, setDeleteCallback] = useState(null)
    const [isDeleteLoading, setDeleteLoading] = useState(true)
    const [updateContract] = useMutation(UPDATE_CONTRACT)
    const [formData, setFormData] = useState({ title: '', subtitle: '' })
    const [formMethod, setFormMethod] = useState('CREATE')
    const [contracts, setContracts] = useState({
        lanes: [
            {
                id: 'ABERTO',
                title: 'Abertos',
                label: '0/0',
                cards: []
            },
            {
                id: 'PREPARACAO',
                title: 'Preparação',
                label: '0/0',
                cards: []
            },
            {
                id: 'ENVIADO',
                title: 'Enviado',
                label: '0/0',
                cards: []
            },
            {
                id: 'ASSINADO',
                title: 'Assinado',
                label: '0/0',
                cards: []
            }
        ]
    })
    const data = useMemo(() => contracts, [contracts])
    const client = useApolloClient()

    async function getContracts() {
        const response = await client.query({
            query: GET_ALL_CONTRACT,
            variables: {
                skip: 0,
                limit: 1,
                status: 'OPENED'
            },
            fetchPolicy: 'no-cache'
        })

        response.data.contracts.data.map(v => {
            v.description = v.subtitle
            v.tags = [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: v.status }]
            v.label = getDate(v.createdAt)
        })

        const responsePending = await client.query({
            query: GET_ALL_CONTRACT,
            variables: {
                skip: 0,
                limit: 1,
                status: 'PENDING'
            },
            fetchPolicy: 'no-cache'
        })

        responsePending.data.contracts.data.map(v => {
            v.description = v.subtitle
            v.tags = [{ bgColor: 'var(--chakra-colors-yellow-100)', color: 'var(--chakra-colors-yellow-800)', title: v.status }]
            v.label = getDate(v.createdAt)
        })

        setContracts({
            lanes: [
                {
                    id: 'OPENED',
                    title: 'Abertos',
                    label: `${response.data.contracts.data.length > 0 ? response.data.contracts.data.length + 1 : 0} itens`,
                    cards: response.data.contracts.data
                },
                {
                    id: 'PENDING',
                    title: 'Preparação',
                    label: `${responsePending.data.contracts.data.length > 0 ? responsePending.data.contracts.data.length + 1 : 0} itens`,
                    cards: responsePending.data.contracts.data
                },
                {
                    id: 'SIGNED',
                    title: 'Assinado',
                    label: '0/0',
                    cards: []
                },
                {
                    id: 'SENDEND',
                    title: 'Enviado',
                    label: '0/0',
                    cards: []
                }
            ]
        })
    }

    function handleDelete(callback, isDeleteConfirm = false) {
        if (!isDeleteConfirm) {
            setDeleteLoading(false)
            setDeleteCallback(() => callback)
            return onDeleteOpen()
        }

        onDeleteClose()
        deleteCallback()
        setDeleteLoading(true)
        setDeleteCallback(null)
    }

    function handleApiDelete(cardId) {
        handleCardUpdate({
            id: cardId,
            active: false
        })
    }

    async function handleCardUpdate(contract) {
        try {
            const response = await updateContract({ variables: { updateContractInput: contract } })

            if (response.data.updateContract.code != 200)
                throw new Error()

            toast({
                title: "Sucesso.",
                description: "Contrato alterado com sucesso.",
                status: "success",
                duration: 3000,
                isClosable: true
            })
        } catch {
            toast({
                title: "Erro.",
                description: "Erro ao alterar o contrato.",
                status: "error",
                duration: 3000,
                isClosable: true
            })
        } finally {
            getContracts()
        }
    }

    function handleClick(cardId, laneId) {
        try {
            const cards = data.lanes.find(x => x.id == laneId).cards
            const card = cards.find(x => x.id == cardId)
            setFormMethod('UPDATE')
            setFormData({ title: card.title, subtitle: card.subtitle, id: card.id })
            onAddOpen()
        } catch (e) {
            console.log(e)
        }
    }

    function handleChangeStatus(cardId, sourceLaneId, targetLaneId, position, cardDetails) {
        console.log(cardId, sourceLaneId, targetLaneId, position, cardDetails)
        handleCardUpdate({
            id: cardId,
            status: targetLaneId
        })
    }

    useEffect(() => {
        getContracts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout token={token} router={router} title="Contratos">
            <ContractForm
                isOpen={isAddOpen}
                onClose={onAddClose}
                getContracts={getContracts}
                data={formData}
                method={formMethod}
            />
            <DefaultModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                handleSuccess={() => handleDelete(null, true)}
                loading={isDeleteLoading}
            >
                <Text>Você deseja apagar este registro?</Text>
            </DefaultModal>

            <Flex justifyContent="flex-end" mb='1'>
                <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => {
                        setFormData({ title: '', subtitle: '' })
                        setFormMethod('CREATE')
                        onAddOpen()
                    }}
                >
                    Novo
                </Button>
            </Flex>
            <Board
                data={data}
                style={{ backgroundColor: '#fff', display: 'flex', justifyContent: 'center', height: '650px' }}
                laneStyle={{ width: '24.5%', maxHeight: '70vh' }}
                onBeforeCardDelete={callback => { handleDelete(callback, false) }}
                onCardDelete={cardId => { handleApiDelete(cardId) }}
                onCardClick={(cardId, metadata, laneId) => handleClick(cardId, laneId)}
                handleDragEnd={(cardId, sourceLaneId, targetLaneId, position, cardDetails) => handleChangeStatus(cardId, sourceLaneId, targetLaneId, position, cardDetails)}
            />
        </Layout>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (!cookies.token || cookies.token == 'undefined')
        return {
            redirect: {
                destination: '/signin',
                permanent: false
            }
        }

    return {
        props: {
            token: cookies.token
        }
    }
}