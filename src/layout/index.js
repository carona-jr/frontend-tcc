import {
    Flex,
    Box,
    Center,
    Text,
    UnorderedList,
    ListItem,
    Button,
    useColorMode,
    Spinner,
    Avatar,
    Menu,
    MenuList,
    MenuItem,
    MenuButton,
    MenuGroup
} from '@chakra-ui/react'
import { GiStoneBlock } from 'react-icons/gi'
import { BsFileText } from 'react-icons/bs'
import { BiHomeAlt } from 'react-icons/bi'
import { getApolloClient } from '../../lib/apolloNextClient'
import { ME } from '../../src/graphql'
import useSWR from 'swr'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../src/actions'
import { useSelector } from 'react-redux'
import { FiChevronDown } from 'react-icons/fi'
import { useCookies } from "react-cookie"

const fetcher = async url => {
    try {
        const data = await new Promise(async (res, rej) => {
            try {
                const apollo = getApolloClient({ token: url.split('/')[2] })
                const response = await apollo.query({
                    query: ME,
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

export default function Layout({ children, token, router }) {
    const user = useSelector(state => state.User)
    const dispatch = useDispatch()
    const { data, error } = useSWR(`/me/${token}`, fetcher, {
        onSuccess: (data, key, config) => {
            dispatch(updateUser(data))
        }
    })
    const { colorMode, toggleColorMode } = useColorMode()
    const [cookie, removeCookie] = useCookies(["user"])

    function handleNavigate(page) {
        if (page == '')
            return router.reload()

        return router.push(page)
    }

    if (!data && !error) return <Center h='100vh'><Spinner size="xl" /></Center>
    if (error) return 'ERRO'

    return (
        <Box h='100vh' bgColor={colorMode == 'light' ? 'gray.200' : 'gray.700'}>
            <Flex>
                <Flex
                    w='350px'
                    h='100vh'
                    boxShadow='md'
                    bgColor={colorMode == 'light' ? 'gray.600' : 'gray.200'}
                    flexDir='column'
                >
                    <Box h='7vh' bgColor={colorMode == 'light' ? 'gray.800' : 'gray.400'}>
                        <Center h='100%'>
                            <GiStoneBlock fontSize='32px' color='white' />
                            <Text ml={3} fontSize="xl" casing="uppercase" fontWeight='600' color='white'>Contrato</Text>
                        </Center>
                        <Box>
                            <UnorderedList w='100%' m={0} styleType='none'>
                                <ListItem px={3} py={1} mt={1} color='white'>
                                    <Button
                                        w='100%'
                                        leftIcon={<BiHomeAlt fontSize='16px' color='white' />}
                                        colorScheme="blackAlpha"
                                        variant="solid"
                                        onClick={() => handleNavigate('home')}
                                    >
                                        Dashboard
                                    </Button>
                                </ListItem>
                                <ListItem px={3} py={1} color='white'>
                                    <Button
                                        w='100%'
                                        leftIcon={<BsFileText fontSize='16px' color='white' />}
                                        colorScheme="blackAlpha" variant="solid"
                                        onClick={() => handleNavigate('contract')}
                                    >
                                        Contratos
                                    </Button>
                                </ListItem>
                            </UnorderedList>
                        </Box>
                    </Box>
                </Flex>
                <Flex w='100vw' flexDirection='column'>
                    <Box h='7vh' boxShadow='md' bgColor='white'>
                        <Flex h='100%' justifyContent='space-between' mx='5'>
                            <Box w='100px' h='100%'>

                            </Box>
                            <Box h='100%'>
                                <Flex h='100%' alignItems='center'>
                                    <Avatar name={user.name} src='https://picsum.photos/200' alt='foto de perfil' size='md' mr='3' />
                                    <Menu>
                                        <MenuButton as={Button} rightIcon={<FiChevronDown />}>
                                            {user.email}
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
                                            <MenuGroup title='Dúvidas'>
                                                <MenuItem>Suporte</MenuItem>
                                                <MenuItem>FAQ</MenuItem>
                                            </MenuGroup>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                    <Box>
                        {children}
                    </Box>
                </Flex>
            </Flex>
        </Box>
    )
}