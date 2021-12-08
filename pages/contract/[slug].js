// React
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { useApolloClient } from '@apollo/client'
import { getApolloClient } from '../../lib/apolloNextClient'
import { GET_CONTRACT_BY_ID } from '../../src/graphql'

// Icons
import { FaSearch, FaPen, FaTrash, FaBold, FaItalic, FaUnderline, FaCode, FaHeading, FaQuoteLeft, FaListUl, FaListOl } from 'react-icons/fa'
import { RiFilePaper2Fill } from 'react-icons/ri'

// Slate
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

// Others
import cookie from 'cookie'
import { useSelector } from 'react-redux'
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
    Grid,
    GridItem,
    Heading,
    Badge,
    Box
} from '@chakra-ui/react'
import isHotkey from 'is-hotkey'
import { signerColorStatus } from '../../src/utils/constants'

// Components
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('../../src/layout'))
import ContractPDF from '../../src/pdf/contract'
import DefaultModal from '../../src/components/modal'
import Signers from '../../src/components/contract/forms/signers'
import ClauseColumn from '../../src/components/contract/clauses/column'
import { getDate } from '../../src/utils'
import {
    HOTKEYS,
    Element,
    Leaf,
    MarkButton,
    BlockButton,
    toggleMark,
    serialize as objToHtml,
    deserialize as htmlToObj
} from '../../src/components/htmlEditor'

