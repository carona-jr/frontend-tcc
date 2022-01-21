// React
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useSelector } from 'react-redux'

// GraphQL
import { useApolloClient, useMutation } from '@apollo/client'
import { GET_ALL_CONTRACT_GROUP, UPDATE_CONTRACT, GET_FIELDS, GET_CONTRACT_BY_ID, ESTIMATE_CONTRACT } from '../../src/graphql'

// Icons
import { RiFilePaper2Fill } from 'react-icons/ri'

// Others
import cookie from 'cookie'
import Board from 'react-trello'
import { isNull, round } from 'lodash'
import { pdf } from '@react-pdf/renderer'
import { Button, Flex, useDisclosure, BreadcrumbItem, BreadcrumbLink, Text, useToast, Box, Input } from '@chakra-ui/react'
import { currencyFormatter, getDate } from '../../src/utils'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import ContractForm from '../../src/components/contract/forms/contract'
import DefaultModal from '../../src/components/modal'
import { contractStatus as status, contractColorStatus as colorStatus, contractNameStatus as nameStatus, transactionNameStatus, transactionColorStatus } from '../../src/utils/constants'
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
    const [estimateContract] = useMutation(ESTIMATE_CONTRACT)
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [deleteCallback, setDeleteCallback] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [filter, setFilter] = useState('')
    const [contractToSign, setContractToSign] = useState({ contractId: '', gasPrice: 0, tax: 0, reservedValue: 0, total: 0 })
    const { isOpen: isEstimatedGasOpen, onOpen: onEstimatedGasOpen, onClose: onEstimatedGasClose } = useDisclosure()
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

                contractCards[st] = cards.map(card => {
                    let cardValue = {
                        ...card,
                        id: card._id,
                        description: card.subtitle,
                        tags: [{ bgcolor: 'transparent', color: '#000', title: `Criado por ${card.ownerId.name}` }],
                        label: getDate(card.createdAt)
                    }

                    if (st == 'SIGNED') {
                        cardValue.tags.push({
                            bgcolor: transactionColorStatus[`BG_${card.transactionStatus}`],
                            color: transactionColorStatus[`CO_${card.transactionStatus}`],
                            title: card.transactionStatus == 'WAITING' ?
                                currencyFormatter(card.gasPrice + card.tax + card.reservedValue) + '*' : currencyFormatter(card.realGasPrice || 0)
                        })
                        cardValue.tags.push({
                            bgcolor: transactionColorStatus[`BG_${card.transactionStatus}`],
                            color: transactionColorStatus[`CO_${card.transactionStatus}`],
                            title: card.transactionStatus
                        })

                        if (card.transactionStatus == 'APPROVED')
                            cardValue.tags.push({ bgcolor: 'transparent', color: '#000', title: <Box>{`#${card.transactionId}`}</Box> })
                    }
                    else {
                        cardValue.tags.push({ bgcolor: colorStatus[`BG_${st}`], color: colorStatus[`CO_${st}`], title: st })
                    }


                    return cardValue
                })
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
            setLoading(false)
            setDeleteCallback(() => callback)
            return onDeleteOpen()
        }

        onDeleteClose()
        deleteCallback()
        setLoading(true)
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

            if (contractToSign.contractId != '') {
                setContractToSign({ contractId: '', gasPrice: 0, tax: 0, reservedValue: 0, total: 0 })
                setLoading(false)
                onEstimatedGasClose()
            }

            toast({
                title: "Sucesso.",
                description: response.data.updateContract.message,
                status: "success",
                duration: 3000,
                isClosable: true
            })
        } catch (e) {
            setLoading(false)
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

    async function getContractPDF(contractId) {
        const response = await client.query({
            query: GET_CONTRACT_BY_ID,
            variables: { _id: contractId }
        })
        const contract = response.data.contract.data[0]
        const clauses = await client.query({
            query: GET_FIELDS,
            variables: { contractId: contractId }
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

        return Buffer.from(blob).toString('base64')
    }

    async function handleChangeStatus(cardId, sourceLaneId, targetLaneId) {
        if (targetLaneId == 'SIGNED') {
            if (contractToSign.contractId == '') {
                const response = await estimateContract({ variables: { estimateContractInput: { contractId: cardId } } })
                const gasPrice = response.data.estimateContract.data
                const tax = round(gasPrice * 0.30, 2)
                const reservedValue = round(gasPrice * 0.1, 2)
                setContractToSign({
                    contractId: cardId,
                    gasPrice,
                    tax,
                    reservedValue,
                    total: gasPrice + tax + reservedValue
                })
                onEstimatedGasOpen()
            }

            return
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
                loading={isLoading}
            >
                <Text>Você deseja apagar este registro?</Text>
            </DefaultModal>
            <DefaultModal
                isOpen={isEstimatedGasOpen}
                onClose={() => {
                    setContractToSign({ contractId: '', gasPrice: 0, tax: 0, reservedValue: 0, total: 0 })
                    onEstimatedGasClose()
                }}
                handleSuccess={async () => {
                    setLoading(true)
                    handleCardUpdate({
                        id: contractToSign.contractId,
                        status: 'SIGNED',
                        base64: await getContractPDF(contractToSign.contractId),
                        gasPrice: contractToSign.gasPrice,
                        tax: contractToSign.tax,
                        reservedValue: contractToSign.reservedValue
                    })
                }}
                loading={isLoading}
                size='2xl'
                btnSuccessText="Confirmo"
                btnCancelText="Cancelar"
                modalName="Aviso"
            >
                <Text textAlign='justify' mb='4'>
                    Ao enviar o contrato para a Blockchain, o valor abaixo será reservado da sua conta.
                    Após a confirmação da transação na rede, o valor será debitado da sua conta.
                    Ao clicar em confirmar, você concorda com o preço estabelecido e permite que o valor seja reservado da sua conta.
                </Text>
                <Text fontWeight='600'>Estimativa do valor</Text>
                <Flex flexDir='column' alignItems='flex-end'>
                    <Text fontWeight='600' color='green.500' fontSize='1.2rem'>{currencyFormatter(contractToSign.gasPrice)}</Text>
                    <Text fontWeight='600' color='green.500' fontSize='1.2rem'>+ {currencyFormatter(contractToSign.tax)}</Text>
                    <Text fontWeight='600' color='green.500' fontSize='1.2rem'>+ {currencyFormatter(contractToSign.reservedValue)}</Text>
                    <Box w='50%' h='1px' my='2' border='1px solid rgba(0, 0, 0, 0.1)'></Box>
                    <Text fontWeight='600' textTransform='uppercase' color='blackAlpha.700'>
                        Total reservado: <Text d='inline-block' color='blackAlpha.800'>{currencyFormatter(contractToSign.total)}</Text>
                    </Text>
                    <Text fontWeight='600' textTransform='uppercase' color='blackAlpha.700'>
                        Seus créditos: <Text d='inline-block' color='blackAlpha.800'>{currencyFormatter(user.credit)}</Text>
                    </Text>
                    <Text fontWeight='600' textTransform='uppercase' color='blackAlpha.700'>
                        Créditos restantes: <Text d='inline-block' color={user.credit - contractToSign.total < 0 ? 'red.500' : 'green.500'}>{currencyFormatter(user.credit - contractToSign.total)}</Text>
                    </Text>
                </Flex>
                <Text textAlign='justify' mt='6' color='blackAlpha.600' textTransform='uppercase' fontSize='0.8rem'>
                    Obs: 10% do valor será reservado para a variação da estimativa. Este valor será devolvido caso não seja utilizado.
                </Text>
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
        </Layout >
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