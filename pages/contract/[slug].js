import cookie from 'cookie'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { Button, Flex, BreadcrumbItem, BreadcrumbLink, Text, useToast, useDisclosure, Textarea } from '@chakra-ui/react'
import { GET_CONTRACT_BY_ID } from '../../src/graphql'
import { getApolloClient } from '../../lib/apolloNextClient'
import { RiFilePaper2Fill } from 'react-icons/ri'
import { FaSearch } from 'react-icons/fa'
import { DragDropContext } from 'react-beautiful-dnd'
import ClauseColumn from '../../src/components/contract/clauses/column'
import { createObjectID } from 'mongo-object-reader'
import { pdf } from '@react-pdf/renderer'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import DefaultModal from '../../src/components/modal'
import ContractPDF from '../../src/pdf/contract'

export default function Contract({ token, data }) {
    const router = useRouter()
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const [isAddLoading, setAddLoading] = useState(false)
    const [textAreaInvalid, setTextAreaInvalid] = useState(false)
    const [textClause, setTextClause] = useState({ _id: '', content: '' })
    const client = useApolloClient()

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

    function handleAdd() {
        try {
            if (textClause.content == '')
                return setTextAreaInvalid(true)

            setTextAreaInvalid(false)
            setAddLoading(true)

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
            setAddLoading(false)
            onAddClose()
        } catch (e) {
            console.log(e)
        }
    }

    function handleEdit(cardId) {
        const data = clauses.cards[cardId]
        setTextClause(data)
        onAddOpen()
    }

    function handleDelete(cardId) {
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
                isOpen={isAddOpen}
                onClose={onAddClose}
                handleSuccess={() => handleAdd()}
                loading={isAddLoading}
                size='2xl'
                btnSuccessText='Salvar'
                btnCancelText='Cancelar'
            >
                <Textarea id="text" placeholder="sua cláusula" value={textClause.content} onChange={e => setTextClause({ ...textClause, content: e.target.value })} autoFocus border={textAreaInvalid ? '1.5px solid red !important' : '1px solid'} />
            </DefaultModal>

            <Flex justifyContent="flex-end" mb='4' w='100%'>
                <Button
                    colorScheme="linkedin"
                    variant="outline"
                    mr='5'
                    onClick={async () => {
                        const blob = await pdf(ContractPDF({ contract: data, clauses: clauses.cards, order: clauses.columns.clause.cardIds })).toString()
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
                    colorScheme="linkedin"
                    variant="outline"
                    onClick={() => {
                        setTextClause({ _id: '', content: '' })
                        onAddOpen()
                    }}
                >
                    Novo
                </Button>
            </Flex>
            <DragDropContext onDragEnd={onDragEnd}>
                {clauses.columnOrder.map(columnId => {
                    const column = clauses.columns[columnId]
                    const cards = column.cardIds.map(_id => clauses.cards[_id])

                    return <ClauseColumn key={column.id} column={column} cards={cards} handleEdit={handleEdit} handleDelete={handleDelete} />
                })}
            </DragDropContext>
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