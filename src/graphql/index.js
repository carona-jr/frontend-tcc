import { gql } from "@apollo/client";

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
                address {
                    _id
                    street
                    number
                    zipcode
                    neighborhood
                    complement
                    type
                    createdAt
                    updatedAt
                    active
                }
                phone {
                    _id
                    phone
                    type
                    active
                    createdAt
                    updatedAt
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