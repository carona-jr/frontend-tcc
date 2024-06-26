// React
import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// GraphQL
import { useApolloClient, useMutation } from '@apollo/client'
import { getApolloClient } from '../../lib/apolloNextClient'
import { GET_CONTRACT_BY_ID, GET_FIELDS, ADD_FIELD, UPDATE_FIELD, ME, REMOVE_SIGNER } from '../../src/graphql'

// Icons
import { FaSearch, FaPen, FaTrash, FaBold, FaItalic, FaUnderline, FaPlus, FaHeading, FaListUl, FaListOl } from 'react-icons/fa'
import { RiFilePaper2Fill, RiPrinterLine } from 'react-icons/ri'
import { MdContentCopy } from 'react-icons/md'

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
import ContractForm from '../../src/components/contract/forms/contract'
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
import SignerModalButton from '../../src/components/contract/SignerModalButton'
import { contractStatus as status, contractColorStatus as colorStatus, contractNameStatus as nameStatus, transactionNameStatus, transactionColorStatus } from '../../src/utils/constants'

export default function Contract({ token, data, querySigner, initialClauseOrder, initialClauses, currenteUserId }) {
    const router = useRouter()
    const user = useSelector(state => state.User)
    const client = useApolloClient()
    const allowEdit = user._id == data.ownerId._id && (data.status == 'OPENED' || data.status == 'PENDING')
    const [addField] = useMutation(ADD_FIELD)
    const [updateField] = useMutation(UPDATE_FIELD)

    // Edit
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
    const [formData, setFormData] = useState({ title: data.title, subtitle: data.subtitle, id: data._id })
    const [formMethod] = useState('UPDATE')

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
        cards: initialClauses,
        columns: {
            clause: {
                id: 'clause',
                title: 'Cláusula',
                cardIds: initialClauseOrder
            }
        },
        // Facilitate reordering of the columns
        columnOrder: ['clause']
    })

    // Sign
    const [removeSigner, { data: removeResult, loading, error }] = useMutation(REMOVE_SIGNER)


    // Signers List
    const { isOpen: isAddSignersOpen, onOpen: onAddSignersOpen, onClose: onAddSignersClose } = useDisclosure()
    const [signer, setSigner] = useState({ name: '', email: '', document: '' })
    const [signersMethod, setSignersMethod] = useState('CREATE')
    const [signersList, setSignersList] = useState(data.signers)

    async function onDragEnd(result) {
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

        await updateField({
            variables: {
                fieldInput: {
                    _id: draggableId,
                    order: newCardIds.indexOf(draggableId) + 1,
                    active: true
                }
            }
        })
    }

    async function handleAddClause() {
        try {
            setAddClauseLoading(true)

            let list = { ...clauses }, content = ''
            value.map(x => {
                content += objToHtml(x)
            })

            // add new field
            if (clauseId == '') {
                const _id = createObjectID()
                list.cards = {
                    ...clauses.cards,
                    [_id]: { _id, content }
                }
                list.columns = {
                    clause: {
                        ...clauses.columns.clause,
                        cardIds: [...clauses.columns.clause.cardIds, _id]
                    }
                }

                await addField({
                    variables: {
                        fieldInput: {
                            _id,
                            order: list.columns.clause.cardIds.length,
                            text: content,
                            contractId: data._id,
                            active: true
                        }
                    }
                })
            } else {
                list.cards = {
                    ...clauses.cards,
                    [clauseId]: { _id: clauseId, content }
                }

                await updateField({
                    variables: {
                        fieldInput: {
                            _id: clauseId,
                            order: list.columns.clause.cardIds.indexOf(clauseId) + 1,
                            text: content,
                            active: true
                        }
                    }
                })
            }

            setClauses(list)
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

    async function handleDeleteClause(cardId) {
        let clauseData = { ...clauses }
        delete clauses.cards[cardId]

        clauseData.columns = {
            clause: {
                ...clauses.columns.clause,
                cardIds: clauses.columns.clause.cardIds.filter(x => x != cardId)
            }
        }

        setClauses(clauseData)

        await updateField({
            variables: {
                fieldInput: {
                    _id: cardId,
                    active: false
                }
            }
        })
    }

    async function handleEditSigner(_id) {
        const data = signersList.find(x => x._id == _id)

        setSigner(data)
        setSignersMethod('UPDATE')
        onAddSignersOpen()
    }

    async function handleDeleteSigner(_id) {
        try {
            await removeSigner({
                variables: {
                    signId: _id,
                    contractId: data._id
                }
            })
        } catch (e) {
            console.error(e)
        }

        const list = signersList.filter(x => x._id != _id)
        setSignersList(list)
    }

    async function handleSign(_id) {
        const data = signersList.find(x => x._id == _id)
        setSigner(data)
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
                    <Text display={['none', 'inline']} pl="2">{`Detalhe ${formData.title}`}</Text>
                </Flex>
            </BreadcrumbLink>
        </BreadcrumbItem>
    ]

    return (
        <Layout
            token={token}
            router={router}
            title={
                <Flex mb="3" alignItems='center'>
                    <Text
                        fontSize={['16px', '16px', '24px']}
                        fontWeight='small'
                        pr='3'
                        lineHeight={['16px', '16px', '24px']}
                        textTransform="uppercase">{`Detalhe ${formData.title}`}
                    </Text>
                    {
                        allowEdit ? <FaPen
                            style={{ fontSize: '16px', cursor: 'pointer' }}
                            onClick={() => {
                                onAddOpen()
                            }}
                        /> : <></>
                    }
                </Flex>
            }
            breadcrumbs={breadcrumbItens}
        >
            <Head>
                <title>Contrato - Detalhe</title>
            </Head>

            <ContractForm
                isOpen={isAddOpen}
                onClose={onAddClose}
                data={formData}
                setData={setFormData}
                method={formMethod}
                router={router}
            />
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

            <Signers
                isOpen={isAddSignersOpen}
                onClose={onAddSignersClose}
                data={signer}
                list={signersList}
                setList={setSignersList}
                method={signersMethod}
            />

            <Flex justifyContent="space-between" mb='4' w='100%'>
                <Box>
                    <Text fontSize={['10px', '12px', '16px']} fontWeight='600' color={colorStatus[`CO_${data.status}`]} display={data.status == 'SIGNED' ? 'none' : 'block'}>
                        {data.status}
                    </Text>
                    <Text fontSize={['10px', '12px', '16px']} fontWeight='600' color={transactionColorStatus[`CO_${data.transactionStatus}`]} display={data.status == 'SIGNED' ? 'block' : 'none'}>
                        {data.transactionStatus}
                    </Text>
                    <Flex alignItems='center' display={data.status == 'SIGNED' ? 'flex' : 'none'}>
                        <Text mr='1' fontSize={['10px', '12px', '16px']} style={{ wordBreak: 'break-all' }}>{data.ethTxHash}</Text>
                        <Button
                            colorScheme="gray"
                            variant='ghost'
                            onClick={() => {
                                const input = document.createElement('input')
                                input.setAttribute('value', data.ethTxHash)
                                document.body.appendChild(input)
                                input.select()
                                const result = document.execCommand('copy')
                                document.body.removeChild(input)
                                return result
                            }}
                        >
                            <MdContentCopy style={{ fontSize: '18px' }} />
                        </Button>
                    </Flex>
                </Box>
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
                        newTab.document.close()
                    }}
                >
                    <RiPrinterLine style={{ fontSize: '24px' }} />
                </Button>
            </Flex>

            <Box mb="10" mx="6">
                <Flex mb="3" alignItems='center'>
                    <Text fontSize="16px" pr='3' lineHeight='16px' textTransform="uppercase">Cláusulas</Text>
                    {
                        allowEdit ? <FaPlus
                            style={{ fontSize: '16px', cursor: 'pointer' }}
                            onClick={() => {
                                setValue([{
                                    type: 'paragraph',
                                    children: [{ text: '' }]
                                }])
                                setClauseId('')
                                onAddClauseOpen()
                            }}
                        /> : <></>
                    }
                </Flex>
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
                <Flex mb="3" alignItems='center'>
                    <Text fontSize="16px" pr='3' lineHeight='16px' textTransform="uppercase">Assinaturas</Text>
                    {
                        allowEdit ? <FaPlus
                            style={{ fontSize: '16px', cursor: 'pointer' }}
                            onClick={() => {
                                setSigner({ name: '', email: '', document: '' })
                                setSignersMethod('CREATE')
                                onAddSignersOpen()
                            }}
                        /> : <></>
                    }
                </Flex>
                {signersList.length == 0 ? <Text color='rgba(0, 0, 0, 0.5)'>Não foi adicionada nenhuma assinatura</Text> : <></>}
                <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                    {
                        signersList.map(s => {
                            return (
                                <GridItem
                                    key={s.name}
                                    colSpan={['12', '12', '6', '6', '3']}
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
                                                    s.userId === currenteUserId && data.status == 'SENDED' ?
                                                        <SignerModalButton
                                                            contractId={data._id}
                                                            currentUserId={currenteUserId}
                                                            signId={s._id}
                                                            setSignersList={setSignersList}
                                                            client={client}
                                                        /> : <></>
                                                }
                                                {
                                                    allowEdit ? <Box fontSize="14px" cursor='pointer'>
                                                        <FaPen onClick={() => {
                                                            handleEditSigner(s._id)
                                                        }} style={{ marginBottom: '8px' }} />
                                                        <FaTrash onClick={() => handleDeleteSigner(s._id)} />
                                                    </Box> : <></>
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
    const params = url[url.length - 1].split('?')
    const id = params[0]
    const queryString = params[1] != null ? params[1].split('=')[1] : ''

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

    const me = await apollo.query({
        query: ME,
        variables: { _id: id }
    })

    const clauses = await apollo.query({
        query: GET_FIELDS,
        variables: { contractId: id }
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

    return {
        props: {
            token: cookies.token,
            data: response.data.contract.data[0],
            querySigner: queryString,
            currenteUserId: me.data.me._id,
            initialClauseOrder,
            initialClauses
        }
    }
}