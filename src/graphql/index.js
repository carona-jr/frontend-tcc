import { LOGIN } from './auth'
import { USER, ME } from './user'
import { NEW_CONTRACT, GET_ALL_CONTRACT, GET_CONTRACT_FILE, SEND_CONTRACT, UPDATE_CONTRACT, GET_ALL_CONTRACT_GROUP, GET_CONTRACT_BY_ID } from './contract'
import { GET_FIELDS, ADD_FIELD, UPDATE_FIELD } from './field'

const ADD_CLAUSE = gql`
    mutation addField ($fieldInput: FieldInput) {
        addField(fieldInput: $fieldInput) {
            code
        }
    }
`

const GET_CLAUSES = gql`
    query fields($contractId: ID!) {
        fields (contractId: $contractId) {
            code
            status
            message
            data {
                _id
                text
            }
        }
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
    UPDATE_CONTRACT,
    GET_ALL_CONTRACT_GROUP,
    GET_CONTRACT_BY_ID,
    GET_CLAUSES,
    ADD_CLAUSE,
    GET_FIELDS,
    ADD_FIELD,
    UPDATE_FIELD
}