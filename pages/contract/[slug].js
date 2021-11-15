// React
import { useState } from 'react'
import { useRouter } from 'next/router'

// GraphQL
import { useApolloClient } from '@apollo/client'
import { getApolloClient } from '../../lib/apolloNextClient'
import { GET_CONTRACT_BY_ID } from '../../src/graphql'

// Icons
import { FaSearch, FaPen, FaTrash } from 'react-icons/fa'
import { RiFilePaper2Fill } from 'react-icons/ri'

// Others
import cookie from 'cookie'
import { pdf } from '@react-pdf/renderer'
import { DragDropContext } from 'react-beautiful-dnd'
import { createObjectID } from 'mongo-object-reader'
import {
    Button,
    Flex,
    BreadcrumbItem,
    BreadcrumbLink,
    Text,
    useDisclosure,
    Textarea,
    Grid,
    GridItem,
    Heading,
    Badge,
    Box
} from '@chakra-ui/react'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import ContractPDF from '../../src/pdf/contract'
import DefaultModal from '../../src/components/modal'
import Signers from '../../src/components/contract/forms/signers'
import ClauseColumn from '../../src/components/contract/clauses/column'
import { getDate } from '../../src/utils'

export default function Contract({ token, data }) {
    const router = useRouter()
    const client = useApolloClient()

    // Clauses
    const { isOpen: isAddClauseOpen, onOpen: onAddClauseOpen, onClose: onAddClauseClose } = useDisclosure()
    const [isAddClauseLoading, setAddClauseLoading] = useState(false)
    const [textAreaInvalid, setTextAreaInvalid] = useState(false)
    const [textClause, setTextClause] = useState({ _id: '', content: '' })
    const [clauses, setClauses] = useState({
        cards: {},
        columns: {
            clause: {
                id: 'clause',
                title: 'Cláusula',
                cardIds: []
            }
        },
        // Facilitate reordering of the columns
        columnOrder: ['clause']
    })

    // Related Users
    const { isOpen: isAddSignersOpen, onOpen: onAddSignersOpen, onClose: onAddSignersClose } = useDisclosure()
    const [signer, setSigner] = useState({ name: '', email: '', document: '' })
    const [signersMethod, setSignersMethod] = useState('CREATE')
    const [signersList, setSignersList] = useState([{ _id: '256160', name: 'carlos', email: 'carona_jr@hotmail.com', document: '1451', signerStatus: 'pending' }])

    function onDragEnd(result) {
        const { destination, source, draggableId } = result

        if (!destination)
            return

        if (destination.droppableId === source.droppableId && destination.index === source.index)
            return

        const column = clauses.columns[source.droppableId]
        const newCardIds = Array.from(column.cardIds)
        newCardIds.splice(source.index, 1)
        newCardIds.splice(destination.index, 0, draggableId)

        const newColumn = {
            ...column,
            cardIds: newCardIds
        }

        setClauses({
            ...clauses,
            columns: {
                ...clauses.columns,
                [newColumn.id]: newColumn
            }
        })
    }

    function handleAddClause() {
        try {
            if (textClause.content == '')
                return setTextAreaInvalid(true)

            setTextAreaInvalid(false)
            setAddClauseLoading(true)

            let data = { ...clauses }
            if (textClause._id == '') {
                const _id = createObjectID()
                data.cards = {
                    ...clauses.cards,
                    [_id]: { _id, content: textClause.content }
                }
                data.columns = {
                    clause: {
                        ...clauses.columns.clause,
                        cardIds: [...clauses.columns.clause.cardIds, _id]
                    }
                }
            } else {
                data.cards = {
                    ...clauses.cards,
                    [textClause._id]: textClause
                }
            }

            setClauses(data)
            setAddClauseLoading(false)
            onAddClauseClose()
        } catch (e) {
            console.log(e)
        }
    }

    function handleEditClause(cardId) {
        const data = clauses.cards[cardId]
        setTextClause(data)
        onAddClauseOpen()
    }

    function handleDeleteClause(cardId) {
        let data = { ...clauses }
        delete clauses.cards[cardId]

        data.columns = {
            clause: {
                ...clauses.columns.clause,
                cardIds: clauses.columns.clause.cardIds.filter(x => x != cardId)
            }
        }

        setClauses(data)
    }

    function handleEditSigner(_id) {
        const data = signersList.find(x => x._id == _id)
        setSigner(data)
        setSignersMethod('UPDATE')
        onAddSignersOpen()
    }

    function handleDeleteSigner(_id) {
        const list = signersList.filter(x => x._id != _id)
        setSignersList(list)
    }

    const breadcrumbItens = [
        <BreadcrumbItem key="1">
            <BreadcrumbLink href="/contract">
                <Flex alignItems="center">
                    <RiFilePaper2Fill className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">Contrato</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>,
        <BreadcrumbItem key="2">
            <BreadcrumbLink href="#">
                <Flex alignItems="center">
                    <FaSearch className='breadcrumb-item' />
                    <Text display={['none', 'inline']} pl="2">{`Detalhe ${data.title}`}</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout token={token} router={router} title={`Detalhe ${data.title}`} breadcrumbs={breadcrumbItens}>
            <DefaultModal
                modalName="Cláusula"
                isOpen={isAddClauseOpen}
                onClose={onAddClauseClose}
                handleSuccess={() => handleAddClause()}
                loading={isAddClauseLoading}
                size='2xl'
                btnSuccessText='Salvar'
                btnCancelText='Cancelar'
            >
                <Textarea id="text" placeholder="sua cláusula" value={textClause.content} onChange={e => setTextClause({ ...textClause, content: e.target.value })} autoFocus border={textAreaInvalid ? '1.5px solid red !important' : '1px solid'} />
            </DefaultModal>

            <Signers
                isOpen={isAddSignersOpen}
                onClose={onAddSignersClose}
                data={signer}
                list={signersList}
                setList={setSignersList}
                method={signersMethod}
            />

            <Flex justifyContent="flex-end" mb='4' w='100%'>
                <Button
                    colorScheme="gray"
                    variant="outline"
                    mr='5'
                    onClick={async () => {
                        const blob = await pdf(ContractPDF({ contract: data, clauses: clauses.cards, order: clauses.columns.clause.cardIds, signers: signersList })).toString()
                        const base64 = Buffer.from(blob).toString('base64')

                        const newTab = window.open("", "_blank")
                        newTab.document.write(`<html>
                            <body style="margin:0 !important">
                                <embed width="100%" height="100%" src="data:application/pdf;base64,${base64}" type="application/pdf" />
                            </body>
                        </html>`)
                    }}
                >
                    PDF
                </Button>
                <Button
                    colorScheme="facebook"
                    variant="outline"
                    mr='5'
                    onClick={() => {
                        setSigner({ name: '', email: '', document: '' })
                        setSignersMethod('CREATE')
                        onAddSignersOpen()
                    }}
                >
                    Nova Parte
                </Button>
                <Button
                    colorScheme="linkedin"
                    variant="outline"
                    onClick={() => {
                        setTextClause({ _id: '', content: '' })
                        onAddClauseOpen()
                    }}
                >
                    Nova Cláusula
                </Button>
            </Flex>

            <Box mb="5">
                <Text fontSize="16px" mb="3" textTransform="uppercase">Cláusulas</Text>
                {clauses.columns.clause.cardIds.length == 0 ? <Text color='rgba(0, 0, 0, 0.5)'>Não foi adicionada nenhuma cláusula</Text> : <></>}
                <DragDropContext onDragEnd={onDragEnd}>
                    {clauses.columnOrder.map(columnId => {
                        const column = clauses.columns[columnId]
                        const cards = column.cardIds.map(_id => clauses.cards[_id])

                        return <ClauseColumn key={column.id} column={column} cards={cards} handleEdit={handleEditClause} handleDelete={handleDeleteClause} />
                    })}
                </DragDropContext>
            </Box>

            <Box mb="5">
                <Text fontSize="16px" mb="3" textTransform="uppercase">Assinaturas</Text>
                {signersList.length == 0 ? <Text color='rgba(0, 0, 0, 0.5)'>Não foi adicionada nenhuma assinatura</Text> : <></>}
                <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                    {
                        signersList.map(s => {
                            return (
                                <GridItem key={s._id} colSpan="3" p="2" border="1px solid rgba(0, 0, 0, 0.1)">
                                    <Box
                                        as="related-users"
                                        maxW="sm"
                                        p="5"
                                        borderWidth="1px"
                                        borderColor='blackAlpha.100'
                                        rounded="md"
                                        backgroundColor='white'
                                        key={1}
                                    >
                                        <Heading size="md" my="2">
                                            <Flex justifyContent="space-between" alignItems='center'>
                                                <Text>{s.name}</Text>
                                                <Box fontSize="14px" cursor='pointer'>
                                                    <FaPen onClick={() => handleEditSigner(s._id)} style={{ marginBottom: '8px' }} />
                                                    <FaTrash onClick={() => handleDeleteSigner(s._id)} />
                                                </Box>
                                            </Flex>
                                        </Heading>
                                        <Box mb="2">
                                            <Text style={{ fontSize: '12px', lineHeight: '16px' }}>E-mail: {s.email}</Text>
                                            <Text style={{ fontSize: '12px', lineHeight: '16px' }}>Documento: {s.document}</Text>
                                        </Box>
                                        <Flex direction='row' fontSize="12px" justifyContent='space-between'>
                                            <Text>{getDate(s.createdAt)}</Text>
                                            <Badge colorScheme='yellow' lineHeight='24px'>{s.signerStatus}</Badge>
                                        </Flex>
                                    </Box>
                                </GridItem>
                            )
                        })
                    }
                </Grid>
            </Box>

        </Layout>
    )
}

export async function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const url = req.url.split('/')
    const id = url[url.length - 1]

    if (!cookies.token || cookies.token == 'undefined')
        return {
            redirect: {
                destination: '/signin',
                permanent: false
            }
        }

    const apollo = getApolloClient({ token: cookies.token })
    const response = await apollo.query({
        query: GET_CONTRACT_BY_ID,
        variables: { _id: id }
    })

    return {
        props: {
            token: cookies.token,
            data: response.data.contract.data[0]
        }
    }
}