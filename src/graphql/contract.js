import { gql } from "@apollo/client"

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
                _id
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

const GET_ALL_CONTRACT_GROUP = gql`
    query allContracts($contractsInput: ContractsInput!) {
            contracts(contractsInput: $contractsInput) {
            message
            total
            data {
                _id,
                total,
                contractsByGroup {
                    _id,
                    title,
                    subtitle,
                    ipfsHash,
                    ethHash,
                    createdAt
                }
            }
        }
    }
`

const GET_CONTRACT_BY_ID = gql`
    query contract($_id: ID!) {
        contract(_id: $_id) {
            message
            total
            data {
                _id,
                title,
                subtitle,
                ipfsHash,
                ethHash,
                createdAt
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
    NEW_CONTRACT,
    UPDATE_CONTRACT,
    GET_ALL_CONTRACT,
    GET_ALL_CONTRACT_GROUP,
    GET_CONTRACT_BY_ID,
    GET_CONTRACT_FILE,
    SEND_CONTRACT
}