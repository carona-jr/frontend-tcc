import '../styles/globals.css'
import { ChakraProvider } from "@chakra-ui/react"
import { Provider } from 'react-redux'
import { Store } from '../src/store'
import { Chakra } from "../src/wrappers/chakra"

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={Store}>
      <Chakra cookies={pageProps.cookies}>
        <Component {...pageProps} />
      </Chakra>
    </Provider>

  )
}

export default MyApp

export { getServerSideProps } from "../src/wrappers/chakra"