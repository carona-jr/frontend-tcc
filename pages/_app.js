import '../styles/globals.css'
import { Provider } from 'react-redux'
import { Store } from '../src/store'
import { Chakra } from '../src/wrappers/chakra'
import apolloClient from '../lib/apolloClient'
import { ApolloProvider } from '@apollo/client'

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={Store}>
      <ApolloProvider client={apolloClient}>
        <Chakra cookies={pageProps.cookies}>
          <Component {...pageProps} />
        </Chakra>
      </ApolloProvider>
    </Provider>

  )
}

export default MyApp

export { getServerSideProps } from "../src/wrappers/chakra"