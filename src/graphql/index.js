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

const NEW_CONTRACT = gql`
    mutation contract($contractInput: ContractInput!) {
        createContract(contractInput: $contractInput) {
            code
            status
            message
            total
            data {
                title
            }
        }
    }
`

const UPDATE_CONTRACT = gql`
    mutation contract($updateContractInput: UpdateContractInput!) {
        updateContract(updateContractInput: $updateContractInput) {
            code
            status
            message
            total
            data {
                title,
                active
            }
        }
    }
`

const GET_ALL_CONTRACT = gql`
    query contracts($skip: Int, $limit: Int, $status: String) {
        contracts(skip: $skip, limit: $limit, status: $status){ 
            code
            status
            message
            total
            data {
                id
                title
                subtitle
                ipfsHash
                ethHash
                createdAt
                status
            }
        }
    }
`

const GET_CONTRACT_FILE = gql`
    query contractFile($contractId: ID!) {
        contractFile(contractId: $contractId)
    }
`

const SEND_CONTRACT = gql`
    mutation contract($contractId: ID!) {
        registerContract(contractId: $contractId)
    }
`

export {
    LOGIN,
    USER,
    ME,
    NEW_CONTRACT,
    GET_ALL_CONTRACT,
    GET_CONTRACT_FILE,
    SEND_CONTRACT,
    UPDATE_CONTRACT
}