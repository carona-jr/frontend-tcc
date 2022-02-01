import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Flex, Text, Button } from '@chakra-ui/react'
import cookie from 'cookie'

import Image from 'next/image'
import principalImage from '../public/principal.jpg'
import contractsImage from '../public/contracts.svg'
import clausesImage from '../public/clauses.svg'
import signersImage from '../public/signers.svg'
import blockchainImage from '../public/blockchain.svg'
import priceImage from '../public/price.svg'
import uploadImage from '../public/upload.svg'
import waitingImage from '../public/waiting.svg'
import doneImage from '../public/done.svg'

import { AiTwotoneEdit } from 'react-icons/ai'
import { IoDocumentTextSharp } from 'react-icons/io5'
import { RiSendPlaneFill } from 'react-icons/ri'

import Navbar from '../src/layout/navbar'

export default function Home() {
    const router = useRouter()

    return (
        <Box>
            <Head>
                <title>Contratos</title>
                <meta name="description" content="Contratos" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box bgColor="#fff">
                <Navbar />
                <Box id="home-content" bgColor="#000">
                    <Box pos="relative">
                        <Box
                            w={["auto", "auto", "400px"]}
                            pos="absolute"
                            left={["0", "0", "55%"]}
                            top={["0", "0", "25%"]}
                            color="#000"
                            zIndex={998}
                            visibility={['hidden', 'hidden', 'visible']}
                        >
                            <Text fontSize={["1.5rem", "1.5rem", "2.5rem"]} textTransform="uppercase" fontWeight="500" fontFamily="SourceCode">
                                Evolua a sua maneira de criar contratos
                            </Text>
                            <Button colorScheme="whatsapp" fontSize={["1rem", "1rem", "2.5rem"]} p={["2", "2", "8"]} onClick={() => router.push('/signup')}>Experimente</Button>
                        </Box>
                        <Image src={principalImage} alt="homem segurando pasta" />
                        <Box className='gradient-img'></Box>
                    </Box>
                    <Flex flexDir="column" justifyContent="center" alignItems="center" my={["0", "4", "10"]} p={["5", "8", "10"]}>
                        <Text color="#fff" fontSize="2rem" textTransform="uppercase" fontWeight="600" fontFamily="SourceCode" textAlign="center">
                            Faça os seus contratos de forma simples e fácil
                        </Text>
                        <Flex w="100%" my={["20", "20", "40"]} flexDir={["column", "column", "row"]} justifyContent="space-around" alignItems="center" color="#fff">
                            <Flex flexDir="column" alignItems="center" justifyContent="space-around" w={["90%", "70%", "400px"]} h="180px" pb={["4rem", "4rem", "0"]}>
                                <IoDocumentTextSharp fontSize="3.5rem" />
                                <Text textAlign="center" fontFamily="Ubuntu" fontSize="1.2rem">
                                    Elabore o seu contrato na nossa plataforma, adicione cláusulas e assinaturas.
                                </Text>
                            </Flex>
                            <Flex flexDir="column" alignItems="center" justifyContent="space-around" w={["90%", "70%", "400px"]} h="180px" pb={["4rem", "4rem", "0"]}>
                                <AiTwotoneEdit fontSize="3.5rem" />
                                <Text textAlign="center" fontFamily="Ubuntu" fontSize="1.2rem">
                                    Aguarde o seu contrato ser assinados por todos os interessados.
                                </Text>
                            </Flex>
                            <Flex flexDir="column" alignItems="center" justifyContent="space-around" w={["90%", "70%", "400px"]} h="180px" pb={["4rem", "4rem", "0"]}>
                                <RiSendPlaneFill fontSize="3.5rem" />
                                <Text textAlign="center" fontFamily="Ubuntu" fontSize="1.2rem">
                                    Salve o seu contrato como um NFT na rede do Ethereum.
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex flexDir='column' alignItems='center' h="1000px" bgColor="#fff" py='20' id='how-it-work'>
                        <Flex flexDir='column' alignItems='center'>
                            <Text color="#000" fontSize="2rem" textTransform="uppercase" fontWeight="600" fontFamily="SourceCode" textAlign="center">
                                Como funciona
                            </Text>

                            <Flex w={['90%', '80%', '70%', '60%']} py='10' flexDir={['column', 'column', 'row']} alignItems='center'>
                                <Image src={contractsImage} alt="três arquivos com um botão de adicionar" />
                                <Text ml={[0, 0, 10]} color="#000" fontSize="1.2rem" fontWeight="500" textAlign='justify'>
                                    Adicione novos contratos na sua conta e verifique o andamento da elaboração do seu contrato em um quadro Kanban.
                                    Mova os seus contratos de fases até a fase de assinatura.
                                </Text>
                            </Flex>

                            <Flex w={['90%', '80%', '70%', '60%']} py='10' flexDir={['column-reverse', 'column-reverse', 'row']} alignItems='center'>
                                <Text ml={[0, 0, 10]} color="#000" fontSize="1.2rem" fontWeight="500" textAlign='justify'>
                                    Adicione novas cláusulas, edite o texto do seu contrato e visualize o seu documento em formato PDF.
                                    Atribua as assinaturas e espere o seu contrato ser aprovado por todos os interessados.
                                </Text>
                                <Image src={clausesImage} alt="três arquivos com um botão de adicionar" />
                            </Flex>

                            <Flex w={['90%', '80%', '70%', '60%']} py='10' flexDir={['column', 'column', 'row']} alignItems='center'>
                                <Image src={signersImage} alt="um computador com três certos" />
                                <Text ml={[0, 0, 10]} color="#000" fontSize="1.2rem" fontWeight="500" textAlign='justify'>
                                    Envie o seu contrato para validação das partes interessados.
                                    As partes interessados receberão um e-mail com um link de acesso à plataforma para visualizar as cláusulas a fim de aceitar ou recusar aquele documento.
                                </Text>
                            </Flex>

                            <Flex w={['90%', '80%', '70%', '60%']} py='10' flexDir={['column-reverse', 'column-reverse', 'row']} alignItems='center'>
                                <Text ml={[0, 0, 10]} color="#000" fontSize="1.2rem" fontWeight="500" textAlign='justify'>
                                    Após todos os interessados aceitarem as cláusulas dispostas no seu contrato, faça o envio do seu documento para a rede do Ethereum.
                                    O seu contrato será um NFT dentro da rede da blockchain, você poderá acessá-lo em sua carteira de criptoativos.
                                </Text>
                                <Image src={blockchainImage} alt="uma mão com um globo em cima" />
                            </Flex>
                        </Flex>

                        <Flex w={['90%', '80%']} flexDir='column' alignItems='center' bgColor="#fff" py='20' id='price'>
                            <Text color="#000" fontSize="2rem" textTransform="uppercase" fontWeight="600" fontFamily="SourceCode" textAlign="center">
                                Preços
                            </Text>
                            <Text color="#000" fontSize="1.2rem" fontWeight="500" textAlign='justify' mt='10'>
                                Os preços cobrados para a criação do NFT na rede Ethereum leva em conta o custo para realizar a transação na rede e a taxa da plataforma.
                                Ao enviar o contrato, a transação não é executada no mesmo momento. Por isto, a plataforma reserva um valor da sua conta para que a sua transação seja efetivada com sucesso.
                                Note que, caso ocorra um erro na transação, o custo para a execução do seu contrato até o momento do erro será cobrado.
                                Visualize no esquema abaixo como é feito a cobrança do valor da sua conta.
                            </Text>
                            <Flex w='100%' h={['auto', 'auto', '250px']} flexDir={['column', 'column', 'row']} boxShadow='sm' justifyContent='space-between' border='1px solid rgba(0, 0, 0, 0.1)' borderRadius='5' my='10' p='5'>
                                <Flex w={['100%', '100%', '60%']} mb={[10, 10, 0]} flexDir='column' alignItems='center'>
                                    <Image src={priceImage} alt="tag de preço" />
                                    <Text w='60%' mt='5' color="#000" fontSize="1rem" fontWeight="500" textAlign='center'>
                                        1. Veja a estimativa do preço com as taxas
                                    </Text>
                                </Flex>

                                <Flex w={['100%', '100%', '60%']} mb={[10, 10, 0]} flexDir='column' alignItems='center'>
                                    <Image src={uploadImage} alt="tag de preço" />
                                    <Text w='60%' mt='5' color="#000" fontSize="1rem" fontWeight="500" textAlign='center'>
                                        2. Confirme o valor e envie a transação
                                    </Text>
                                </Flex>

                                <Flex w={['100%', '100%', '60%']} mb={[10, 10, 0]} flexDir='column' alignItems='center'>
                                    <Image src={waitingImage} alt="tag de preço" />
                                    <Text w='60%' mt='5' color="#000" fontSize="1rem" fontWeight="500" textAlign='center'>
                                        3. Aguarde a finalização da execução da transação
                                    </Text>
                                </Flex>

                                <Flex w={['100%', '100%', '60%']} mb={[10, 10, 0]} flexDir='column' alignItems='center'>
                                    <Image src={doneImage} alt="tag de preço" />
                                    <Text w='60%' mt='5' color="#000" fontSize="1rem" fontWeight="500" textAlign='center'>
                                        4. Veja o código hash do seu NFT
                                    </Text>
                                </Flex>
                            </Flex>
                        </Flex>

                        <Box w='100%' p='10' bgColor='#000'>
                            <Text color='#fff'>Todos os direitos reservados para Carlos e Rafael</Text>
                        </Box>
                    </Flex>
                </Box>
            </Box>
        </Box>
    )
}

export function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || '')

    if (cookies.token && cookies.token != 'undefined')
        return {
            redirect: {
                destination: '/home',
                permanent: false
            }
        }

    return {
        props: {}
    }
}