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

// Components
import DefaultModal from '../modal'

export default function TableList({
    initialConfig,
    columns,
    data,
    token,
    route,
    sort,
    sortByFilter,
    toast,
    formRef,
    saveData,
    setModalRoute,
    handleEdit,
    setTableData,
    tablePageCount,
    setTablePageCount,
    initialForm,
    setFormValues,
    isEditOpen,
    onEditOpen,
    onEditClose,
    modalPadding = '0',
    modalSize = 'md',
    modalName = 'Adicionar',
    editForm
}) {
    let i = 0
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const [firstLoading, setFirstLoading] = useState(true)
    const [selectedId, setSelectedId] = useState('')
    const [loadingTable, setLoadingTable] = useState(false)

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

    // useEffect(() => {
    //     if (firstLoading)
    //         return setFirstLoading(false)

    //     const timeOutId = setTimeout(() => getPage(0), 800)
    //     return () => clearTimeout(timeOutId)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [queryString, saveData])

    async function getPage(n, size = pageSize) {
        n++
        if (n >= 1 && n <= tablePageCount) {
            // setLoadingTable(true)
            // gotoPage(n - 1)
            // const queries = formatQueryString()
            // const response = await api.get(`/${route}?limit=${n * size}&skip=${(n - 1) * size}${queries}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // })
            // const count = response.data.count
            // const pageNum = count / size
            // setTableData(response.data.documents)
            // setTablePageCount(count == 0 ? 1 : count % size == 0 ? parseInt(pageNum) : parseInt(pageNum) + 1)
            // setLoadingTable(false)
        }
    }

    async function getNextPage() {
        const page = pageIndex + 1
        if (page < tablePageCount) {
            // setLoadingTable(true)
            // nextPage()
            // const queries = formatQueryString()
            // const response = await api.get(`/${route}?limit=${(page + 1) * pageSize}&skip=${page * pageSize}${queries}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // })
            // setTableData(response.data.documents)
            // setLoadingTable(false)
        }
    }

    async function getPreviousPage() {
        const page = pageIndex
        if (page >= 1) {
            // setLoadingTable(true)
            // previousPage()
            // const queries = formatQueryString()
            // const response = await api.get(`/${route}?limit=${page * pageSize}&skip=${(page - 1) * pageSize}${queries}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // })
            // setTableData(response.data.documents)
            // setLoadingTable(false)
        }
    }

    function Skeletons() {
        let a = []

        for (let j = 0; j < pageSize; j++)
            a.push(<Skeleton height="70px" key={j} />)

        return a
    }

    const handleDelete = async _id => {
        try {
            // if (selectedId == '') {
            //     setSelectedId(_id)
            //     return onDeleteOpen()
            // }

            // await api.patch(`/${route}/update/${selectedId}`, {
            //     active: false
            // }, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // })

            // onDeleteClose()
            // setSelectedId('')
            // getPage(0)
            toast({
                title: "Sucesso.",
                description: `Registro apagado`,
                status: "success",
                duration: 3000,
                isClosable: true
            })
        } catch {
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
        // if (formRef.current)
        //     formRef.current.handleSubmit()
    }

    return (
        <Box>
            {/* <Modal isOpen={isEditOpen} onClose={onEditClose} size={modalSize} isCentered>
                <ModalOverlay />
                <ModalContent h={['100vh', 'auto']} borderRadius={['0', '12px']}>
                    <ModalHeader>{modalName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody px={modalPadding}>
                        {editForm}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={saveData}>Salvar</Button>
                        <Button variant="ghost" onClick={onEditClose} disabled={saveData}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}

            {/* <DefaultModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                handleSuccess={handleDelete}
                handleCancel={() => { setSelectedId(''); onDeleteClose() }}
            >
                <Text style={{ fontSize: '20px' }}>Deseja apagar este registro?</Text>
            </DefaultModal> */}

            {/* <Flex w="100%" mb="4" flexDir={['column', 'column', 'row']} justifyContent={['space-between']} alignItems={['flex-end', 'flex-end', 'center']}>
                {
                    sortByFilter != null ?
                        (<Flex bgColor="#fff" borderRadius="12px" alignSelf="flex-start" w="100%">
                            <Flex flexDir={['column', 'row']} alignItems={['stretch', 'center']} w="100%">
                                <Center mb={['3', '0']} w={['100%', 'auto']}>
                                    <Select
                                        mr={['0', '2']}
                                        value={queryString.sortBy}
                                        onChange={e => {
                                            setQueryString({ ...queryString, sortBy: e.target.value })
                                        }}
                                    >
                                        {sortByFilter}
                                    </Select>
                                    {
                                        queryString.sortOrder == 'desc' ? (
                                            <FiChevronUp className="table-item" color="#4A5568" fontSize="48px" onClick={() => { setQueryString({ ...queryString, sortOrder: 'asc' }) }} />
                                        ) : (
                                            <FiChevronDown className="table-item" color="#4A5568" fontSize="48px" onClick={() => { setQueryString({ ...queryString, sortOrder: 'desc' }) }} />
                                        )
                                    }
                                </Center>
                                <Box ml={['0', '2']}>
                                    <Input value={queryString.filter || ''} placeholder="pesquise..." onChange={e => setQueryString({ ...queryString, filter: e.target.value })} />
                                </Box>
                            </Flex>
                        </Flex>) : (<></>)
                }
                <Box my={['4', '4', '0']}>
                    <Button
                        colorScheme="blue"
                        minW="150px"
                        onClick={() => {
                            setFormValues(initialForm)
                            setModalRoute('/create')
                            onEditOpen()
                        }}
                    >
                        Adicionar
                    </Button>
                </Box>
            </Flex> */}

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

            {/* <Flex
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
            </Flex> */}
        </Box>
    )
}