export default function Contract({ token, data }) {
    const router = useRouter()
    const user = useSelector(state => state.User)
    const client = useApolloClient()
    const allowEdit = user._id == data.ownerId && (data.status == 'OPENED' || data.status == 'PENDING')

    // Signers
    const { isOpen: isSignerOpen, onOpen: onSignerOpen, onClose: onSignerClose } = useDisclosure()
    const [isSignerLoading, setSignerLoading] = useState(false)

    // Slate
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
    const renderElement = useCallback(props => <Element {...props} />, [])
    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const [value, setValue] = useState([{
        type: 'paragraph',
        children: [{ text: '' }]
    }])

    // Clauses
    const { isOpen: isAddClauseOpen, onOpen: onAddClauseOpen, onClose: onAddClauseClose } = useDisclosure()
    const [isAddClauseLoading, setAddClauseLoading] = useState(false)
    const [clauseId, setClauseId] = useState('')
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

    // Signers List
    const { isOpen: isAddSignersOpen, onOpen: onAddSignersOpen, onClose: onAddSignersClose } = useDisclosure()
    const [signer, setSigner] = useState({ name: '', email: '', document: '' })
    const [signersMethod, setSignersMethod] = useState('CREATE')
    const [signersList, setSignersList] = useState([{ _id: '256160', userId: '611477fcd5299b005f7ae331', name: 'carlos', email: 'carona_jr@hotmail.com', document: '1451', signerStatus: 'NOT_SIGNED', createdAt: '1638923173' }])

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
            // if (textClause.content == '')
            //     return setTextAreaInvalid(true)

            // setTextAreaInvalid(false)
            setAddClauseLoading(true)

            let data = { ...clauses }, content = ''
            value.map(x => {
                content += objToHtml(x)
            })

            if (clauseId == '') {
                const _id = createObjectID()
                data.cards = {
                    ...clauses.cards,
                    [_id]: { _id, content }
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
                    [clauseId]: { _id: clauseId, content }
                }
            }

            setClauses(data)
            setAddClauseLoading(false)
            onAddClauseClose()
        } catch (e) {
            console.log(e)
        }
    }

    function handleEditClause(cardId, html) {
        try {
            let arr = []
            Array.from(html).map(x => {
                arr.push(htmlToObj(x))
            })
            setValue(arr)
            setClauseId(cardId)
            onAddClauseOpen()
        } catch (e) {
            console.log(e)
        }
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

    function handleSign(_id, status) {
        if (data.status != 'SENDED')
            return

        if (!_id) {
            const s = signersList.find(x => x._id == signer._id)
            s.signerStatus = status
            setSigner(s)
            return onSignerClose()
        }

        const s = signersList.find(x => x._id == _id)
        setSigner(s)
        onSignerOpen()
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
    console.log(data)
    return (
        <Layout token={token} router={router} title={`Detalhe ${data.title}`} breadcrumbs={breadcrumbItens}>
            <Head>
                <title>Contrato - Detalhe</title>
            </Head>

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
                <Slate
                    editor={editor}
                    value={value}
                    onChange={newValue => setValue(newValue)}
                >
                    <Box mb='4'>
                        <MarkButton format="bold" icon={<FaBold />} />
                        <MarkButton format="italic" icon={<FaItalic />} />
                        <MarkButton format="underline" icon={<FaUnderline />} />
                        {/* <MarkButton format="code" icon={<FaCode />} /> */}
                        <BlockButton format="heading-one" icon={<FaHeading />} />
                        <BlockButton format="heading-two" icon={<FaHeading />} />
                        {/* <BlockButton format="block-quote" icon={<FaQuoteLeft />} /> */}
                        <BlockButton format="numbered-list" icon={<FaListOl />} />
                        <BlockButton format="bulleted-list" icon={<FaListUl />} />
                    </Box>
                    <Editable
                        style={{ height: '150px' }}
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder="Escreva a sua cláusula aqui"
                        spellCheck
                        autoFocus
                        onKeyDown={event => {
                            for (const hotkey in HOTKEYS) {
                                if (isHotkey(hotkey, event)) {
                                    event.preventDefault()
                                    const mark = HOTKEYS[hotkey]
                                    toggleMark(editor, mark)
                                }
                            }
                        }}
                    />
                </Slate>
            </DefaultModal>

            <DefaultModal
                modalName="Assinatura"
                isOpen={isSignerOpen}
                onClose={onSignerClose}
                handleSuccess={() => handleSigner()}
                loading={isSignerLoading}
                size='sm'
                btnCancelText='Fechar'
                showSucessButton={false}
            >
                <Flex justifyContent='center'>
                    <Button
                        colorScheme="whatsapp"
                        variant="ghost"
                        mr='5'
                        onClick={() => {
                            handleSign(null, 'SIGNED')
                        }}
                    >
                        Assinar
                    </Button>
                    <Button
                        colorScheme="red"
                        variant="ghost"
                        mr='5'
                        onClick={() => {
                            handleSign(null, 'REFUSED')
                        }}
                    >
                        Recusar
                    </Button>
                </Flex>
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
                        const blob = await pdf(ContractPDF({
                            contract: data,
                            clauses: clauses.cards,
                            order: clauses.columns.clause.cardIds,
                            signers: signersList
                        })).toString()
                        const base64 = Buffer.from(blob).toString('base64')

                        const newTab = window.open("", "_blank")
                        newTab.document.title = `Contrato ${data.title}`
                        newTab.document.write(`<html>
                            <head>
                                <title>Contrato ${data.title}</title>
                            </head>
                            <body style="margin:0 !important">
                                <embed width="100%" height="100%" src="data:application/pdf;base64,${base64}" type="application/pdf" />
                            </body>
                        </html>`)
                    }}
                >
                    PDF
                </Button>
                {
                    allowEdit ? <Button
                        colorScheme="facebook"
                        variant="outline"
                        mr='5'
                        onClick={() => {
                            setSigner({ name: '', email: '', document: '' })
                            setSignersMethod('CREATE')
                            onAddSignersOpen()
                        }}
                    >
                        Nova Assinatura
                    </Button> : <></>
                }
                {
                    allowEdit ? <Button
                        colorScheme="linkedin"
                        variant="outline"
                        onClick={() => {
                            setValue([{
                                type: 'paragraph',
                                children: [{ text: '' }]
                            }])
                            setClauseId('')
                            onAddClauseOpen()
                        }}
                    >
                        Nova Cláusula
                    </Button> : <></>
                }
            </Flex>

            <Box mb="10" mx="6">
                <Text fontSize="16px" mb="6" textTransform="uppercase">Cláusulas</Text>
                {clauses.columns.clause.cardIds.length == 0 ? <Text color='rgba(0, 0, 0, 0.5)'>Não foi adicionada nenhuma cláusula</Text> : <></>}
                <DragDropContext onDragEnd={onDragEnd}>
                    {clauses.columnOrder.map(columnId => {
                        const column = clauses.columns[columnId]
                        const cards = column.cardIds.map(_id => clauses.cards[_id])
                        return <ClauseColumn
                            key={column.id}
                            column={column}
                            cards={cards}
                            handleEdit={handleEditClause}
                            handleDelete={handleDeleteClause}
                            allowEdit={allowEdit}
                        />
                    })}
                </DragDropContext>
            </Box>

            <Box mb="5" mx="6">
                <Text fontSize="16px" mb="3" textTransform="uppercase">Assinaturas</Text>
                {signersList.length == 0 ? <Text color='rgba(0, 0, 0, 0.5)'>Não foi adicionada nenhuma assinatura</Text> : <></>}
                <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                    {
                        signersList.map(s => {
                            return (
                                <GridItem
                                    key={s._id}
                                    colSpan="3"
                                    p="2"
                                    border="1px solid rgba(0, 0, 0, 0.1)"
                                    borderRadius="4"
                                    _hover={{ cursor: 'pointer', backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                                    onClick={() => handleSign(s._id)}
                                >
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
                                                {
                                                    allowEdit ? <Box fontSize="14px" cursor='pointer'>
                                                        <FaPen onClick={() => handleEditSigner(s._id)} style={{ marginBottom: '8px' }} />
                                                        <FaTrash onClick={() => handleDeleteSigner(s._id)} />
                                                    </Box> : user._id == s.userId && data.status == 'SENDED' ? <Button
                                                        colorScheme="whatsapp"
                                                        variant="unstyled"
                                                        mr='2'
                                                    >
                                                        Assinar
                                                    </Button> : <></>
                                                }
                                            </Flex>
                                        </Heading>
                                        <Box mb="2">
                                            <Text style={{ fontSize: '12px', lineHeight: '16px' }}>E-mail: {s.email}</Text>
                                            <Text style={{ fontSize: '12px', lineHeight: '16px' }}>Documento: {s.document}</Text>
                                        </Box>
                                        <Flex direction='row' fontSize="12px" justifyContent='space-between'>
                                            <Text>{getDate(s.createdAt)}</Text>
                                            <Badge
                                                color={signerColorStatus[`CO_${s.signerStatus}`]}
                                                backgroundColor={signerColorStatus[`BG_${s.signerStatus}`]}
                                                lineHeight='24px'>{s.signerStatus}
                                            </Badge>
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