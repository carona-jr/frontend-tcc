import cookie from 'cookie'
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { useApolloClient, useMutation } from '@apollo/client'
import { Button, Flex, useDisclosure, BreadcrumbItem, BreadcrumbLink, Text, useToast, Box, Input } from '@chakra-ui/react'
import Board from 'react-trello'
import { isNull } from 'lodash'
import { GET_ALL_CONTRACT, GET_ALL_CONTRACT_GROUP, UPDATE_CONTRACT } from '../../src/graphql'
import { RiFilePaper2Fill } from 'react-icons/ri'

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
    const [filter, setFilter] = useState('')
    const [firstLoading, setFirstLoading] = useState(true)
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
    const status = ['OPENED', 'PENDING', 'SENDED', 'SIGNED']
    const colorStatus = {
        BG_OPENED: 'var(--chakra-colors-yellow-100)',
        BG_PENDING: 'var(--chakra-colors-cyan-100)',
        BG_SENDED: 'var(--chakra-colors-red-100)',
        BG_SIGNED: 'var(--chakra-colors-green-100)',
        CO_OPENED: 'var(--chakra-colors-yellow-800)',
        CO_PENDING: 'var(--chakra-colors-cyan-800)',
        CO_SENDED: 'var(--chakra-colors-red-800)',
        CO_SIGNED: 'var(--chakra-colors-green-800)'
    }
    const nameStatus = {
        OPENED: 'Aberto',
        PENDING: 'Preparação',
        SENDED: 'Enviado',
        SIGNED: 'Assinado'
    }

    async function getContracts(text = null, reload = false, skip = 0, limit = 10, lane = null) {
        let contractsInput = {
            skip: skip,
            limit: limit,
            groupBy: 'status'
        }

        if (!isNull(text)) {
            contractsInput.filterBy = encodeURI(JSON.stringify({
                title: { $regex: text, $options: 'i' }
            }))
        }

        const response = await client.query({
            query: GET_ALL_CONTRACT_GROUP,
            variables: { contractsInput },
            fetchPolicy: 'no-cache'
        })
        const responseData = response.data.contracts.data
        let contractCards = {
            OPENED: [],
            PENDING: [],
            SENDED: [],
            SIGNED: []
        }

        status.map(st => {
            const data = responseData.find(x => x._id == st)

            if (data) {
                const cards = data.contractsByGroup

                contractCards[st] = cards.map(card => ({
                    ...card,
                    id: card._id,
                    description: card.subtitle,
                    tags: [{ bgcolor: colorStatus[`BG_${st}`], color: colorStatus[`CO_${st}`], title: st }],
                    label: getDate(card.createdAt)
                }))
            }
        })

        let lanes = []
        if (lane == null || reload) {
            status.map(st => {
                lanes.push({
                    id: st,
                    title: nameStatus[st],
                    label: `${contractCards[st].length} itens`,
                    cards: contractCards[st]
                })
            })
        } else {
            status.map(st => {
                const data = contracts.lanes.find(x => x.id == st)

                if (lane != st)
                    return lanes.push(data)

                lanes.push({
                    id: st,
                    title: nameStatus[st],
                    label: `${parseInt(data.label.split(' ')[0]) + contractCards[st].length} itens`,
                    cards: [...data.cards, ...contractCards[st]]
                })
            })
        }

        setContracts({ lanes })
    }

    function handleScroll(requestedPage, laneId) {
        return new Promise((res, rej) => {
            try {
                getContracts(filter, false, requestedPage * 10 - 10, requestedPage * 10, laneId)
                res(true)
            } catch {
                rej(false)
            }
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
            console.log(contract)
            const response = await updateContract({ variables: { updateContractInput: contract } })
            console.log(response)
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

    function handleChangeStatus(cardId, sourceLaneId, targetLaneId) {
        handleCardUpdate({
            id: cardId,
            status: targetLaneId
        })
    }

    useEffect(() => {
        if (firstLoading) {
            getContracts()
            return setFirstLoading(false)
        }

        const timeOutId = setTimeout(() => getContracts(filter, true), 800)
        return () => clearTimeout(timeOutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    const breadcrumbItens = [
        <BreadcrumbItem key="1">
            <BreadcrumbLink href="/contract">
                <Flex alignItems="center">
                    <RiFilePaper2Fill className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">Contrato</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout token={token} router={router} title="Contratos" breadcrumbs={breadcrumbItens}>
            <ContractForm
                isOpen={isAddOpen}
                onClose={onAddClose}
                getContracts={getContracts}
                data={formData}
                method={formMethod}
                router={router}
            />
            <DefaultModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                handleSuccess={() => handleDelete(null, true)}
                loading={isDeleteLoading}
            >
                <Text>Você deseja apagar este registro?</Text>
            </DefaultModal>

            <Flex justifyContent="space-between" mb='1' w='100%'>
                <Box w='100%'>
                    <Input value={filter || ''} w='30%' placeholder="pesquise..." onChange={e => setFilter(e.target.value)} />
                </Box>
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
                onLaneScroll={(requestedPage, laneId) => handleScroll(requestedPage, laneId)}

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