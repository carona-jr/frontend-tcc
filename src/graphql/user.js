import { gql } from "@apollo/client"

const ME = gql`
    query me {
        me {
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
`

const USER = gql`
    query user($email: String!) {
        user(email: $email){ 
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
`

const FIND_USERS = gql`
    query findUsers($userInputs: UserInputs) {
        findUsers(userInputs:$userInputs) {
        status
        code
        message
        total
        data {
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
    ME,
    USER,
    FIND_USERS
}