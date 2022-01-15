import { useState, useEffect } from 'react'
import {
    Modal, ModalBody, ModalOverlay,
    ModalHeader, ModalFooter, ModalContent,
    ModalCloseButton,
    Table, Thead, Grid, GridItem,
    Tr, Th, Td, Tbody, Box, Flex,
    Button, Select, Input, Center,
    Skeleton, Stack, Text, useDisclosure
} from '@chakra-ui/react'
import { usePagination, useTable } from 'react-table'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { BsChevronRight, BsChevronLeft, BsChevronDoubleLeft, BsChevronDoubleRight } from 'react-icons/bs'
import { HiPencil, HiTrash } from 'react-icons/hi'

import { useMutation, useApolloClient } from '@apollo/client'
import { UPDATE_USER, FIND_USERS } from '../../graphql'

// Components
import DefaultModal from '../modal'

export default function TableList({
    initialConfig,
    columns,
    data,
    toast,
    saveFormData,
    setModalMethod,
    initialForm,
    handleEdit,
    tablePageCount,
    setFormValues,
    formRef,
    setTableData,
    setTablePageCount,
    isEditOpen,
    onEditOpen,
    onEditClose,
    editForm,
    modalPadding = '0',
    modalSize = 'md',
    modalName = 'Adicionar',
    sortByFilter = [{ label: 'Nome', value: 'name' }]
}) {
    let i = 0
    const [updateUser] = useMutation(UPDATE_USER)
    const client = useApolloClient()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const [firstLoading, setFirstLoading] = useState(true)
    const [selectedId, setSelectedId] = useState('')
    const [loadingTable, setLoadingTable] = useState(false)
    const [variables, setVariables] = useState({ filter: '', sortBy: 'name', sortOrder: 1 })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        nextPage,
        previousPage,
        pageOptions,
        pageCount,
        setPageSize,
        gotoPage,
        state: { pageIndex, pageSize }
    } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: initialConfig.initialPageSize }, pageCount: tablePageCount, manualPagination: true }, usePagination)

    useEffect(() => {
        if (firstLoading)
            return setFirstLoading(false)

        const timeOutId = setTimeout(() => getPage(0), 800)
        return () => clearTimeout(timeOutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variables, saveFormData])

    async function getPage(n, size = pageSize) {
        n++

        let pageCount = tablePageCount
        if (tablePageCount == 0)
            pageCount++

        if (n >= 1 && n <= pageCount) {
            setLoadingTable(true)
            gotoPage(n - 1)

            const queryVariables = {
                userInputs: {
                    limit: n * size,
                    skip: (n - 1) * size,
                    sortBy: encodeURI(JSON.stringify({
                        [variables.sortBy]: variables.sortOrder
                    }))
                }
            }

            if (variables.filter != '') {
                queryVariables.userInputs.filterBy = encodeURI(JSON.stringify({
                    name: { $regex: variables.filter, $options: 'i' }
                }))
            }

            const response = await client.query({
                query: FIND_USERS,
                variables: { ...queryVariables },
                fetchPolicy: 'no-cache'
            })
            const count = response.data.findUsers.total
            const pageNum = count / size
            setTableData(response.data.findUsers.data)
            setTablePageCount(count == 0 ? 1 : count % size == 0 ? parseInt(pageNum) : parseInt(pageNum) + 1)
            setLoadingTable(false)
        }
    }

    async function getNextPage() {
        const page = pageIndex + 1
        if (page < tablePageCount) {
            setLoadingTable(true)
            nextPage()
            const response = await client.query({
                query: FIND_USERS,
                variables: {
                    userInputs: {
                        limit: (page + 1) * pageSize,
                        skip: page * pageSize
                    }
                },
                fetchPolicy: 'no-cache'
            })
            setTableData(response.data.findUsers.data)
            setLoadingTable(false)
        }
    }

    async function getPreviousPage() {
        const page = pageIndex
        if (page >= 1) {
            setLoadingTable(true)
            previousPage()
            const response = await client.query({
                query: FIND_USERS,
                variables: {
                    userInputs: {
                        limit: page * pageSize,
                        skip: (page - 1) * pageSize
                    }
                },
                fetchPolicy: 'no-cache'
            })
            setTableData(response.data.findUsers.data)
            setLoadingTable(false)
        }
    }

    function Skeletons() {
        let a = []

        for (let j = 0; j < pageSize; j++)
            a.push(<Skeleton height="70px" key={j} />)

        return a
    }

    const handleDelete = async id => {
        try {
            if (selectedId == '') {
                setSelectedId(id)
                return onDeleteOpen()
            }

            await updateUser({
                variables: {
                    userInput: {
                        id: selectedId,
                        active: false
                    }
                }
            })

            onDeleteClose()
            setSelectedId('')
            getPage(0)
            toast({
                title: "Sucesso.",
                description: 'Sucesso ao apagar o registro',
                status: "success",
                duration: 3000,
                isClosable: true
            })
        } catch (e) {
            setSelectedId('')
            toast({
                title: "Erro.",
                description: `Erro ao apagar o registro`,
                status: "error",
                duration: 3000,
                isClosable: true
            })
        }
    }

    function handleSubmit() {
        if (formRef.current)
            formRef.current.handleSubmit()
    }

    return (
        <Box>
            <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize} isCentered>
                <ModalOverlay />
                <ModalContent h={['100vh', 'auto']} borderRadius={['0', '12px']}>
                    <ModalHeader>{modalName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody px={modalPadding}>
                        {editForm}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose} disabled={saveFormData}>Cancelar</Button>
                        <Button colorScheme="blue" onClick={handleSubmit} isLoading={saveFormData}>Salvar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <DefaultModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                handleSuccess={handleDelete}
                handleCancel={() => { setSelectedId(''); onDeleteClose() }}
            >
                <Text style={{ fontSize: '20px' }}>Deseja apagar este registro?</Text>
            </DefaultModal>

            <Flex w="100%" mb="4" flexDir={['column', 'column', 'row']} justifyContent={['space-between']} alignItems={['flex-end', 'flex-end', 'center']}>
                <Flex bgColor="#fff" borderRadius="12px" alignSelf="flex-start" w="100%">
                    <Flex flexDir={['column', 'row']} alignItems={['stretch', 'center']} w="100%">
                        <Center mb={['3', '0']} w={['100%', 'auto']}>
                            <Select
                                mr={['0', '2']}
                                value={variables.sortBy}
                                onChange={e => {
                                    setVariables({ ...variables, sortBy: e.target.value })
                                }}
                            >
                                {sortByFilter.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </Select>
                            {
                                variables.sortOrder == 1 ? (
                                    <FiChevronUp className="table-item" color="#4A5568" fontSize="48px" onClick={() => { setVariables({ ...variables, sortOrder: -1 }) }} />
                                ) : (
                                    <FiChevronDown className="table-item" color="#4A5568" fontSize="48px" onClick={() => { setVariables({ ...variables, sortOrder: 1 }) }} />
                                )
                            }
                        </Center>
                        <Box ml={['0', '2']}>
                            <Input value={variables.filter || ''} placeholder="pesquise..." onChange={e => setVariables({ ...variables, filter: e.target.value })} />
                        </Box>
                    </Flex>
                </Flex>
                <Box my={['4', '4', '0']}>
                    <Button
                        colorScheme="blue"
                        minW="150px"
                        onClick={() => {
                            setFormValues(initialForm)
                            setModalMethod('CREATE')
                            onEditOpen()
                        }}
                    >
                        Adicionar
                    </Button>
                </Box>
            </Flex>

            <Box w="100%" style={{ overflowY: 'auto' }}>
                {
                    loadingTable ? (
                        <Stack bgColor="#fff" p="5" borderRadius="12px" key={i++}>
                            <Skeletons />
                        </Stack>
                    ) : (
                        <Table {...getTableProps()} variant="striped" colorScheme="gray" bgColor="#fff" borderRadius="12px">
                            <Thead key={i++}>
                                {
                                    headerGroups.map(h => (
                                        <Tr {...h.getHeaderGroupProps()} key={i++}>
                                            {
                                                h.headers.map(c => (
                                                    <Th {...c.getHeaderProps()} key={i++}>
                                                        <Flex alignItems="center">{c.render('Header')}</Flex>
                                                    </Th>
                                                ))
                                            }
                                        </Tr>
                                    ))
                                }
                            </Thead>
                            <Tbody {...getTableBodyProps()} key={i++}>
                                {
                                    page.map(r => {
                                        prepareRow(r)
                                        return (
                                            <Tr {...r.getRowProps()} key={i++} className="table-list">
                                                {
                                                    r.cells.map(c => (
                                                        c.render('Header') != '' ? (
                                                            <Td key={i++}>
                                                                {
                                                                    c.column.id.includes('.') ?
                                                                        <Text>
                                                                            {c.row.original[c.column.id.split('.')[0]] ? c.row.original[c.column.id.split('.')[0]][c.column.id.split('.')[1]] : ''}
                                                                        </Text> : <>
                                                                            {c.render('Cell')}
                                                                        </>
                                                                }
                                                            </Td>
                                                        ) : (
                                                            <Td key={i++} textAlign="right">
                                                                <Button onClick={() => handleEdit(c.value)} colorScheme="white"><HiPencil fontSize="24px" color="#4A5568" /></Button>
                                                                <Button onClick={() => handleDelete(c.value)} colorScheme="white"><HiTrash fontSize="24px" color="#4A5568" /></Button>
                                                            </Td>
                                                        )


                                                    ))
                                                }
                                            </Tr>
                                        )
                                    })
                                }
                            </Tbody>
                        </Table>
                    )
                }
            </Box>

            <Flex
                flexDir={['column', 'column', 'row']}
                alignItems={['center']}
                justifyContent="space-between"
                className="pagination"
                bgColor="#fff"
                borderRadius="12px"
                mt="4"
                p="3"
            >
                <Center mb={['2', '2', '0']} flexDir={['column', 'column', 'row']}>
                    <Box mr="3">
                        Página {pageIndex + 1} de {pageOptions.length}
                    </Box>
                    {
                        sortByFilter != null ? (
                            <Flex>
                                <Center mr="3" display={['none', 'none', 'block']}>
                                    <Text mr="1" display="inline-block">
                                        Vá para:
                                    </Text>
                                    <Input
                                        w="60px"
                                        type="number"
                                        defaultValue={pageIndex + 1}
                                        onChange={e => {
                                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                                            getPage(page)
                                        }}
                                    />
                                </Center>
                                <Select
                                    w="150px"
                                    display={['none', 'none', 'block']}
                                    value={pageSize}
                                    onChange={e => {
                                        setPageSize(Number(e.target.value))
                                        getPage(0, Number(e.target.value))
                                    }}
                                >
                                    {[5, 10, 20].map(pageSize => (
                                        <option key={pageSize} value={pageSize}>
                                            Mostre {pageSize}
                                        </option>
                                    ))}
                                </Select>
                            </Flex>
                        ) : (<></>)
                    }
                </Center>
                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                    <GridItem colSpan="1">
                        <Button onClick={() => getPage(0)} colorScheme="whiteAlpha">
                            <BsChevronDoubleLeft fontSize="24px" color="#4A5568" />
                        </Button>
                    </GridItem>
                    <GridItem colSpan="1">
                        <Button onClick={() => getPreviousPage()} colorScheme="whiteAlpha">
                            <BsChevronLeft fontSize="24px" color="#4A5568" />
                        </Button>
                    </GridItem>
                    <GridItem colSpan="1">
                        <Button onClick={() => getNextPage()} colorScheme="whiteAlpha">
                            <BsChevronRight fontSize="24px" color="#4A5568" />
                        </Button>
                    </GridItem>
                    <GridItem colSpan="1">
                        <Button onClick={() => getPage(pageCount - 1)} colorScheme="whiteAlpha">
                            <BsChevronDoubleRight fontSize="24px" color="#4A5568" />
                        </Button>
                    </GridItem>
                </Grid>
            </Flex>
        </Box>
    )
}