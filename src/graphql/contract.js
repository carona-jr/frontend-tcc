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
                base64,
                active
            }
        }
    }
`

const GET_ALL_CONTRACT = gql`
    query contracts($contractsInput: ContractsInput!) {
        contracts(contractsInput: $contractsInput){ 
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
                gasPrice
                tax
                ethTxHash
                reservedValue
                realGasPrice
                transactionStatus
                ownerId {
                    _id
                    name
                }
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
                _id
                total
                contractsByGroup {
                    _id
                    title
                    subtitle
                    ipfsHash
                    ethHash
                    createdAt
                    ownerId {
                        _id
                        name
                    }
                    gasPrice
                    tax
                    ethTxHash
                    reservedValue
                    realGasPrice
                    transactionStatus
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
                _id
                title
                subtitle
                ipfsHash
                ethHash
                signers {
                    _id
                    userId
                    name
                    email
                    document
                    signerStatus
                    createdAt
                    updatedAt
                }
                createdAt
                ownerId {
                    _id
                    name
                }
                status
                gasPrice
                ethTxHash
                tax
                reservedValue
                realGasPrice
                transactionStatus
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

const NEW_SIGNER = gql`
    mutation newSigner($signerInput: SignerInput!) {
        setSigner(signerInput: $signerInput) {
            code
            data {
                signers {
                    name,
                    email,
                    document,
                    signerStatus,
                    createdAt,
                    updatedAt
                }
            }
        }
    }
`

const REMOVE_SIGNER = gql`
    mutation removeSigner($signId: ID!, $contractId: ID!) {
        removeSigner(signId: $signId, contractId: $contractId)
    }
`

const SIGN_CONTRACT = gql`
    mutation signContract($signContractInput: SignContractInput!) {
        signContract(signContractInput: $signContractInput)
    }
`

const ESTIMATE_CONTRACT = gql`
    mutation estimateContract($contractGenericInput: ContractGenericInput!) {
        estimateContract(contractGenericInput: $contractGenericInput) {
            status,
            code,
            message,
            data
        }
    }    
`

const UPDATE_SIGNER = gql`
    mutation updateSigner($signId: ID!, $signerInput: SignerInput!) {
        updateSigner(signId: $signId, signerInput: $signerInput)
    }
`

const UPDATE_TRANSACTION_STATUS = gql`
    mutation updateTransactionStatus($contractGenericInput: ContractGenericInput!) {
        updateTransactionStatus(contractGenericInput: $contractGenericInput) {
            status,
            code,
            message
        }
    }  
`

export {
    NEW_CONTRACT,
    UPDATE_CONTRACT,
    GET_ALL_CONTRACT,
    GET_ALL_CONTRACT_GROUP,
    GET_CONTRACT_BY_ID,
    GET_CONTRACT_FILE,
    SEND_CONTRACT,
    NEW_SIGNER,
    SIGN_CONTRACT,
    ESTIMATE_CONTRACT,
    REMOVE_SIGNER,
    UPDATE_SIGNER,
    UPDATE_TRANSACTION_STATUS
}