import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import cookie from 'cookie'

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_API_ENDPOINT
})

const authLink = setContext((_, { headers }) => {
    const cookies = cookie.parse(document.cookie || '')
    // get the authentication token from local storage if it exists
    const token = cookies.token
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token && token != 'undefined' ? `Bearer ${token}` : ""
        }
    }
})

export default new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
})