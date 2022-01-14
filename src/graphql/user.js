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
            credit
            reservedCredit
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
            credit
            reservedCredit
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
                credit
                reservedCredit
            }
        }
    }
`

const CREATE_USER = gql`
    mutation createUser($userInput: UserInput!) {
        createUser (userInput: $userInput) {
            status,
            code,
            message
        }
    }
`

const UPDATE_USER = gql`
    mutation updateUser($userInput: UserInput!) {
        updateUser (userInput: $userInput) {
            status,
            code,
            message
        }
    }  
`

export {
    ME,
    USER,
    FIND_USERS,
    CREATE_USER,
    UPDATE_USER
}