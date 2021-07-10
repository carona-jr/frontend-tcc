import { Flex, Box, Center, Text, UnorderedList, ListItem, Button, useColorMode } from '@chakra-ui/react'
import { GiStoneBlock } from 'react-icons/gi'
import { BsFileText } from 'react-icons/bs'
import { BiHomeAlt } from 'react-icons/bi'

export default function Layout({ children }) {
    const { colorMode, toggleColorMode } = useColorMode()

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
                                    <Button w='100%' leftIcon={<BiHomeAlt fontSize='16px' color='white' />} colorScheme="blackAlpha" variant="solid">
                                        Dashboard
                                    </Button>
                                </ListItem>
                                <ListItem px={3} py={1} color='white'>
                                    <Button w='100%' leftIcon={<BsFileText fontSize='16px' color='white' />} colorScheme="blackAlpha" variant="solid">
                                        Contratos
                                    </Button>
                                </ListItem>
                            </UnorderedList>
                        </Box>
                    </Box>
                </Flex>
                <Flex w='100vw' flexDirection='column'>
                    <Box h='7vh' boxShadow='md' bgColor='white'>
                        navbar
                    </Box>
                    <Box>
                        {children}
                    </Box>
                </Flex>

            </Flex>
        </Box>
    )
}