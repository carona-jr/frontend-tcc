import { useRouter } from 'next/router'
import { Flex, Text, Button } from '@chakra-ui/react'

export default function Navbar() {
    const router = useRouter()

    return (
        <Flex
            id="navbar"
            px="10vw"
            py="1rem"
            justifyContent="space-between"
            alignItems="center"
            pos="sticky"
            top="0"
            zIndex={999}
            bgColor="#fff"
            borderBottom="1px solid rgba(0, 0, 0, 0.05)"
            boxShadow="0 2px 12px 0 rgba(0, 0, 0, 0.1)"
        >
            <Flex>
                <Text textTransform="uppercase" fontSize={["1.5rem", "1.5rem", "2rem"]} fontWeight="500" pr="10" onClick={() => router.push('/')} cursor='pointer'>Contratos</Text>
                <Flex alignItems="center" display={['none', 'none', 'flex']}>
                    <Button
                        variant="link"
                        colorScheme="gray"
                        fontSize="0.8rem"
                        textTransform="uppercase" pr="10"
                        onClick={() => router.push('/#how-it-work')}
                    >
                        Como funciona
                    </Button>
                    <Button
                        variant="link"
                        colorScheme="gray"
                        fontSize="0.8rem"
                        textTransform="uppercase" pr="10"
                        onClick={() => router.push('/#price')}
                    >
                        Preços
                    </Button>
                </Flex>
            </Flex>
            <Flex>
                <Button variant="outline" colorScheme="telegram" mr='5' fontSize={["0.8rem", "0.8rem", "1rem"]} onClick={() => router.push('/signup')} display={['none', 'block']}>Criar Conta</Button>
                <Button variant="outline" colorScheme="whatsapp" fontSize={["0.8rem", "0.8rem", "1rem"]} onClick={() => router.push('/signin')}>Entrar</Button>
            </Flex>
        </Flex>
    )
}