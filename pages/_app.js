import '../styles/globals.css'
import { Provider } from 'react-redux'
import { Store } from '../src/store'
import { Chakra } from '../src/wrappers/chakra'
import { ApolloProvider } from '@apollo/client'
import { CookiesProvider } from "react-cookie"
import apolloClient from '../lib/apolloClient'

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={Store}>
      <CookiesProvider>
        <ApolloProvider client={apolloClient}>
          <Chakra cookies={pageProps.cookies}>
            <Component {...pageProps} />
          </Chakra>
        </ApolloProvider>
      </CookiesProvider>
    </Provider>

  )
}

export default MyApp

export { getServerSideProps } from "../src/wrappers/chakra"