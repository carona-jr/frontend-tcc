import { gql } from "@apollo/client"

const GET_FIELDS = gql`
    query getFields($contractId: ID!) {
        fields(contractId: $contractId) {
                code,
                status
            message
            data {
            _id,
            order,
            text
            }
        }
    }
`

const ADD_FIELD = gql`
    mutation field($fieldInput: FieldInput!) {
        addField(fieldInput: $fieldInput) {
            code
            status
            message
        }
    }
`

const UPDATE_FIELD = gql`
    mutation field($fieldInput: FieldInput!) {
        updateField(fieldInput: $fieldInput) {
            code
            status
            message
        }
    }
`

export {
    GET_FIELDS,
    ADD_FIELD,
    UPDATE_FIELD
}