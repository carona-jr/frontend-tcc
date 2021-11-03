/* eslint-disable no-unused-vars */
import {
    Flex, Box, Center,
    Text, Button, useColorMode, Breadcrumb,
    Avatar, Menu, MenuList, BreadcrumbItem, BreadcrumbLink,
    MenuItem, MenuButton, MenuGroup,
    useDisclosure, Drawer, DrawerOverlay,
    DrawerContent, DrawerHeader, DrawerBody,
    IconButton, DrawerCloseButton, useMediaQuery,
    Accordion, AccordionItem, AccordionPanel,
    AccordionButton, AccordionIcon, SimpleGrid,
    LinkBox, Heading, LinkOverlay,
    Link, Spinner
} from '@chakra-ui/react'
import { FaHome } from 'react-icons/fa'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { RiMenuLine } from 'react-icons/ri'
import { getApolloClient } from '../../lib/apolloNextClient'
import { ME } from '../../src/graphql'
import useSWR from 'swr'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../../src/actions'
import { useCookies } from "react-cookie"
import menu from './menu'

const fetcher = async url => {
    try {
        const data = await new Promise(async (res, rej) => {
            try {
                const apollo = getApolloClient({ token: url.split('/')[2] })
                const response = await apollo.query({
                    query: ME
                })
                res(response.data.me)
            } catch (e) {
                rej('Erro ao consultar a api')
            }
        })
        return data
    } catch (e) {
        return
    }
}

export default function Layout({ children, token, router, title, breadcrumbs = [] }) {
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
    const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure()
    const user = useSelector(state => state.User)
    const dispatch = useDispatch()
    const { data, error } = useSWR(`/me/${token}`, fetcher, {
        onSuccess: (data, key, config) => {
            dispatch(updateUser(data))
        }
    })
    const { colorMode, toggleColorMode } = useColorMode()
    const [cookie, removeCookie] = useCookies(["user"])

    if (!data && !error) return <Center h='100vh'><Spinner size="xl" /></Center>
    if (error) return 'ERRO'

    return (
        <Box minH='100vh' bgColor={colorMode == 'light' ? 'gray.200' : 'gray.700'}>
            <Drawer placement='left' onClose={onMenuClose} isOpen={isMenuOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        <Link href='/home' textDecoration='none !important'>Contract Chain</Link>
                    </DrawerHeader>
                    <DrawerBody p='0'>
                        <Accordion defaultIndex={[0]}>
                            {menu.map(m => {
                                return (
                                    <AccordionItem key={m.name}>
                                        <h2>
                                            <AccordionButton p='5'>
                                                <Box flex="1" textAlign="left">
                                                    {m.name}
                                                </Box>
                                                <AccordionIcon />
                                            </AccordionButton>
                                        </h2>
                                        <AccordionPanel py={4}>
                                            <SimpleGrid columns={2} spacing={3}>
                                                {m.items.map(i => {
                                                    return (
                                                        <LinkBox as="article" axW="sm" p="5" borderWidth="1px" rounded="md" className='menu-item'
                                                            d='flex'
                                                            flexDirection='column'
                                                            justifyContent='center'
                                                            key={i.description}
                                                        >
                                                            <Heading size="md" my="2" d='flex' justifyContent='center'>
                                                                <LinkOverlay href={i.navigate}>{i.icon}</LinkOverlay>
                                                            </Heading>
                                                            <Text textAlign='center' fontSize='14px'>{i.description}</Text>
                                                        </LinkBox>
                                                    )
                                                })}
                                            </SimpleGrid>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Flex flexDirection='column'>
                <Box h={isLargerThan768 ? '10vh' : '9vh'} boxShadow='md' bgColor='white'>
                    <Flex h='100%' justifyContent='space-between' px='5'>
                        <Flex alignItems='center' w='100px' h='100%'>
                            <IconButton
                                variant="ghost"
                                aria-label='abrir o menu'
                                icon={<RiMenuLine />}
                                fontSize='32px'
                                onClick={onMenuOpen}
                            />
                        </Flex>
                        <Box h='100%'>
                            <Flex h='100%' alignItems='center'>
                                <Avatar name={user.username} src='https://picsum.photos/200' alt='foto de perfil' size={isLargerThan768 ? 'md' : 'sm'} mr='3' />
                                <Menu>
                                    <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                                        {isLargerThan768 ? user.email : user.email.substring(0, user.email.indexOf('@'))}
                                    </MenuButton>
                                    <MenuList>
                                        <MenuGroup title='Perfil'>
                                            <MenuItem>Minha Conta</MenuItem>
                                            <MenuItem>Pagamentos</MenuItem>
                                            <MenuItem onClick={() => {
                                                removeCookie('token')
                                                router.reload()
                                            }}>Sair</MenuItem>
                                        </MenuGroup>
                                    </MenuList>
                                </Menu>
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
                <Box p="5">
                    <Box bgColor='#fff' p='4' borderRadius='12px'>
                        <Flex mb='2' alignItems='center' justifyContent='space-between'>
                            <Text fontSize={['16px', '16px', '24px']} fontWeight='small'>
                                {title}
                            </Text>

                            <Breadcrumb my='3' spacing="8px" separator={<FiChevronRight color="gray.500" />} color='#4A5568'>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/home">
                                        <Flex alignItems="center">
                                            <FaHome className='breadcrumb-item' />
                                            <Text display={['none', 'block']} pl="2">Home</Text>
                                        </Flex>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {
                                    breadcrumbs.map(b => b)
                                }
                            </Breadcrumb>
                        </Flex>
                        {children}
                    </Box>
                </Box>
            </Flex>
        </Box>
    )
}