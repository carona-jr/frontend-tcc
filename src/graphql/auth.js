import { gql } from "@apollo/client"

const LOGIN = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                _id
                name
                email
                type
                document
                wallet
                address {
                    _id
                    street
                    number
                    zipcode
                    neighborhood
                    city
                    state
                    complement
                    active
                }
                phone {
                    _id
                    number
                    active
                }
                supervised {
                    _id
                }
                active
            }
        }
    }
`

export {
    LOGIN
}