import { UPDATE_USER } from './actions'

const updateUser = value => ({
    type: UPDATE_USER,
    user: value
})

export {
    updateUser
}