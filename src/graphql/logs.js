import { gql } from "@apollo/client"

const FIND_LOGS = gql`
    query findLogs($logInputs: LogInputs!) {
        findLogs(logInputs: $logInputs) {
            message
            total
            data {
                _id,
                description,
                updatedAt
            }
        }
    }
`

export {
    FIND_LOGS
}