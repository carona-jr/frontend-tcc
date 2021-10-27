import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

export const getApolloClient = ({ token }) => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            uri: process.env.NEXT_PUBLIC_API_ENDPOINT,
            fetch,
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        })
    })
}