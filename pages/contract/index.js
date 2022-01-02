// React
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useSelector } from 'react-redux'

// GraphQL
import { useApolloClient, useMutation } from '@apollo/client'
import { GET_ALL_CONTRACT_GROUP, UPDATE_CONTRACT, GET_FIELDS, GET_CONTRACT_BY_ID } from '../../src/graphql'

// Icons
import { RiFilePaper2Fill } from 'react-icons/ri'

// Others
import cookie from 'cookie'
import Board from 'react-trello'
import { isNull } from 'lodash'
import { pdf } from '@react-pdf/renderer'
import { Button, Flex, useDisclosure, BreadcrumbItem, BreadcrumbLink, Text, useToast, Box, Input } from '@chakra-ui/react'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import ContractForm from '../../src/components/contract/forms/contract'
import DefaultModal from '../../src/components/modal'
import { getDate } from '../../src/utils'
import { contractStatus as status, contractColorStatus as colorStatus, contractNameStatus as nameStatus } from '../../src/utils/constants'
import ContractPDF from '../../src/pdf/contract'

export default function Contract({ token }) {
    // General
    const router = useRouter()
    const toast = useToast()
    const [firstLoading, setFirstLoading] = useState(true)
    const client = useApolloClient()
    const user = useSelector(state => state.User)

    // Contract
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const [formData, setFormData] = useState({ title: '', subtitle: '' })
    const [formMethod] = useState('CREATE')
    const [updateContract] = useMutation(UPDATE_CONTRACT)
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [deleteCallback, setDeleteCallback] = useState(null)
    const [isDeleteLoading, setDeleteLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [contractTotal, setContractTotal] = useState({
        OPENED: 0,
        PENDING: 0,
        SENDED: 0,
        SIGNED: 0,
        PAGE_OPENED: 1,
        PAGE_PENDING: 1,
        PAGE_SENDED: 1,
        PAGE_SIGNED: 1
    })

    // Kanban
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
        let total = {
            OPENED: 0,
            PENDING: 0,
            SENDED: 0,
            SIGNED: 0
        }

        status.map(st => {
            const data = responseData.find(x => x._id == st)

            if (data) {
                const cards = data.contractsByGroup
                total[st] = data.total

                contractCards[st] = cards.map(card => ({
                    ...card,
                    id: card._id,
                    description: card.subtitle,
                    tags: [
                        { bgcolor: 'transparent', color: '#000', title: `Criado por ${card.ownerId.name}` },
                        { bgcolor: colorStatus[`BG_${st}`], color: colorStatus[`CO_${st}`], title: st }],
                    label: getDate(card.createdAt)
                }))
            }
        })

        let lanes = []
        if (lane == null || reload) {
            setContractTotal({
                ...total,
                PAGE_OPENED: 1,
                PAGE_PENDING: 1,
                PAGE_SENDED: 1,
                PAGE_SIGNED: 1
            })
            status.map(st => {
                lanes.push({
                    id: st,
                    title: nameStatus[st],
                    label: `${total[st]} itens`,
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
                    label: `${total[st]} itens`,
                    cards: [...data.cards, ...contractCards[st]]
                })
            })
        }

        setContracts({ lanes })
    }

    function handleScroll(_, laneId) {
        return new Promise((res, rej) => {
            try {
                const totalLaneId = parseInt(contractTotal[laneId])
                const totalPageLaneId = parseInt(totalLaneId / 10)
                const currentPage = contractTotal[`PAGE_${laneId}`]
                const totalPage = totalLaneId % 10 == 0 ? totalPageLaneId : totalPageLaneId + 1

                if (currentPage < totalPage) {
                    const nextPage = currentPage + 1
                    getContracts(filter, false, nextPage * 10 - 10, 10, laneId)
                    setContractTotal({
                        ...contractTotal,
                        [`PAGE_${laneId}`]: nextPage
                    })
                }
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
            const response = await updateContract({ variables: { updateContractInput: contract } })
            if (response.data.updateContract.code != 200)
                throw new Error(response.data.updateContract.message)

            toast({
                title: "Sucesso.",
                description: response.data.updateContract.message,
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
            getContracts()
        }
    }

    async function handleChangeStatus(cardId, sourceLaneId, targetLaneId) {
        if (targetLaneId == 'SIGNED') {
            const response = await client.query({
                query: GET_CONTRACT_BY_ID,
                variables: { _id: cardId }
            })
            const contract = response.data.contract.data[0]
            const clauses = await client.query({
                query: GET_FIELDS,
                variables: { contractId: cardId }
            })

            const initialClauseOrder = []
            let initialClauses = {}
            Array.from(clauses.data.fields.data).map(clause => {
                initialClauseOrder.push(clause._id)
                initialClauses[clause._id] = {
                    _id: clause._id,
                    content: clause.text
                }
            })

            const blob = await pdf(ContractPDF({
                contract,
                clauses: initialClauses,
                order: initialClauseOrder,
                signers: contract.signers
            })).toString()
            const base64 = Buffer.from(blob).toString('base64')

            return handleCardUpdate({
                id: cardId,
                status: targetLaneId,
                base64
            })
        }

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
            <Head>
                <title>Contrato - Quadro</title>
            </Head>

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
                onCardClick={(cardId, metadata, laneId) => window.open(`/contract/${cardId}`, '_blank')}
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